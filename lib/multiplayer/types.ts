// Multiplayer game types

// Mode-specific statistics (4, 5, 6, 7 letter modes)
export interface ModeStats {
  elo: number;
  wins: number;
  losses: number;
  winStreak: number;
  lossStreak: number;
}

// All mode stats mapped by word length
export interface AllModeStats {
  "4"?: ModeStats;
  "5"?: ModeStats;
  "6"?: ModeStats;
  "7"?: ModeStats;
}

export interface Player {
  uid: string;
  email: string;
  displayName: string;
  elo: number; // Global ELO (for backwards compatibility)
  elo_en?: number; // English ELO
  modeStats?: AllModeStats; // Mode-specific stats
  avatar?: string;
}

export interface GameRoom {
  id: string;
  players: {
    player1: Player;
    player2: Player;
  };
  solution: string;
  wordLength: number;
  startTime: number;
  endTime?: number;
  duration: number; // in seconds
  status: "waiting" | "active" | "finished";
  winner?: string; // uid of winner
  isPrivate?: boolean; // true for private/public lobby games
  language?: "tr" | "en"; // language mode
  abandonedBy?: string; // uid of player who left the match
}

export interface PlayerProgress {
  uid: string;
  guesses: string[][];
  states: ("correct" | "present" | "absent" | "empty")[][];
  currentRow: number;
  finished: boolean;
  won: boolean;
  finishTime?: number;
  abandoned?: boolean; // true if player left the match
}

export interface MatchmakingRequest {
  uid: string;
  elo: number;
  timestamp: number;
  wordLength: number;
  language?: "tr" | "en";
}

export interface GameResult {
  roomId: string;
  winner: string;
  loser: string;
  winnerElo: number;
  loserElo: number;
  winnerNewElo: number;
  loserNewElo: number;
  winnerGuesses: number;
  loserGuesses: number;
  duration: number;
}
