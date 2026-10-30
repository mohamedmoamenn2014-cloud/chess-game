import * as THREE from 'three';
import { PieceColor, PieceType } from '../types/chess';

// Shared materials cache to save draw calls and memory
let whiteMaterial: THREE.MeshStandardMaterial;
let blackMaterial: THREE.MeshStandardMaterial;
let goldAccentMaterial: THREE.MeshStandardMaterial;
let selectionGlowMaterial: THREE.MeshBasicMaterial;
let validMoveMarkerMaterial: THREE.MeshBasicMaterial;
let checkGlowMaterial: THREE.MeshBasicMaterial;
let lastMoveMaterial: THREE.MeshBasicMaterial;

export function initPieceMaterials() {
  if (!whiteMaterial) {
    whiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5efe6,
      roughness: 0.24,
      metalness: 0.08
    });

    blackMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1f23,
      roughness: 0.3,
      metalness: 0.2
    });

    goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5b842,
      roughness: 0.2,
      metalness: 0.85
    });

    selectionGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45
    });

    validMoveMarkerMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55
    });

    checkGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.6
    });

    lastMoveMaterial = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.3
    });
  }
}

// Procedural multi-part Staunton 3D pieces
export function createPieceMesh(type: PieceType, color: PieceColor): THREE.Group {
  initPieceMaterials();
  const group = new THREE.Group();
  const mat = color === 'w' ? whiteMaterial : blackMaterial;

  // 1. Common Pedestal Base (Bottom grounded at y = 0)
  const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.12, 24), mat);
  basePlinth.position.y = 0.06;
  basePlinth.castShadow = true;
  basePlinth.receiveShadow = true;
  group.add(basePlinth);

  const baseCollar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 12, 24), goldAccentMaterial);
  baseCollar.rotation.x = Math.PI / 2;
  baseCollar.position.y = 0.12;
  group.add(baseCollar);

  const baseTaper = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.14, 24), mat);
  baseTaper.position.y = 0.19;
  baseTaper.castShadow = true;
  group.add(baseTaper);

  // 2. Specific Silhouette Geometries for each piece type
  switch (type) {
    case 'p': {
      // Pawn
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.42, 20), mat);
      shaft.position.y = 0.47;
      shaft.castShadow = true;
      group.add(shaft);

      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20), goldAccentMaterial);
      collar.position.y = 0.70;
      group.add(collar);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), mat);
      head.position.y = 0.88;
      head.castShadow = true;
      group.add(head);
      break;
    }

    case 'r': {
      // Rook
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.30, 0.65, 20), mat);
      tower.position.y = 0.58;
      tower.castShadow = true;
      group.add(tower);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.10, 20), mat);
      rim.position.y = 0.95;
      rim.castShadow = true;
      group.add(rim);

      // 4 crenellations
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const crenel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.14), mat);
        crenel.position.set(Math.cos(angle) * 0.25, 1.05, Math.sin(angle) * 0.25);
        crenel.castShadow = true;
        group.add(crenel);
      }
      break;
    }

    case 'n': {
      // Knight (Sculpted Horse)
      const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.36, 16), mat);
      chest.position.set(0, 0.44, 0);
      group.add(chest);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.48, 0.36), mat);
      head.position.set(0, 0.74, 0.05);
      head.rotation.x = -0.25;
      head.castShadow = true;
      group.add(head);

      const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.32), mat);
      muzzle.position.set(0, 0.70, 0.26);
      muzzle.castShadow = true;
      group.add(muzzle);

      // Mane crest
      const mane = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.54, 0.16), goldAccentMaterial);
      mane.position.set(0, 0.82, -0.14);
      mane.rotation.x = 0.3;
      group.add(mane);

      // Ears
      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 8), mat);
      earL.position.set(0.09, 1.03, 0.02);
      group.add(earL);

      const earR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 8), mat);
      earR.position.set(-0.09, 1.03, 0.02);
      group.add(earR);

      // Face towards opponent
      group.rotation.y = color === 'w' ? 0 : Math.PI;
      break;
    }

    case 'b': {
      // Bishop
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.58, 20), mat);
      waist.position.y = 0.55;
      waist.castShadow = true;
      group.add(waist);

      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 12, 20), goldAccentMaterial);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.86;
      group.add(collar);

      const miter = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), mat);
      miter.scale.set(0.9, 1.4, 0.9);
      miter.position.y = 1.10;
      miter.castShadow = true;
      group.add(miter);

      const crossBall = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), goldAccentMaterial);
      crossBall.position.y = 1.42;
      group.add(crossBall);
      break;
    }

    case 'q': {
      // Queen
      const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.28, 0.72, 24), mat);
      waist.position.y = 0.62;
      waist.castShadow = true;
      group.add(waist);

      const coronetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.22, 0.24, 24), mat);
      coronetBase.position.y = 1.08;
      coronetBase.castShadow = true;
      group.add(coronetBase);

      const coronetRim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 12, 24), goldAccentMaterial);
      coronetRim.rotation.x = Math.PI / 2;
      coronetRim.position.y = 1.18;
      group.add(coronetRim);

      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), goldAccentMaterial);
      pearl.position.y = 1.30;
      group.add(pearl);
      break;
    }

    case 'k': {
      // King
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.30, 0.80, 24), mat);
      body.position.y = 0.66;
      body.castShadow = true;
      group.add(body);

      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.24, 0.26, 24), mat);
      crownBase.position.y = 1.18;
      crownBase.castShadow = true;
      group.add(crownBase);

      const crownRim = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.05, 12, 24), goldAccentMaterial);
      crownRim.rotation.x = Math.PI / 2;
      crownRim.position.y = 1.30;
      group.add(crownRim);

      // Cross finial
      const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.28, 0.07), goldAccentMaterial);
      crossV.position.y = 1.54;
      group.add(crossV);

      const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.07), goldAccentMaterial);
      crossH.position.y = 1.57;
      group.add(crossH);
      break;
    }
  }

  // Soft Contact shadow disc grounded below piece
  const shadowDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.44, 20),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.42, depthWrite: false })
  );
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = 0.005;
  group.add(shadowDisc);

  return group;
}

// Procedural Wood / Marble Texture for board
export function createBoardSquareTexture(isDark: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (isDark) {
    // Rich Walnut / Obsidian
    ctx.fillStyle = '#264a38'; // tournament emerald or deep luxury walnut
    ctx.fillRect(0, 0, 256, 256);
    // Subtle wood rings/veins
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(128, 128, 40 + i * 28, 60 + i * 32, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    // Light Maple / Ivory Marble
    ctx.fillStyle = '#edd6b0';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(210, 180, 140, 0.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(128 + i * 15, 128 - i * 10, 40 + i * 25, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
