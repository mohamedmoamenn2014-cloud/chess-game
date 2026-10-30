import { Chess, Square } from 'chess.js';
import { ComputerDifficulty, MoveAnalysis } from '../types/chess';

// Piece value heuristics in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

// Simplified Piece-Square Tables (from White's perspective)
const PAWN_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_PST = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_PST = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_PST = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_PST = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MID_PST = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

// Helper to evaluate static board position in centipawns (from White's perspective)
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type] || 0;
      let pst = 0;
      const index = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;

      switch (piece.type) {
        case 'p': pst = PAWN_PST[index]; break;
        case 'n': pst = KNIGHT_PST[index]; break;
        case 'b': pst = BISHOP_PST[index]; break;
        case 'r': pst = ROOK_PST[index]; break;
        case 'q': pst = QUEEN_PST[index]; break;
        case 'k': pst = KING_MID_PST[index]; break;
      }

      const totalVal = val + pst;
      if (piece.color === 'w') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  return score;
}

// Alpha-Beta Search
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; bestMove?: string } {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess) };
  }

  const moves = chess.moves({ verbose: true });
  // Move ordering: order captures & checks first
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    if (b.captured) scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });

  let bestMoveSan: string | undefined = moves[0]?.san;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false).score;
      chess.undo();
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMoveSan = move.san;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return { score: maxEval, bestMove: bestMoveSan };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true).score;
      chess.undo();
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMoveSan = move.san;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return { score: minEval, bestMove: bestMoveSan };
  }
}

export function getEngineMove(
  fen: string,
  difficulty: ComputerDifficulty
): Promise<{ san: string; from: string; to: string; score: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chess = new Chess(fen);
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) {
        resolve({ san: '', from: '', to: '', score: 0 });
        return;
      }

      // Check if beginner or easy: introduce deliberate human-like variations
      if (difficulty === 'beginner') {
        // Depth 1 with 35% chance of random move
        if (Math.random() < 0.35) {
          const randMove = moves[Math.floor(Math.random() * moves.length)];
          resolve({ san: randMove.san, from: randMove.from, to: randMove.to, score: 0 });
          return;
        }
      }

      let depth = 3;
      if (difficulty === 'beginner') depth = 1;
      else if (difficulty === 'easy') depth = 2;
      else if (difficulty === 'medium') depth = 3;
      else if (difficulty === 'hard') depth = 4;
      else if (difficulty === 'master') depth = 4; // fast responsiveness on mobile

      const isWhite = chess.turn() === 'w';
      const result = minimax(chess, depth, -Infinity, Infinity, isWhite);

      const targetSan = result.bestMove || moves[0].san;
      const matchingMove = moves.find((m) => m.san === targetSan) || moves[0];

      resolve({
        san: matchingMove.san,
        from: matchingMove.from,
        to: matchingMove.to,
        score: result.score / 100 // Convert centipawns to pawns
      });
    }, 120);
  });
}

// Calculate move classification for post-game and live analysis
export function analyzeMoveQuality(
  prevEvalPawns: number,
  currentEvalPawns: number,
  isWhiteMove: boolean
): 'brilliant' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' {
  // Delta from perspective of player who made the move
  const delta = isWhiteMove
    ? currentEvalPawns - prevEvalPawns
    : prevEvalPawns - currentEvalPawns;

  if (delta >= 1.5) return 'brilliant';
  if (delta >= -0.2) return 'best';
  if (delta >= -0.6) return 'good';
  if (delta >= -1.4) return 'inaccuracy';
  if (delta >= -3.0) return 'mistake';
  return 'blunder';
}
