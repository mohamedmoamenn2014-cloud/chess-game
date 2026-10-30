import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import {
  GameMode,
  GameVariant,
  ComputerDifficulty,
  BoardTheme,
  TimeControl,
  PieceColor,
  PieceType,
  ChatMessage,
  OpeningInfo
} from './types/chess';
import { soundService } from './services/sound';
import { evaluateBoard, getEngineMove } from './services/chessEngine';
import { identifyOpening } from './services/openings';
import { generateChess960FEN, checkKOTHWin } from './services/chessVariants';
import { webRTCService } from './services/webrtcOnline';
import { ChessBoard } from './components/ChessBoard';
import { ChessBoard3D } from './components/ChessBoard3D';
import { GameClock } from './components/GameClock';
import { CapturedPieces } from './components/CapturedPieces';
import { MoveHistory } from './components/MoveHistory';
import { AnalysisPanel } from './components/AnalysisPanel';
import { PuzzlesView } from './components/PuzzlesView';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { SettingsModal } from './components/SettingsModal';
import { GameVariantsModal } from './components/GameVariantsModal';
import { PocketDevExportModal } from './components/PocketDevExportModal';
import confetti from 'canvas-confetti';
import {
  Swords,
  Users,
  Bot,
  Wifi,
  Puzzle,
  RotateCcw,
  Flag,
  Trophy,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Box,
  Download
} from 'lucide-react';

const TIME_CONTROLS: TimeControl[] = [
  { id: 'bullet_1_0', name: 'Bullet 1+0', nameAr: 'Bullet 1+0', category: 'bullet', timeSeconds: 60, increment: 0 },
  { id: 'bullet_2_1', name: 'Bullet 2+1', nameAr: 'Bullet 2+1', category: 'bullet', timeSeconds: 120, increment: 1 },
  { id: 'blitz_3_0', name: 'Blitz 3+0', nameAr: 'Blitz 3+0', category: 'blitz', timeSeconds: 180, increment: 0 },
  { id: 'blitz_3_2', name: 'Blitz 3+2', nameAr: 'Blitz 3+2', category: 'blitz', timeSeconds: 180, increment: 2 },
  { id: 'blitz_5_3', name: 'Blitz 5+3', nameAr: 'Blitz 5+3', category: 'blitz', timeSeconds: 300, increment: 3 },
  { id: 'rapid_10_0', name: 'Rapid 10+0', nameAr: 'Rapid 10+0', category: 'rapid', timeSeconds: 600, increment: 0 },
  { id: 'rapid_15_10', name: 'Rapid 15+10', nameAr: 'Rapid 15+10', category: 'rapid', timeSeconds: 900, increment: 10 },
  { id: 'classical_30_0', name: 'Classical 30+0', nameAr: 'Classical 30+0', category: 'classical', timeSeconds: 1800, increment: 0 },
  { id: 'unlimited', name: 'Unlimited', nameAr: 'Unlimited', category: 'unlimited', timeSeconds: 0, increment: 0 }
];

