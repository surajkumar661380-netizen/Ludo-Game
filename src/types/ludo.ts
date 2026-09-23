/**
 * Ludo Game Type Definitions
 */

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'bot';

export type BotDifficulty = 'casual' | 'smart';

export type GameMode = '1vs1' | '2vs2' | '4player';

export type TeamId = 'team-alpha' | 'team-beta';

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  /**
   * step representation:
   * -1 = in yard/home base
   * 0 = on starting tile (just exited yard)
   * 1..50 = moving forward on the 52-tile track
   * 51..55 = moving inside the color's 5-tile home column
   * 56 = inside the final central Home triangle
   */
  step: number;
}

export interface Player {
  id: string;
  color: PlayerColor;
  name: string;
  type: PlayerType;
  botDifficulty?: BotDifficulty;
  isActive: boolean;
  team?: TeamId; // For 2vs2 mode
  tokens: Token[];
  rank?: number;
  consecutiveSixes: number;
  stats: {
    rolls: number;
    sixes: number;
    captures: number;
    tokensHome: number;
  };
}

export type GameState = 'SETUP' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type TurnPhase =
  | 'ROLL'
  | 'ROLLING'
  | 'SELECT_TOKEN'
  | 'BOT_THINKING'
  | 'AUTO_MOVING'
  | 'NO_MOVES'
  | 'ANIMATING';

export interface Coordinate {
  row: number;
  col: number;
}

export interface MoveOption {
  tokenId: number;
  fromStep: number;
  toStep: number;
  willCaptureToken?: {
    color: PlayerColor;
    tokenId: number;
  };
  willReachHome: boolean;
  score?: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  playerColor: PlayerColor;
  message: string;
  iconType: 'dice' | 'step' | 'capture' | 'enter' | 'home' | 'trophy' | 'warning' | 'team';
}
