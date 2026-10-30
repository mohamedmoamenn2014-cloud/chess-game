import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { BoardTheme, PieceColor, PieceType } from '../types/chess';
import { PieceIcon } from './ChessPieces';

interface ChessBoardProps {
  game: Chess;
  boardTheme: BoardTheme;
  isFlipped: boolean;
  onMove: (from: Square, to: Square, promotion?: PieceType) => boolean;
  lastMove: { from: Square; to: Square } | null;
  hintSquare: Square | null;
  showCoordinates?: boolean;
  disabled?: boolean;
}

const THEME_COLORS: Record<BoardTheme, { light: string; dark: string }> = {
  emerald: { light: 'bg-[#f0d9b5]', dark: 'bg-[#367954]' },
  wood: { light: 'bg-[#eed5a6]', dark: 'bg-[#b88b4a]' },
  blue: { light: 'bg-[#e2e8f0]', dark: 'bg-[#4b7399]' },
  midnight: { light: 'bg-[#94a3b8]', dark: 'bg-[#334155]' },
  charcoal: { light: 'bg-[#a1a1aa]', dark: 'bg-[#27272a]' }
};

export const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  boardTheme,
  isFlipped,
  onMove,
  lastMove,
  hintSquare,
  showCoordinates = true,
  disabled = false
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square; color: PieceColor } | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const colors = THEME_COLORS[boardTheme] || THEME_COLORS.emerald;
  const board = game.board();
  const turn = game.turn();
  const inCheck = game.inCheck();

  // Find legal moves for selected piece
  const legalMoves = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true })
    : [];

  const handleSquareClick = (squareKey: Square) => {
    if (disabled || pendingPromotion) return;

    if (!selectedSquare) {
      // Pick piece if it belongs to current player
      const piece = game.get(squareKey);
      if (piece && piece.color === turn) {
        setSelectedSquare(squareKey);
      }
    } else {
      // Try to move
      const targetMove = legalMoves.find((m) => m.to === squareKey);
      if (targetMove) {
        // Check for promotion
        const piece = game.get(selectedSquare);
        const isPromotion =
          piece &&
          piece.type === 'p' &&
          ((piece.color === 'w' && squareKey.endsWith('8')) ||
            (piece.color === 'b' && squareKey.endsWith('1')));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: squareKey, color: piece.color });
          return;
        }

        const success = onMove(selectedSquare, squareKey);
        setSelectedSquare(null);
      } else {
        // Clicked another square: if own piece, change selection; else unselect
        const piece = game.get(squareKey);
        if (piece && piece.color === turn) {
          setSelectedSquare(squareKey);
        } else {
          setSelectedSquare(null);
        }
      }
    }
  };

  const handlePromotionSelect = (pieceType: PieceType) => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, pieceType);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (squareKey: Square, e: React.DragEvent) => {
    if (disabled || pendingPromotion) return;
    const piece = game.get(squareKey);
    if (!piece || piece.color !== turn) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(squareKey);
    setSelectedSquare(squareKey);
    e.dataTransfer.setData('text/plain', squareKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (squareKey: Square, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedSquare) return;

    const targetSquare = squareKey;
    const piece = game.get(draggedSquare);
    const moves = game.moves({ square: draggedSquare, verbose: true });
    const isValid = moves.some((m) => m.to === targetSquare);

    if (isValid) {
      const isPromotion =
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && targetSquare.endsWith('8')) ||
          (piece.color === 'b' && targetSquare.endsWith('1')));

      if (isPromotion) {
        setPendingPromotion({ from: draggedSquare, to: targetSquare, color: piece.color });
      } else {
        onMove(draggedSquare, targetSquare);
        setSelectedSquare(null);
      }
    }
    setDraggedSquare(null);
  };

  return (
    <div dir="ltr" className="relative w-full aspect-square max-w-[480px] sm:max-w-[500px] select-none rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800 bg-zinc-900 chess-board-container">
      {/* 8x8 Board Grid */}
      <div dir="ltr" className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {Array.from({ length: 64 }).map((_, index) => {
          const row = isFlipped ? 7 - Math.floor(index / 8) : Math.floor(index / 8);
          const col = isFlipped ? 7 - (index % 8) : index % 8;
          const file = String.fromCharCode(97 + col);
          const rank = 8 - row;
          const squareKey = `${file}${rank}` as Square;

          const isLight = (row + col) % 2 === 0;
          const piece = board[row][col];
          const isSelected = selectedSquare === squareKey;
          const isLastMoveFrom = lastMove?.from === squareKey;
          const isLastMoveTo = lastMove?.to === squareKey;
          const isCheckSquare = piece?.type === 'k' && piece.color === turn && inCheck;
          const isHintSquare = hintSquare === squareKey;

          // Check if this square is a legal destination for the selected piece
          const isLegalTarget = legalMoves.some((m) => m.to === squareKey);

          return (
            <div
              key={squareKey}
              onClick={() => handleSquareClick(squareKey)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(squareKey, e)}
              className={`relative flex items-center justify-center cursor-pointer transition-colors duration-150 ${
                isLight ? colors.light : colors.dark
              } ${isSelected ? '!bg-amber-400/80 shadow-inner' : ''} ${
                isLastMoveFrom || isLastMoveTo ? '!bg-amber-300/40' : ''
              } ${isCheckSquare ? '!bg-red-500/80 animate-pulse' : ''} ${
                isHintSquare ? 'ring-4 ring-emerald-500 ring-inset animate-bounce' : ''
              }`}
            >
              {/* Coordinates Notation */}
              {showCoordinates && (
                <>
                  {/* File letter on bottom row */}
                  {index >= 56 && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] font-bold select-none pointer-events-none opacity-60 ${
                        isLight ? 'text-zinc-700' : 'text-zinc-200'
                      }`}
                    >
                      {file}
                    </span>
                  )}
                  {/* Rank number on left column */}
                  {index % 8 === 0 && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] font-bold select-none pointer-events-none opacity-60 ${
                        isLight ? 'text-zinc-700' : 'text-zinc-200'
                      }`}
                    >
                      {rank}
                    </span>
                  )}
                </>
              )}

              {/* Piece Icon */}
              {piece && (
                <div
                  draggable={!disabled && piece.color === turn}
                  onDragStart={(e) => handleDragStart(squareKey, e)}
                  className={`w-[84%] h-[84%] flex items-center justify-center transform transition-transform duration-100 ${
                    isSelected ? 'scale-110 drop-shadow-lg' : 'hover:scale-105'
                  }`}
                >
                  <PieceIcon type={piece.type} color={piece.color} className="w-full h-full" />
                </div>
              )}

              {/* Legal Move Indicators */}
              {isLegalTarget && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  {piece ? (
                    // Capture Ring
                    <div className="w-[88%] h-[88%] rounded-full border-4 border-amber-500/70 bg-amber-500/10" />
                  ) : (
                    // Move Dot
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-zinc-900/35 ring-2 ring-white/20" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-amber-500/50 p-4 rounded-2xl shadow-2xl text-center max-w-[280px] w-full">
            <h4 className="text-sm font-bold text-amber-400 mb-3">اختر قطعة الترقية</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'r', 'b', 'n'] as PieceType[]).map((pType) => (
                <button
                  key={pType}
                  onClick={() => handlePromotionSelect(pType)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800 hover:bg-amber-500/20 hover:border-amber-500 border border-zinc-700 transition-all active:scale-95"
                >
                  <div className="w-9 h-9">
                    <PieceIcon type={pType} color={pendingPromotion.color} className="w-full h-full" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
