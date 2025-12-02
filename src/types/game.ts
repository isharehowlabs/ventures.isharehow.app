// Game type definitions for LookUp.Cafe multiplayer games

export type GameType = 'guessing' | 'drawing' | 'puzzle';
export type GameState = 'lobby' | 'playing' | 'roundEnd' | 'gameEnd';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isActive: boolean;
  avatar?: string;
  userId?: string; // Optional: for logged-in users
}

export interface GameRoom {
  roomCode: string;
  hostId: string;
  players: Player[];
  gameType: GameType | null;
  state: GameState;
  currentRound: number;
  maxRounds: number;
  currentDrawerId?: string;
  currentWord?: string;
  roundStartTime?: number;
}

// Drawing game specific
export interface DrawingStroke {
  points: number[];
  color: string;
  width: number;
}

export interface DrawingData {
  roomCode: string;
  stroke: DrawingStroke;
  playerId: string;
}

// Guessing game specific
export interface GuessSubmission {
  playerId: string;
  guess: string;
  timestamp: number;
}

export interface RoundResult {
  correctAnswer: string;
  winners: Array<{ playerId: string; playerName: string; points: number }>;
  scores: Array<{ playerId: string; playerName: string; totalScore: number }>;
}

// Socket event types
export interface CreateRoomData {
  playerName: string;
  userId?: string;
  avatar?: string;
  roomCode?: string;
}

export interface JoinRoomData {
  roomCode: string;
  playerName: string;
  userId?: string;
  avatar?: string;
}

export interface StartGameData {
  roomCode: string;
  gameType: GameType;
  maxRounds?: number;
}

export interface SubmitAnswerData {
  roomCode: string;
  answer: string;
}