export default function App() {
  // Core chess instance
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [gameMode, setGameMode] = useState<GameMode>('vs_computer');
  const [variant, setVariant] = useState<GameVariant>('standard');
  const [difficulty, setDifficulty] = useState<ComputerDifficulty>('medium');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('emerald');
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [view3D, setView3D] = useState(true); // 3D Board by default
  const [soundMuted, setSoundMuted] = useState(soundService.getMuted());
  const [soundVolume, setSoundVolume] = useState(soundService.getVolume());

  // Time control & clock state
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[5]); // default Rapid 10+0
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [clockRunning, setClockRunning] = useState(false);

  // Move tracking & state
  const [history, setHistory] = useState<string[]>([]);
  const [viewHistoryIndex, setViewHistoryIndex] = useState(-1);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [capturedWhite, setCapturedWhite] = useState<PieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceType[]>([]);
  const [evalScore, setEvalScore] = useState<number>(0);
  const [opening, setOpening] = useState<OpeningInfo | null>(null);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [hintSan, setHintSan] = useState<string>('');
  const [hintLoading, setHintLoading] = useState(false);
  const [copiedType, setCopiedType] = useState<'pgn' | 'fen' | null>(null);

  // Variant trackers
  const [threeCheckWhiteCount, setThreeCheckWhiteCount] = useState(0);
  const [threeCheckBlackCount, setThreeCheckBlackCount] = useState(0);

  // Online P2P state
  const [onlineConnected, setOnlineConnected] = useState(false);
  const [isOnlineHost, setIsOnlineHost] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [myOnlineColor, setMyOnlineColor] = useState<PieceColor>('w');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVariantsOpen, setIsVariantsOpen] = useState(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [gameOverModal, setGameOverModal] = useState<{ isOpen: boolean; title: string; subtitle: string; winner?: PieceColor | 'draw' }>({
    isOpen: false,
    title: '',
    subtitle: ''
  });

  const clockIntervalRef = useRef<any>(null);

  // Calculate material difference
  const calculateMaterialAdvantage = () => {
    const weights: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const whiteSum = capturedBlack.reduce((acc, p) => acc + (weights[p] || 0), 0);
    const blackSum = capturedWhite.reduce((acc, p) => acc + (weights[p] || 0), 0);
    return {
      whiteAdvantage: Math.max(0, whiteSum - blackSum),
      blackAdvantage: Math.max(0, blackSum - whiteSum)
    };
  };

  const { whiteAdvantage, blackAdvantage } = calculateMaterialAdvantage();

  // Reset/Start new game
  const startNewGame = useCallback((newVariant: GameVariant = variant, newFen?: string) => {
    let newGameInstance: Chess;
    if (newVariant === 'chess960') {
      const fen960 = newFen || generateChess960FEN();
      newGameInstance = new Chess(fen960);
    } else {
      newGameInstance = new Chess();
    }

    setGame(newGameInstance);
    setHistory([]);
    setViewHistoryIndex(-1);
    setLastMove(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setEvalScore(0);
    setOpening(null);
    setHintSquare(null);
    setHintSan('');
    setThreeCheckWhiteCount(0);
    setThreeCheckBlackCount(0);
    setWhiteTime(timeControl.timeSeconds);
    setBlackTime(timeControl.timeSeconds);
    setClockRunning(false);
    setGameOverModal({ isOpen: false, title: '', subtitle: '' });
  }, [variant, timeControl.timeSeconds]);

  // Handle Game Clock countdown
  useEffect(() => {
    if (!clockRunning || timeControl.category === 'unlimited') {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      return;
    }

    clockIntervalRef.current = setInterval(() => {
      const turn = game.turn();
      if (turn === 'w') {
        setWhiteTime((t) => {
          if (t <= 1) {
            handleTimeout('w');
            return 0;
          }
          if (t === 10) soundService.playLowTime();
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            handleTimeout('b');
            return 0;
          }
          if (t === 10) soundService.playLowTime();
          return t - 1;
        });
      }
    }, 1000);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [clockRunning, game, timeControl.category]);

  const handleTimeout = (loserColor: PieceColor) => {
    setClockRunning(false);
    soundService.playDefeat();
    const winner = loserColor === 'w' ? 'b' : 'w';
    setGameOverModal({
      isOpen: true,
      title: loserColor === 'w' ? 'White ran out of time! ⏱️' : 'Black ran out of time! ⏱️',
      subtitle: loserColor === 'w' ? 'Black wins on time' : 'White wins on time',
      winner
    });
  };

  // Check Game Endings & Variants
  const checkGameOverConditions = (currentGame: Chess, lastMoveTo?: string): boolean => {
    // 1. King of the Hill condition
    if (variant === 'king_of_the_hill' && lastMoveTo) {
      const kothWinner = checkKOTHWin(currentGame, lastMoveTo);
      if (kothWinner) {
        soundService.playVictory();
        setClockRunning(false);
        setGameOverModal({
          isOpen: true,
          title: kothWinner === 'w' ? 'White conquered the hill! 👑' : 'Black conquered the hill! 👑',
          subtitle: 'The King has reached the center (d4, e4, d5, e5)',
          winner: kothWinner
        });
        confetti({ particleCount: 60, spread: 70 });
        return true;
      }
    }

    // 2. Three-Check condition
    if (variant === 'three_check' && currentGame.inCheck()) {
      const checker = currentGame.turn() === 'w' ? 'b' : 'w';
      if (checker === 'w') {
        const next = threeCheckWhiteCount + 1;
        setThreeCheckWhiteCount(next);
        if (next >= 3) {
          soundService.playVictory();
          setClockRunning(false);
          setGameOverModal({
            isOpen: true,
            title: 'White wins by Three Checks! ⚡',
            subtitle: 'Delivered 3 decisive checks against opponent king',
            winner: 'w'
          });
          confetti({ particleCount: 60, spread: 70 });
          return true;
        }
      } else {
        const next = threeCheckBlackCount + 1;
        setThreeCheckBlackCount(next);
        if (next >= 3) {
          soundService.playVictory();
          setClockRunning(false);
          setGameOverModal({
            isOpen: true,
            title: 'Black wins by Three Checks! ⚡',
            subtitle: 'Delivered 3 decisive checks against opponent king',
            winner: 'b'
          });
          confetti({ particleCount: 60, spread: 70 });
          return true;
        }
      }
    }

    // 3. Official FIDE Game Endings
    if (currentGame.isCheckmate()) {
      soundService.playVictory();
      setClockRunning(false);
      const winner = currentGame.turn() === 'w' ? 'b' : 'w';
      setGameOverModal({
        isOpen: true,
        title: winner === 'w' ? 'Checkmate! White wins! 🏆' : 'Checkmate! Black wins! 🏆',
        subtitle: 'Decisive checkmate victory',
        winner
      });
      confetti({ particleCount: 80, spread: 80 });
      return true;
    }

    if (currentGame.isDraw()) {
      soundService.playDefeat();
      setClockRunning(false);
      let reason = 'Draw by agreement';
      if (currentGame.isStalemate()) reason = 'Draw by stalemate (no legal moves)';
      else if (currentGame.isThreefoldRepetition()) reason = 'Draw by threefold repetition of position';
      else if (currentGame.isInsufficientMaterial()) reason = 'Draw by insufficient material to checkmate';

      setGameOverModal({
        isOpen: true,
        title: 'Game Drawn 🤝',
        subtitle: reason,
        winner: 'draw'
      });
      return true;
    }

    return false;
  };

  // Perform Chess Move
  const handleMove = (from: Square, to: Square, promotion?: PieceType): boolean => {
    if (gameMode === 'online_p2p' && onlineConnected) {
      if (game.turn() !== myOnlineColor) return false;
    }

    if (gameMode === 'vs_computer' && game.turn() === 'b') {
      return false;
    }

    try {
      const move = game.move({
        from,
        to,
        promotion: promotion || 'q'
      });

      if (!move) return false;

      if (!clockRunning && timeControl.category !== 'unlimited') {
        setClockRunning(true);
      }

      if (timeControl.increment > 0) {
        if (move.color === 'w') {
          setWhiteTime((t) => t + timeControl.increment);
        } else {
          setBlackTime((t) => t + timeControl.increment);
        }
      }

      if (move.captured) {
        soundService.playCapture();
        if (move.color === 'w') {
          setCapturedBlack((prev) => [...prev, move.captured as PieceType]);
        } else {
          setCapturedWhite((prev) => [...prev, move.captured as PieceType]);
        }
      } else if (move.flags.includes('k') || move.flags.includes('q')) {
        soundService.playCastle();
      } else {
        soundService.playMove();
      }

      if (game.inCheck()) {
        soundService.playCheck();
      }

      const nextGame = new Chess(game.fen());
      setGame(nextGame);
      setLastMove({ from, to });
      const newHistory = [...history, move.san];
      setHistory(newHistory);
      setViewHistoryIndex(newHistory.length - 1);
      setHintSquare(null);
      setHintSan('');

      const scoreCentipawns = evaluateBoard(nextGame);
      setEvalScore(scoreCentipawns / 100);
      const recognized = identifyOpening(newHistory);
      if (recognized) setOpening(recognized);

      const ended = checkGameOverConditions(nextGame, to);

      if (gameMode === 'online_p2p' && onlineConnected) {
        webRTCService.sendMessage({
          type: 'MOVE',
          payload: { from, to, promotion: promotion || 'q', fen: nextGame.fen() }
        });
      }

      if (gameMode === 'vs_computer' && !ended && nextGame.turn() === 'b') {
        setTimeout(async () => {
          const aiResult = await getEngineMove(nextGame.fen(), difficulty);
          if (aiResult.san) {
            handleAIMove(aiResult.from as Square, aiResult.to as Square);
          }
        }, 300);
      }

      return true;
    } catch (e) {
      return false;
    }
  };

  // Handle AI Move Execution
  const handleAIMove = (from: Square, to: Square) => {
    try {
      const move = game.move({ from, to, promotion: 'q' });
      if (!move) return;

      if (timeControl.increment > 0) {
        setBlackTime((t) => t + timeControl.increment);
      }

      if (move.captured) {
        soundService.playCapture();
        setCapturedWhite((prev) => [...prev, move.captured as PieceType]);
      } else if (move.flags.includes('k') || move.flags.includes('q')) {
        soundService.playCastle();
      } else {
        soundService.playMove();
      }

      if (game.inCheck()) {
        soundService.playCheck();
      }

      const nextGame = new Chess(game.fen());
      setGame(nextGame);
      setLastMove({ from, to });
      const newHistory = [...history, move.san];
      setHistory(newHistory);
      setViewHistoryIndex(newHistory.length - 1);

      const scoreCentipawns = evaluateBoard(nextGame);
      setEvalScore(scoreCentipawns / 100);
      const recognized = identifyOpening(newHistory);
      if (recognized) setOpening(recognized);

      checkGameOverConditions(nextGame, to);
    } catch (e) {}
  };

  // PeerJS WebRTC message listener
  useEffect(() => {
    const unsub = webRTCService.onMessage((msg) => {
      if (msg.type === 'MOVE') {
        const { from, to, promotion } = msg.payload;
        try {
          const move = game.move({ from, to, promotion });
          if (move) {
            if (move.captured) {
              soundService.playCapture();
              if (move.color === 'w') setCapturedBlack((p) => [...p, move.captured as PieceType]);
              else setCapturedWhite((p) => [...p, move.captured as PieceType]);
            } else {
              soundService.playMove();
            }
            if (game.inCheck()) soundService.playCheck();

            const next = new Chess(game.fen());
            setGame(next);
            setLastMove({ from, to });
            const newHist = [...history, move.san];
            setHistory(newHist);
            setViewHistoryIndex(newHist.length - 1);
            checkGameOverConditions(next, to);
          }
        } catch (e) {}
      } else if (msg.type === 'CHAT') {
        setChatMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            sender: 'Opponent',
            text: msg.payload.text,
            timestamp: msg.timestamp
          }
        ]);
        soundService.playNotify();
      } else if (msg.type === 'DRAW_OFFER') {
        if (confirm('Opponent offered a draw. Do you accept?')) {
          webRTCService.sendMessage({ type: 'DRAW_ACCEPT' });
          setGameOverModal({
            isOpen: true,
            title: 'Draw Agreed 🤝',
            subtitle: 'Both players mutually agreed to end in a draw',
            winner: 'draw'
          });
        } else {
          webRTCService.sendMessage({ type: 'DRAW_REJECT' });
        }
      } else if (msg.type === 'DRAW_ACCEPT') {
        setGameOverModal({
          isOpen: true,
          title: 'Draw Accepted 🤝',
          subtitle: 'The game ended in an agreed draw',
          winner: 'draw'
        });
      } else if (msg.type === 'RESIGN') {
        soundService.playVictory();
        setGameOverModal({
          isOpen: true,
          title: 'Opponent Resigned! You Win 🏆',
          subtitle: 'Your opponent declared resignation',
          winner: myOnlineColor
        });
        confetti({ particleCount: 70, spread: 80 });
      }
    });

    const unsubConn = webRTCService.onConnectionChange((connected) => {
      setOnlineConnected(connected);
      if (connected) {
        setIsOnlineModalOpen(false);
      }
    });

    return () => {
      unsub();
      unsubConn();
    };
  }, [game, history, myOnlineColor]);

  // Request best move hint
  const handleRequestHint = async () => {
    if (game.isGameOver()) return;
    setHintLoading(true);
    const result = await getEngineMove(game.fen(), 'master');
    setHintLoading(false);
    if (result.san) {
      setHintSan(result.san);
      setHintSquare(result.from as Square);
    }
  };

  const handleCopyPGN = async () => {
    await navigator.clipboard.writeText(game.pgn() || '1. e4');
    setCopiedType('pgn');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyFEN = async () => {
    await navigator.clipboard.writeText(game.fen());
    setCopiedType('fen');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleTakeback = () => {
    if (history.length === 0) return;
    game.undo();
    if (gameMode === 'vs_computer') game.undo();
    const nextGame = new Chess(game.fen());
    setGame(nextGame);
    const newHistory = history.slice(0, gameMode === 'vs_computer' ? -2 : -1);
    setHistory(newHistory);
    setViewHistoryIndex(newHistory.length - 1);
    setLastMove(null);
    setHintSquare(null);
    setHintSan('');
    soundService.playMove();
  };

  const handleResign = () => {
    if (confirm('Are you sure you want to resign this match?')) {
      const winner = game.turn() === 'w' ? 'b' : 'w';
      soundService.playDefeat();
      setGameOverModal({
        isOpen: true,
        title: game.turn() === 'w' ? 'White resigned. Black wins!' : 'Black resigned. White wins!',
        subtitle: 'Game concluded by resignation',
        winner
      });
      if (gameMode === 'online_p2p' && onlineConnected) {
        webRTCService.sendMessage({ type: 'RESIGN' });
      }
    }
  };

  const handleOfferDraw = () => {
    if (gameMode === 'online_p2p' && onlineConnected) {
      webRTCService.sendMessage({ type: 'DRAW_OFFER' });
      alert('Draw offer sent to opponent...');
    } else {
      if (confirm('Do both players agree to a mutual draw?')) {
        setGameOverModal({
          isOpen: true,
          title: 'Agreed Draw 🤝',
          subtitle: 'Both players agreed to conclude the match',
          winner: 'draw'
        });
      }
    }
  };

  const handleSendChatMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'You',
      text,
      timestamp: Date.now()
    };
    setChatMessages((prev) => [...prev, newMsg]);
    if (onlineConnected) {
      webRTCService.sendMessage({
        type: 'CHAT',
        payload: { text }
      });
    }
  };

  const handleNavigateHistory = (index: number) => {
    setViewHistoryIndex(index);
    if (index === -1) {
      setGame(new Chess(variant === 'chess960' ? generateChess960FEN() : undefined));
    } else {
      const tempGame = new Chess(variant === 'chess960' ? generateChess960FEN() : undefined);
      for (let i = 0; i <= index; i++) {
        tempGame.move(history[i]);
      }
      setGame(tempGame);
    }
  };

  const handleToggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    soundService.setMuted(next);
  };

  const handleChangeVolume = (vol: number) => {
    setSoundVolume(vol);
    soundService.setVolume(vol);
  };

  const getGameStatusText = () => {
    if (game.isCheckmate()) {
      return game.turn() === 'w' ? 'Checkmate! Black wins' : 'Checkmate! White wins';
    }
    if (game.isDraw()) {
      return 'Game drawn';
    }
    if (game.inCheck()) {
      return game.turn() === 'w' ? 'White is in Check!' : 'Black is in Check!';
    }
    return game.turn() === 'w' ? 'White to move ⚪' : 'Black to move ⚫';
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-500 selection:text-black">
      {/* Top Luxury Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-3 flex items-center justify-between gap-3 flex-wrap shadow-xl">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-amber-500/25 ring-1 ring-amber-400/40">
            ♞
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-zinc-100 leading-tight font-heading">
              PRO CHESS MASTER
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">
                3D Grandmaster Edition
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <button
            onClick={() => {
              setGameMode('vs_computer');
              startNewGame();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'vs_computer'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>vs AI</span>
          </button>

          <button
            onClick={() => {
              setGameMode('pass_and_play');
              startNewGame();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'pass_and_play'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Pass & Play</span>
          </button>

          <button
            onClick={() => {
              setGameMode('online_p2p');
              setIsOnlineModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'online_p2p'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Online P2P</span>
          </button>

          <button
            onClick={() => setGameMode('puzzles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'puzzles'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
            }`}
          >
            <Puzzle className="w-4 h-4" />
            <span>Puzzles</span>
          </button>

          <button
            onClick={() => setIsVariantsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900/90 hover:bg-zinc-800 text-purple-300 border border-purple-500/30"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Variants</span>
          </button>
        </div>

        {/* Right Tools: View 3D Toggle, Sound, Settings */}
        <div className="flex items-center gap-2">
          {/* 3D vs 2D Board Switcher */}
          <button
            onClick={() => setView3D((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              view3D
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
            }`}
            title="Toggle between 3D Studio and 2D Board"
          >
            {view3D ? <Box className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            <span>{view3D ? '3D View' : '2D View'}</span>
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title={soundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Download ZIP Package Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 transition-all shadow-sm active:scale-95"
            title="تحميل ملف ZIP الكامل للعبة"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">تحميل ZIP اللعبة</span>
            <span className="sm:hidden">ZIP</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title="Game Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col justify-center items-center p-2 sm:p-4 max-w-7xl mx-auto w-full">
        {gameMode === 'puzzles' ? (
          <PuzzlesView
            boardTheme={boardTheme}
            showCoordinates={showCoordinates}
            onExitPuzzles={() => setGameMode('vs_computer')}
          />
        ) : (
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5 w-full">
            {/* Left: Board & Players Card */}
            <div className="flex flex-col items-center w-full max-w-[450px] sm:max-w-[480px] space-y-2">
              {/* Top Player (Black) */}
              <div className="w-full space-y-1.5">
                <GameClock
                  color={isFlipped ? 'w' : 'b'}
                  timeSeconds={isFlipped ? whiteTime : blackTime}
                  isActive={clockRunning && game.turn() === (isFlipped ? 'w' : 'b')}
                  playerName={
                    isFlipped
                      ? 'White Player'
                      : gameMode === 'vs_computer'
                      ? `Stockfish AI (${difficulty})`
                      : 'Black Player'
                  }
                  isComputer={!isFlipped && gameMode === 'vs_computer'}
                  style={{ backgroundColor: '#1f1033' }}
                  indicatorStyle={{ width: '30px', height: '30px' }}
                />
                <CapturedPieces
                  captured={isFlipped ? capturedBlack : capturedWhite}
                  color={isFlipped ? 'b' : 'w'}
                  materialAdvantage={isFlipped ? whiteAdvantage : blackAdvantage}
                />
              </div>

              {/* Board: 3D Animated Studio or 2D Classic */}
              {view3D ? (
                <ChessBoard3D
                  game={game}
                  isFlipped={isFlipped}
                  onMove={handleMove}
                  lastMove={lastMove}
                  hintSquare={hintSquare}
                  disabled={gameOverModal.isOpen}
                />
              ) : (
                <ChessBoard
                  game={game}
                  boardTheme={boardTheme}
                  isFlipped={isFlipped}
                  onMove={handleMove}
                  lastMove={lastMove}
                  hintSquare={hintSquare}
                  showCoordinates={showCoordinates}
                  disabled={gameOverModal.isOpen}
                />
              )}

              {/* Bottom Player (White) */}
              <div className="w-full space-y-1.5">
                <CapturedPieces
                  captured={isFlipped ? capturedWhite : capturedBlack}
                  color={isFlipped ? 'w' : 'b'}
                  materialAdvantage={isFlipped ? blackAdvantage : whiteAdvantage}
                />
                <GameClock
                  color={isFlipped ? 'b' : 'w'}
                  timeSeconds={isFlipped ? blackTime : whiteTime}
                  isActive={clockRunning && game.turn() === (isFlipped ? 'b' : 'w')}
                  playerName={isFlipped ? (gameMode === 'vs_computer' ? 'Stockfish AI' : 'Black Player') : 'White (You)'}
                  isComputer={isFlipped && gameMode === 'vs_computer'}
                />
              </div>
            </div>

            {/* Right: Analysis, Move History & Quick Action Toolbar */}
            <div className="w-full max-w-[500px] sm:max-w-[440px] flex flex-col space-y-3.5">
              {/* Analysis & Opening Banner */}
              <AnalysisPanel
                score={evalScore}
                opening={opening}
                onHintClick={handleRequestHint}
                hintLoading={hintLoading}
                hintSan={hintSan}
                gameStatusText={getGameStatusText()}
                isCheck={game.inCheck()}
                isGameOver={game.isGameOver()}
              />

              {/* Move History */}
              <MoveHistory
                history={history}
                currentIndex={viewHistoryIndex}
                onNavigate={handleNavigateHistory}
                onCopyPGN={handleCopyPGN}
                onCopyFEN={handleCopyFEN}
                copiedType={copiedType}
              />

              {/* Action Toolbar */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setIsFlipped((f) => !f)}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-bold transition-all active:scale-95 shadow-md"
                  title="Flip Board Angle"
                >
                  <RotateCcw className="w-4 h-4 mb-1 text-amber-500" />
                  <span>Flip</span>
                </button>

                <button
                  onClick={handleTakeback}
                  disabled={history.length === 0 || gameMode === 'online_p2p'}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-40 shadow-md"
                  title="Undo previous move"
                >
                  <RotateCcw className="w-4 h-4 mb-1 text-blue-400 rotate-180" />
                  <span>Takeback</span>
                </button>

                <button
                  onClick={handleOfferDraw}
                  disabled={history.length < 2}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-40 shadow-md"
                  title="Offer mutual draw"
                >
                  <Trophy className="w-4 h-4 mb-1 text-emerald-400" />
                  <span>Draw</span>
                </button>

                <button
                  onClick={handleResign}
                  disabled={history.length === 0}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-[11px] font-bold transition-all active:scale-95 disabled:opacity-40 shadow-md"
                  title="Resign game"
                >
                  <Flag className="w-4 h-4 mb-1 text-red-400" />
                  <span>Resign</span>
                </button>
              </div>

              {/* Start new game primary CTA */}
              <button
                onClick={() => startNewGame()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-800/90 hover:from-zinc-700 hover:to-zinc-700 text-zinc-100 font-bold text-xs border border-zinc-700 transition-all active:scale-98 shadow-xl"
              >
                <Swords className="w-4 h-4 text-amber-500" />
                <span>Start New Match</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Game Over Modal */}
      {gameOverModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-amber-500/60 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/20">
              🏆
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-zinc-100 font-heading">{gameOverModal.title}</h3>
              <p className="text-zinc-400 text-xs mt-1">{gameOverModal.subtitle}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => startNewGame()}
                className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition-all"
              >
                New Game
              </button>
              <button
                onClick={() => setGameOverModal({ ...gameOverModal, isOpen: false })}
                className="px-5 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs border border-zinc-700"
              >
                Review Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        boardTheme={boardTheme}
        onSelectBoardTheme={setBoardTheme}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        soundVolume={soundVolume}
        onChangeVolume={handleChangeVolume}
        showCoordinates={showCoordinates}
        onToggleCoordinates={() => setShowCoordinates((c) => !c)}
        difficulty={difficulty}
        onChangeDifficulty={setDifficulty}
        timeControls={TIME_CONTROLS}
        activeTimeControl={timeControl}
        onSelectTimeControl={(tc) => {
          setTimeControl(tc);
          setWhiteTime(tc.timeSeconds);
          setBlackTime(tc.timeSeconds);
        }}
      />

      {/* Game Variants Modal */}
      <GameVariantsModal
        isOpen={isVariantsOpen}
        onClose={() => setIsVariantsOpen(false)}
        selectedVariant={variant}
        onSelectVariant={(v) => {
          setVariant(v);
          startNewGame(v);
        }}
      />

      {/* Online Room Modal */}
      <OnlineRoomModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        isConnected={onlineConnected}
        isHost={isOnlineHost}
        roomCode={roomCode}
        onStartRoom={(code, host) => {
          setRoomCode(code);
          setIsOnlineHost(host);
          setMyOnlineColor(host ? 'w' : 'b');
          startNewGame();
        }}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        onOfferDraw={handleOfferDraw}
        onResign={handleResign}
        myColor={myOnlineColor}
      />

      {/* Pocket Developer & ZIP Export Modal */}
      <PocketDevExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
