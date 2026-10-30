import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';
import { Puzzle, BoardTheme } from '../types/chess';
import { PUZZLES_DB } from '../services/puzzles';
import { ChessBoard } from './ChessBoard';
import { soundService } from '../services/sound';
import { Trophy, HelpCircle, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzlesViewProps {
  boardTheme: BoardTheme;
  showCoordinates: boolean;
  onExitPuzzles: () => void;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({
  boardTheme,
  showCoordinates,
  onExitPuzzles
}) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [puzzleGame, setPuzzleGame] = useState<Chess>(new Chess());
  const [moveStep, setMoveStep] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintSquare, setHintSquare] = useState<Square | null>(null);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(1000);

  const currentPuzzle: Puzzle = PUZZLES_DB[puzzleIndex] || PUZZLES_DB[0];

  useEffect(() => {
    const g = new Chess(currentPuzzle.fen);
    setPuzzleGame(g);
    setMoveStep(0);
    setIsSolved(false);
    setIsFailed(false);
    setShowExplanation(false);
    setHintSquare(null);
  }, [puzzleIndex, currentPuzzle.fen]);

  const handlePuzzleMove = (from: Square, to: Square, promotion?: any): boolean => {
    if (isSolved || isFailed) return false;

    const expectedMoveUci = currentPuzzle.moves[moveStep];
    const playerMoveUci = `${from}${to}`;

    const clone = new Chess(puzzleGame.fen());
    const moveRes = clone.move({ from, to, promotion: promotion || 'q' });
    if (!moveRes) return false;

    if (playerMoveUci === expectedMoveUci) {
      puzzleGame.move({ from, to, promotion: promotion || 'q' });
      setPuzzleGame(new Chess(puzzleGame.fen()));
      soundService.playMove();

      const nextStep = moveStep + 1;
      if (nextStep >= currentPuzzle.moves.length) {
        setIsSolved(true);
        setShowExplanation(true);
        soundService.playVictory();
        setStreak((s) => s + 1);
        setScore((sc) => sc + 50);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } else {
        setMoveStep(nextStep);
        setTimeout(() => {
          const compMoveUci = currentPuzzle.moves[nextStep];
          const cFrom = compMoveUci.slice(0, 2) as Square;
          const cTo = compMoveUci.slice(2, 4) as Square;
          puzzleGame.move({ from: cFrom, to: cTo });
          setPuzzleGame(new Chess(puzzleGame.fen()));
          soundService.playMove();
          setMoveStep(nextStep + 1);
        }, 300);
      }
      return true;
    } else {
      setIsFailed(true);
      soundService.playDefeat();
      setStreak(0);
      return false;
    }
  };

  const handleNextPuzzle = () => {
    setPuzzleIndex((prev) => (prev + 1) % PUZZLES_DB.length);
  };

  const handleRetry = () => {
    const g = new Chess(currentPuzzle.fen);
    setPuzzleGame(g);
    setMoveStep(0);
    setIsSolved(false);
    setIsFailed(false);
    setShowExplanation(false);
    setHintSquare(null);
  };

  const handleShowHint = () => {
    const expectedMove = currentPuzzle.moves[moveStep];
    if (expectedMove) {
      setHintSquare(expectedMove.slice(0, 2) as Square);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-5xl mx-auto p-2 sm:p-4 animate-in fade-in">
      {/* Board Column */}
      <div className="flex flex-col items-center w-full max-w-[480px]">
        <ChessBoard
          game={puzzleGame}
          boardTheme={boardTheme}
          isFlipped={currentPuzzle.turn === 'b'}
          onMove={handlePuzzleMove}
          lastMove={null}
          hintSquare={hintSquare}
          showCoordinates={showCoordinates}
          disabled={isSolved || isFailed}
        />
      </div>

      {/* Info & Controls Column */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
        {/* Header Stats */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-zinc-100 text-base">Tactical Puzzle Trainer</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              🔥 Streak: {streak}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ⭐ Rating: {score}
            </span>
          </div>
        </div>

        {/* Puzzle Card */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Puzzle #{puzzleIndex + 1}: {currentPuzzle.theme}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              Level: {currentPuzzle.rating}
            </span>
          </div>
          <h3 className="font-bold text-zinc-100 text-sm">
            {currentPuzzle.titleEn}
          </h3>
          <p className="text-zinc-400 text-xs">
            {currentPuzzle.turn === 'w' ? 'White to move ⚪' : 'Black to move ⚫'} - find the decisive combination!
          </p>
        </div>

        {/* Solved / Failed Banner */}
        {isSolved && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">Brilliant! Puzzle Solved 🎉</div>
              <div className="text-[11px] text-emerald-300/80">+50 rating points awarded</div>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">Incorrect move!</div>
              <div className="text-[11px] text-red-300/80">Try again or ask for a piece hint</div>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-700 text-white font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-xl text-xs space-y-1">
            <span className="font-bold text-amber-400">Tactical Solution:</span>
            <p className="text-zinc-300 leading-relaxed">
              {currentPuzzle.solutionExplanationEn}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          {!isSolved && (
            <button
              onClick={handleShowHint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Hint Piece</span>
            </button>
          )}

          <button
            onClick={handleNextPuzzle}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-98"
          >
            <span>Next Puzzle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onExitPuzzles}
          className="w-full py-2 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors"
        >
          Return to Main Board
        </button>
      </div>
    </div>
  );
};
