import React from 'react';
import { PieceColor } from '../types/chess';

interface GameClockProps {
  color: PieceColor;
  timeSeconds: number;
  isActive: boolean;
  playerName: string;
  isComputer?: boolean;
  style?: React.CSSProperties;
  indicatorStyle?: React.CSSProperties;
}

export const GameClock: React.FC<GameClockProps> = ({
  color,
  timeSeconds,
  isActive,
  playerName,
  isComputer = false,
  style,
  indicatorStyle
}) => {
  const formatTime = (totalSec: number) => {
    if (totalSec < 0) return '00:00';
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const ms = Math.floor((totalSec % 1) * 10);
    
    if (totalSec < 10) {
      return `${mins}:${secs < 10 ? '0' : ''}${secs}.${ms}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isLowTime = timeSeconds <= 30 && timeSeconds > 0;

  return (
    <div
      style={style}
      className={`flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-200 border ${
        isActive
          ? 'bg-zinc-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
          : 'bg-zinc-900/70 border-zinc-800/80 text-zinc-400'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          style={indicatorStyle}
          className={`w-4 h-4 rounded-full border-2 transition-all ${
            color === 'w'
              ? 'bg-zinc-100 border-zinc-300 shadow-sm'
              : 'bg-zinc-950 border-zinc-600'
          }`}
        />
        <div className="flex flex-col">
          <span className={`text-sm font-extrabold truncate max-w-[150px] sm:max-w-[200px] ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
            {playerName} {isComputer && '🤖'}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium">
            {color === 'w' ? 'White Player' : 'Black Player'}
          </span>
        </div>
      </div>

      <div
        className={`font-mono font-bold text-xl px-3 py-1 rounded-xl border transition-colors tabular-nums ${
          isActive
            ? isLowTime
              ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
              : 'bg-zinc-950 border-amber-500/50 text-amber-400'
            : 'bg-zinc-950/80 border-zinc-800 text-zinc-400'
        }`}
      >
        {formatTime(timeSeconds)}
      </div>
    </div>
  );
};
