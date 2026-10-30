import React from 'react';
import { PieceColor, PieceType } from '../types/chess';
import { PieceIcon } from './ChessPieces';

interface CapturedPiecesProps {
  captured: PieceType[];
  color: PieceColor;
  materialAdvantage: number; // positive if this side has advantage
}

const PIECE_WEIGHTS: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  captured,
  color,
  materialAdvantage
}) => {
  // Sort captured pieces by value: pawns first, then minor pieces, rooks, queens
  const sorted = [...captured].sort((a, b) => (PIECE_WEIGHTS[a] || 0) - (PIECE_WEIGHTS[b] || 0));

  return (
    <div className="flex items-center gap-1 min-h-[26px] px-1 py-0.5 overflow-x-auto max-w-full">
      <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
        {sorted.map((type, idx) => (
          <div key={idx} className="w-5 h-5 flex-shrink-0">
            <PieceIcon type={type} color={color} className="w-5 h-5" />
          </div>
        ))}
      </div>

      {materialAdvantage > 0 && (
        <span className="text-[11px] font-bold font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded ml-1 rtl:mr-1 flex-shrink-0">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
