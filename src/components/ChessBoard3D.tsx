import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Chess, Square } from 'chess.js';
import { PieceColor, PieceType } from '../types/chess';
import { createPieceMesh, createBoardSquareTexture } from '../services/chess3DModels';
import { Eye, RotateCw, Video, Compass } from 'lucide-react';

interface ChessBoard3DProps {
  game: Chess;
  isFlipped: boolean;
  onMove: (from: Square, to: Square, promotion?: PieceType) => boolean;
  lastMove: { from: Square; to: Square } | null;
  hintSquare: Square | null;
  disabled?: boolean;
}

interface PieceAnimation {
  mesh: THREE.Group;
  startX: number;
  startZ: number;
  targetX: number;
  targetZ: number;
  progress: number;
  duration: number;
}

export const ChessBoard3D: React.FC<ChessBoard3DProps> = ({
  game,
  isFlipped,
  onMove,
  lastMove,
  hintSquare,
  disabled = false
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square; color: PieceColor } | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'white' | 'black' | 'top'>('perspective');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);

  // References to keep render loop decoupled from React state updates
  const gameRef = useRef(game);
  gameRef.current = game;
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;
  const selectedSquareRef = useRef<Square | null>(null);
  selectedSquareRef.current = selectedSquare;
  const lastMoveRef = useRef(lastMove);
  lastMoveRef.current = lastMove;
  const isFlippedRef = useRef(isFlipped);
  isFlippedRef.current = isFlipped;
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Scene objects refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tilesGroupRef = useRef<THREE.Group | null>(null);
  const piecesMapRef = useRef<Map<string, THREE.Group>>(new Map());
  const highlightsGroupRef = useRef<THREE.Group | null>(null);
  const animationsRef = useRef<PieceAnimation[]>([]);

  // Camera target pos
  const targetCamPos = useRef(new THREE.Vector3(0, 8.5, 7.8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Convert chess square ('e4') to 3D board coordinates (x, z)
  const squareToCoords = (square: string): { x: number; z: number } => {
    const col = square.charCodeAt(0) - 97; // a=0, h=7
    const row = parseInt(square[1], 10) - 1; // 1=0, 8=7
    // Center of board is (0,0), square size is 1.0 unit
    const x = col - 3.5;
    const z = 3.5 - row;
    return { x, z };
  };

  // Convert 3D coordinates (x, z) back to square ('e4')
  const coordsToSquare = (x: number, z: number): Square | null => {
    const col = Math.round(x + 3.5);
    const row = Math.round(3.5 - z);
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    const file = String.fromCharCode(97 + col);
    const rank = row + 1;
    return `${file}${rank}` as Square;
  };

  // Initialize Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 500;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Scene, Camera & Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x09090b);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 7.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 3. Studio Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff5eb, 0x1e293b, 0.7);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.4);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    rimLight.position.set(-6, 8, -8);
    scene.add(rimLight);

    // 5. Board Plinth & Frame
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // Outer Mahogany Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e1511,
      roughness: 0.35,
      metalness: 0.1
    });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.4, 9.6), frameMat);
    frame.position.y = -0.21;
    frame.receiveShadow = true;
    boardGroup.add(frame);

    // Brass Inlay Border
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.2,
      metalness: 0.8
    });
    const brassBorder = new THREE.Mesh(new THREE.BoxGeometry(8.25, 0.03, 8.25), brassMat);
    brassBorder.position.y = -0.01;
    boardGroup.add(brassBorder);

    // 6. 64 Tiles Grid
    const tilesGroup = new THREE.Group();
    boardGroup.add(tilesGroup);
    tilesGroupRef.current = tilesGroup;

    const lightTex = createBoardSquareTexture(false);
    const darkTex = createBoardSquareTexture(true);

    const lightMat = new THREE.MeshStandardMaterial({
      map: lightTex,
      roughness: 0.32,
      metalness: 0.05
    });
    const darkMat = new THREE.MeshStandardMaterial({
      map: darkTex,
      roughness: 0.38,
      metalness: 0.08
    });

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        const tile = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1), isDark ? darkMat : lightMat);
        const file = String.fromCharCode(97 + c);
        const rank = r + 1;
        const squareKey = `${file}${rank}` as Square;
        tile.name = `tile_${squareKey}`;
        tile.userData = { square: squareKey };
        tile.position.set(c - 3.5, 0, 3.5 - r);
        tile.receiveShadow = true;
        tilesGroup.add(tile);
      }
    }

    // 7. Dynamic Highlights Group
    const highlightsGroup = new THREE.Group();
    scene.add(highlightsGroup);
    highlightsGroupRef.current = highlightsGroup;

    // 8. Raycasting & Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = false;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevMouseX;
      const dy = clientY - prevMouseY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDragging = true;
      }

      // Orbit camera on drag with Right Click or Shift+Click or Touch
      const isRightClick = 'button' in e && e.button === 2;
      const isTouch = 'touches' in e;
      if ((isRightClick || isTouch) && isDragging) {
        const angle = -dx * 0.006;
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.lookAt(targetLookAt.current);
        prevMouseX = clientX;
        prevMouseY = clientY;
      }
    };

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (isDragging) return;
      if (disabledRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(tilesGroup.children);

      if (intersects.length > 0) {
        const hitTile = intersects[0].object;
        const square = hitTile.userData?.square as Square;
        if (square) {
          handle3DSquareClick(square);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    dom.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    dom.addEventListener('touchend', onPointerUp, { passive: true });

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // 10. Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera interpolation towards target
      camera.position.lerp(targetCamPos.current, 0.06);
      camera.lookAt(targetLookAt.current);

      // Auto-rotate if toggled
      if (autoRotateRef.current) {
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.005);
        camera.lookAt(targetLookAt.current);
      }

      // Update piece animations (lifts piece up in arc and moves to target)
      if (animationsRef.current.length > 0) {
        for (let i = animationsRef.current.length - 1; i >= 0; i--) {
          const anim = animationsRef.current[i];
          anim.progress += delta / anim.duration;
          if (anim.progress >= 1) {
            anim.mesh.position.set(anim.targetX, 0, anim.targetZ);
            animationsRef.current.splice(i, 1);
          } else {
            const t = anim.progress;
            const curX = anim.startX + (anim.targetX - anim.startX) * t;
            const curZ = anim.startZ + (anim.targetZ - anim.startZ) * t;
            // Parabolic arc for smooth lifting
            const curY = Math.sin(t * Math.PI) * 1.1;
            anim.mesh.position.set(curX, curY, curZ);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      dom.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      dom.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  // Update camera preset positions
  useEffect(() => {
    if (cameraPreset === 'perspective') {
      targetCamPos.current.set(isFlipped ? 0 : 0, 8.2, isFlipped ? -7.8 : 7.8);
      targetLookAt.current.set(0, 0, 0);
    } else if (cameraPreset === 'white') {
      targetCamPos.current.set(0, 6.8, 7.2);
      targetLookAt.current.set(0, 0, 0);
    } else if (cameraPreset === 'black') {
      targetCamPos.current.set(0, 6.8, -7.2);
      targetLookAt.current.set(0, 0, 0);
    } else if (cameraPreset === 'top') {
      targetCamPos.current.set(0, 11.5, 0.01);
      targetLookAt.current.set(0, 0, 0);
    }
  }, [cameraPreset, isFlipped]);

  // Synchronize 3D Pieces on Board with Chess Game State
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const board = game.board();
    const currentPieces = piecesMapRef.current;
    const newPiecesMap = new Map<string, THREE.Group>();

    // Clear previous pieces not in new position
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        const file = String.fromCharCode(97 + c);
        const rank = 8 - r;
        const squareKey = `${file}${rank}` as Square;
        const targetPos = squareToCoords(squareKey);

        if (piece) {
          const pieceId = `${piece.color}_${piece.type}_${squareKey}`;
          let mesh = currentPieces.get(squareKey);

          // If no mesh or piece type changed (e.g. pawn promoted)
          if (!mesh || mesh.userData.type !== piece.type || mesh.userData.color !== piece.color) {
            if (mesh) scene.remove(mesh);
            mesh = createPieceMesh(piece.type, piece.color as PieceColor);
            mesh.userData = { type: piece.type, color: piece.color, square: squareKey };
            scene.add(mesh);

            // Animate entry if last move moved to this square
            if (lastMove && lastMove.to === squareKey) {
              const startCoords = squareToCoords(lastMove.from);
              mesh.position.set(startCoords.x, 0, startCoords.z);
              animationsRef.current.push({
                mesh,
                startX: startCoords.x,
                startZ: startCoords.z,
                targetX: targetPos.x,
                targetZ: targetPos.z,
                progress: 0,
                duration: 0.35
              });
            } else {
              mesh.position.set(targetPos.x, 0, targetPos.z);
            }
          } else {
            // Existing mesh
            mesh.position.set(targetPos.x, 0, targetPos.z);
          }

          newPiecesMap.set(squareKey, mesh);
        }
      }
    }

    // Remove leftover pieces
    currentPieces.forEach((mesh, sq) => {
      if (!newPiecesMap.has(sq)) {
        scene.remove(mesh);
      }
    });

    piecesMapRef.current = newPiecesMap;
  }, [game, lastMove]);

  // Update 3D Highlights (Selected square, Legal moves, Check, Last move trail)
  useEffect(() => {
    const group = highlightsGroupRef.current;
    if (!group) return;

    // Clear old highlights
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // 1. Highlight Last Move
    if (lastMove) {
      [lastMove.from, lastMove.to].forEach((sq) => {
        const pos = squareToCoords(sq);
        const marker = new THREE.Mesh(
          new THREE.PlaneGeometry(0.96, 0.96),
          new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.32, depthWrite: false })
        );
        marker.rotation.x = -Math.PI / 2;
        marker.position.set(pos.x, 0.026, pos.z);
        group.add(marker);
      });
    }

    // 2. Highlight King in Check
    if (game.inCheck()) {
      const turn = game.turn();
      const board = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === turn) {
            const sq = `${String.fromCharCode(97 + c)}${8 - r}`;
            const pos = squareToCoords(sq);
            const redGlow = new THREE.Mesh(
              new THREE.CircleGeometry(0.55, 24),
              new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75, depthWrite: false })
            );
            redGlow.rotation.x = -Math.PI / 2;
            redGlow.position.set(pos.x, 0.028, pos.z);
            group.add(redGlow);
          }
        }
      }
    }

    // 3. Highlight Selected Square
    if (selectedSquare) {
      const pos = squareToCoords(selectedSquare);
      const selMarker = new THREE.Mesh(
        new THREE.PlaneGeometry(0.96, 0.96),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.55, depthWrite: false })
      );
      selMarker.rotation.x = -Math.PI / 2;
      selMarker.position.set(pos.x, 0.03, pos.z);
      group.add(selMarker);

      // Legal Moves Indicators
      const legalMoves = game.moves({ square: selectedSquare, verbose: true });
      legalMoves.forEach((m) => {
        const destPos = squareToCoords(m.to);
        const hasPiece = game.get(m.to as Square);

        if (hasPiece) {
          // Capture Ring
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.32, 0.44, 24),
            new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.8, depthWrite: false })
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(destPos.x, 0.032, destPos.z);
          group.add(ring);
        } else {
          // Move Dot
          const dot = new THREE.Mesh(
            new THREE.CircleGeometry(0.18, 16),
            new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.75, depthWrite: false })
          );
          dot.rotation.x = -Math.PI / 2;
          dot.position.set(destPos.x, 0.032, destPos.z);
          group.add(dot);
        }
      });
    }

    // 4. Highlight Hint Square
    if (hintSquare) {
      const pos = squareToCoords(hintSquare);
      const hintRing = new THREE.Mesh(
        new THREE.RingGeometry(0.36, 0.48, 24),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9, depthWrite: false })
      );
      hintRing.rotation.x = -Math.PI / 2;
      hintRing.position.set(pos.x, 0.035, pos.z);
      group.add(hintRing);
    }
  }, [selectedSquare, game, lastMove, hintSquare]);

  // Click handler for 3D tiles
  const handle3DSquareClick = (squareKey: Square) => {
    const curGame = gameRef.current;
    const turn = curGame.turn();
    const currentSelected = selectedSquareRef.current;

    if (!currentSelected) {
      const piece = curGame.get(squareKey);
      if (piece && piece.color === turn) {
        setSelectedSquare(squareKey);
      }
    } else {
      const legalMoves = curGame.moves({ square: currentSelected, verbose: true });
      const targetMove = legalMoves.find((m) => m.to === squareKey);

      if (targetMove) {
        // Check for promotion
        const piece = curGame.get(currentSelected);
        const isPromotion =
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && squareKey.endsWith('8')) ||
            (piece.color === 'b' && squareKey.endsWith('1')));

        if (isPromotion) {
          setPendingPromotion({ from: currentSelected, to: squareKey, color: piece.color });
          return;
        }

        onMoveRef.current(currentSelected, squareKey);
        setSelectedSquare(null);
      } else {
        const piece = curGame.get(squareKey);
        if (piece && piece.color === turn) {
          setSelectedSquare(squareKey);
        } else {
          setSelectedSquare(null);
        }
      }
    }
  };

  const handlePromotionSelect = (pType: PieceType) => {
    if (pendingPromotion) {
      onMoveRef.current(pendingPromotion.from, pendingPromotion.to, pType);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[440px] sm:max-w-[470px] rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="chess-3d-canvas-wrap w-full h-full" />

      {/* Floating 3D Camera Controls Toolbar */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-800 shadow-xl z-20">
        <button
          onClick={() => setCameraPreset('perspective')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            cameraPreset === 'perspective'
              ? 'bg-amber-500 text-zinc-950 shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="3D Perspective Angle"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">3D</span>
        </button>

        <button
          onClick={() => setCameraPreset('top')}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            cameraPreset === 'top'
              ? 'bg-amber-500 text-zinc-950 shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Tactical Top-Down View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Top</span>
        </button>

        <button
          onClick={() => setAutoRotate((r) => !r)}
          className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
            autoRotate
              ? 'bg-emerald-500 text-zinc-950 shadow'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title="Cinematic Orbit"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Orbit</span>
        </button>
      </div>

      {/* Control Hint Line */}
      <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none select-none z-10">
        <span className="text-[10px] tracking-wider text-zinc-400/80 bg-zinc-950/70 px-2.5 py-1 rounded-full border border-zinc-800/80 shadow-md">
          Right Click / Touch Drag to Orbit · Click to Move
        </span>
      </div>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 p-5 rounded-2xl shadow-2xl text-center max-w-[280px] w-full">
            <h4 className="text-sm font-bold text-amber-400 mb-3">Choose Promotion Piece</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionSelect(pType)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-800 hover:bg-amber-500/20 hover:border-amber-500 border border-zinc-700 transition-all font-bold text-lg active:scale-95"
                >
                  {pType === 'q' ? '♛' : pType === 'r' ? '♜' : pType === 'b' ? '♝' : '♞'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
