import React from 'react';
import { Lightbulb, BookOpen, Activity, Award } from 'lucide-react';
import { OpeningInfo } from '../types/chess';

interface AnalysisPanelProps {
  score: number; // in pawns
  isMate?: boolean;
  mateIn?: number;
  opening: OpeningInfo | null;
  onHintClick: () => void;
  hintLoading?: boolean;
  hintSan?: string;
  gameStatusText: string;
  isCheck?: boolean;
  isGameOver?: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  score,
  isMate,
  mateIn,
  opening,
  onHintClick,
  hintLoading = false,
  hintSan,
  gameStatusText,
  isCheck,
  isGameOver
}) => {
  const clampedScore = Math.max(-8, Math.min(8, score));
  const whitePercent = 50 + (clampedScore / 8) * 45;

  const formattedScore = isMate
    ? `#M${mateIn || ''}`
    : score > 0
    ? `+${score.toFixed(1)}`
    : score.toFixed(1);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-4 space-y-3.5 shadow-xl">
      {/* Game status highlight banner */}
      <div
        className={`px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-colors ${
          isGameOver
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : isCheck
            ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
            : 'bg-zinc-950 text-zinc-200 border border-zinc-800'
        }`}
      >
        <span className="truncate">{gameStatusText}</span>
        {isCheck && <span className="text-xs px-2 py-0.5 rounded-md bg-red-600 text-white font-bold flex-shrink-0">CHECK!</span>}
      </div>

      {/* Evaluation Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Engine Evaluation</span>
          </div>
          <span className="font-mono font-bold text-zinc-200 tabular-nums">{formattedScore}</span>
        </div>

        <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden border border-zinc-700/60 flex">
          <div
            className="bg-zinc-100 transition-all duration-300"
            style={{ width: `${whitePercent}%` }}
          />
          <div className="bg-zinc-900 flex-1" />
        </div>
      </div>

      {/* Opening display */}
      <div className="flex items-start gap-2.5 p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs">
        <BookOpen className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Opening Book:</span>
          {opening ? (
            <div className="truncate">
              <span className="font-bold text-emerald-400">{opening.nameEn}</span>
              <span className="text-zinc-500 text-[10px] ml-1.5 font-mono">({opening.eco})</span>
            </div>
          ) : (
            <span className="text-zinc-500 italic">Standard opening or custom moves</span>
          )}
        </div>
      </div>

      {/* Hint button & result */}
      <div className="flex items-center gap-2">
        <button
          onClick={onHintClick}
          disabled={hintLoading || isGameOver}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition-all disabled:opacity-40 active:scale-98"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{hintLoading ? 'Calculating best line...' : 'Best Move Hint'}</span>
        </button>

        {hintSan && (
          <div className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs">
            {hintSan}
          </div>
        )}
      </div>
    </div>
  );
};
