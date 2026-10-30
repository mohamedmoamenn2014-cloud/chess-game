export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type GameMode = 
  | 'pass_and_play' 
  | 'vs_computer' 
  | 'online_p2p' 
  | 'online_firebase' 
  | 'puzzles' 
  | 'analysis' 
  | 'variants';

export type GameVariant = 
  | 'standard' 
  | 'chess960' 
  | 'king_of_the_hill' 
  | 'three_check';

export type ComputerDifficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'master';

export type BoardTheme = 'emerald' | 'wood' | 'blue' | 'midnight' | 'charcoal';
export type PieceTheme = 'neo' | 'classic' | 'wood' | 'modern';

export interface TimeControl {
  id: string;
  name: string;
  nameAr: string;
  category: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'unlimited';
  timeSeconds: number;
  increment: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  rating: number;
  country: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  isGuest: boolean;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderColor?: PieceColor;
  text: string;
  timestamp: number;
}

export interface MoveAnalysis {
  san: string;
  from: string;
  to: string;
  eval: number; // in pawns or mate
  isMate?: boolean;
  mateIn?: number;
  grade: 'brilliant' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'book';
  bestMoveSan?: string;
  explanationAr?: string;
  explanationEn?: string;
}

export interface Puzzle {
  id: string;
  titleAr: string;
  titleEn: string;
  rating: number;
  theme: string;
  fen: string;
  turn: PieceColor;
  moves: string[]; // UCI or SAN sequence
  solutionExplanationAr: string;
  solutionExplanationEn: string;
}

export interface OpeningInfo {
  eco: string;
  nameEn: string;
  nameAr: string;
  moves: string;
}

export interface OnlineRoomState {
  roomId: string;
  hostColor: PieceColor;
  guestJoined: boolean;
  timeControl: TimeControl;
  fen: string;
  history: string[];
  whiteTime: number;
  blackTime: number;
  lastMoveTimestamp: number | null;
  status: 'waiting' | 'playing' | 'white_won' | 'black_won' | 'draw' | 'aborted';
  winner?: PieceColor | 'draw';
  drawOfferedBy?: PieceColor | null;
  takebackOfferedBy?: PieceColor | null;
  messages: ChatMessage[];
}
