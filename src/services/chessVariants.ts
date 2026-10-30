import { PieceColor, GameVariant } from '../types/chess';
import { Chess } from 'chess.js';

// Center squares for King of the Hill
export const KOTH_CENTER_SQUARES = ['d4', 'e4', 'd5', 'e5'];

/**
 * Generate legal Chess960 starting FEN
 * Rules:
 * 1. Bishops must be on opposite-colored squares.
 * 2. The king must be placed between the two rooks.
 * 3. Black's back rank mirrors White's back rank.
 */
export function generateChess960FEN(): string {
  const pieces = new Array<string>(8).fill('');

  // 1. Place Bishops on opposite colors
  // Light squares: 1, 3, 5, 7
  const lightSquares = [1, 3, 5, 7];
  // Dark squares: 0, 2, 4, 6
  const darkSquares = [0, 2, 4, 6];

  const b1 = lightSquares[Math.floor(Math.random() * lightSquares.length)];
  const b2 = darkSquares[Math.floor(Math.random() * darkSquares.length)];
  pieces[b1] = 'B';
  pieces[b2] = 'B';

  // 2. Place Queen randomly in one of the remaining 6 empty squares
  const empty1 = pieces.map((p, idx) => (p === '' ? idx : -1)).filter((idx) => idx !== -1);
  const qPos = empty1[Math.floor(Math.random() * empty1.length)];
  pieces[qPos] = 'Q';

  // 3. Place two Knights randomly in two of the remaining 5 empty squares
  const empty2 = pieces.map((p, idx) => (p === '' ? idx : -1)).filter((idx) => idx !== -1);
  const n1Pos = empty2.splice(Math.floor(Math.random() * empty2.length), 1)[0];
  const n2Pos = empty2.splice(Math.floor(Math.random() * empty2.length), 1)[0];
  pieces[n1Pos] = 'N';
  pieces[n2Pos] = 'N';

  // 4. Exactly 3 slots remain for Rook, King, Rook (King must be in the middle slot)
  const remainingSlots = pieces.map((p, idx) => (p === '' ? idx : -1)).filter((idx) => idx !== -1);
  pieces[remainingSlots[0]] = 'R';
  pieces[remainingSlots[1]] = 'K';
  pieces[remainingSlots[2]] = 'R';

  const whiteRank = pieces.join('');
  const blackRank = whiteRank.toLowerCase();

  return `${blackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRank} w - - 0 1`;
}

/**
 * Check if King of the Hill victory condition is met
 */
export function checkKOTHWin(chess: Chess, lastMoveToSquare: string): PieceColor | null {
  if (KOTH_CENTER_SQUARES.includes(lastMoveToSquare)) {
    const piece = chess.get(lastMoveToSquare as any);
    if (piece && piece.type === 'k') {
      return piece.color as PieceColor;
    }
  }
  return null;
}
