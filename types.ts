export enum Position {
  QB = 'QB',
  RB = 'RB',
  WR = 'WR',
  TE = 'TE',
  DEF = 'DEF', // Defense unit
}

export interface PlayerStats {
  name: string;
  position: Position;
  team: string;
  passingYards?: number;
  passingTDs?: number;
  interceptions?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receivingYards?: number;
  receivingTDs?: number;
  receptions?: number;
}

export interface TeamGameStats {
  teamName: string;
  score: number;
  rushingYards: number;
  passingYards: number;
  totalPlays: number;
  possessions: number; // Estimated or scraped
  turnovers: number;
  sacks: number;
}

export interface GameData {
  id: string;
  date: string;
  season: string;
  week: string;
  homeTeam: TeamGameStats;
  awayTeam: TeamGameStats;
  playerStats: PlayerStats[];
  summary: string;
  sourceUrls: string[];
}

export interface GameScheduleItem {
  homeTeam: string;
  awayTeam: string;
  date: string;
  scoreSummary?: string; // e.g. "KC 21 - DET 20"
  location?: string;
}

export interface ExtractionRequest {
  season: string;
  week: string;
  team?: string; // Optional: focus on a specific team's game
  specificMatchup?: {
    home: string;
    away: string;
  };
}

export enum ExtractionStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SELECTING_GAME = 'SELECTING_GAME',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}