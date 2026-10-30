import React, { useRef, useEffect } from 'react';
import { Copy, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface MoveHistoryProps {
  history: string[]; // SAN moves array
  currentIndex: number;
  onNavigate: (index: number) => void;
  onCopyPGN: () => void;
  onCopyFEN: () => void;
  copiedType: 'pgn' | 'fen' | null;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentIndex,
  onNavigate,
  onCopyPGN,
  onCopyFEN,
  copiedType
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const pairs: { moveNum: number; white: string; black?: string; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      moveNum: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < history.length ? i + 1 : undefined
    });
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history.length]);

  return (
    <div className="flex flex-col h-full bg-zinc-900/90 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
      {/* Header with copy actions */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800 text-xs">
        <span className="font-bold text-zinc-300 tracking-wide uppercase text-[11px]">Move Log (PGN)</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onCopyPGN}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition-colors"
            title="Copy PGN notation"
          >
            {copiedType === 'pgn' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>PGN</span>
          </button>
          <button
            onClick={onCopyFEN}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-bold transition-colors"
            title="Copy FEN string"
          >
            {copiedType === 'fen' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>FEN</span>
          </button>
        </div>
      </div>

      {/* Move list */}
      <div
        ref={containerRef}
        className="flex-1 p-2.5 overflow-y-auto space-y-1 font-mono text-xs select-text min-h-[120px] max-h-[170px]"
      >
        {pairs.length === 0 ? (
          <div className="text-zinc-600 text-center py-8 font-sans text-xs">
            No moves played yet.
          </div>
        ) : (
          pairs.map((p) => (
            <div key={p.moveNum} className="grid grid-cols-7 items-center py-1 px-2 rounded-lg hover:bg-zinc-800/40">
              <span className="col-span-1 text-zinc-500 font-bold">{p.moveNum}.</span>
              <button
                onClick={() => onNavigate(p.whiteIdx)}
                className={`col-span-3 text-left px-2 py-0.5 rounded-md transition-colors ${
                  currentIndex === p.whiteIdx
                    ? 'bg-amber-500/20 text-amber-400 font-bold'
                    : 'text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {p.white}
              </button>
              {p.black && p.blackIdx !== undefined && (
                <button
                  onClick={() => onNavigate(p.blackIdx!)}
                  className={`col-span-3 text-left px-2 py-0.5 rounded-md transition-colors ${
                    currentIndex === p.blackIdx
                      ? 'bg-amber-500/20 text-amber-400 font-bold'
                      : 'text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {p.black}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-around py-2 bg-zinc-950/80 border-t border-zinc-800">
        <button
          onClick={() => onNavigate(-1)}
          disabled={currentIndex <= -1}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400"
          title="Start of game"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex <= -1}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400"
          title="Previous move"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
          {currentIndex + 1} / {history.length}
        </span>
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex >= history.length - 1}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400"
          title="Next move"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate(history.length - 1)}
          disabled={currentIndex >= history.length - 1}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:hover:text-zinc-400"
          title="Latest move"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
