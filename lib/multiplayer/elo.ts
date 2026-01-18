// Advanced ELO Rating System with Performance Bonuses

const K_FACTOR = 32; // Standard chess K-factor
const DEFAULT_ELO = 1200;
const MIN_ELO = 0;
const MAX_ELO = 5000; // Upper limit for safety

// Rank definitions
export interface Rank {
  name: string;
  nameEn: string;
  minElo: number;
  maxElo: number;
  emoji: string;
  color: string;
}

export const RANKS: Rank[] = [
  { name: "Acemi", nameEn: "Novice", minElo: 0, maxElo: 800, emoji: "🌱", color: "from-gray-500 to-neutral-500" },
  { name: "Çırak", nameEn: "Apprentice", minElo: 801, maxElo: 1200, emoji: "📚", color: "from-blue-500 to-cyan-500" },
  { name: "Gümüş", nameEn: "Silver", minElo: 1201, maxElo: 1600, emoji: "🥈", color: "from-gray-400 to-slate-400" },
  { name: "Altın", nameEn: "Gold", minElo: 1601, maxElo: 2000, emoji: "🥇", color: "from-yellow-500 to-amber-500" },
  { name: "Platin", nameEn: "Platinum", minElo: 2001, maxElo: 2400, emoji: "💎", color: "from-cyan-500 to-blue-500" },
  { name: "Üstat", nameEn: "Grandmaster", minElo: 2401, maxElo: 2800, emoji: "👑", color: "from-purple-500 to-pink-500" },
  { name: "Kelime Efendisi", nameEn: "Lexicographer", minElo: 2801, maxElo: Infinity, emoji: "🏆", color: "from-orange-500 via-red-500 to-pink-500" },
];

// Performance bonus based on guess count
export function getPerformanceBonus(guessCount: number): number {
  if (guessCount === 1) return 15;
  if (guessCount === 2) return 10;
  if (guessCount === 3) return 5;
  return 0; // 4+ guesses = no bonus
}

// Win streak multiplier
export function getWinStreakMultiplier(winStreak: number): number {
  if (winStreak >= 10) return 1.2; // 20% bonus for 10+ streak
  if (winStreak >= 5) return 1.1; // 10% bonus for 5+ streak
  return 1.0; // No bonus
}

export function calculateExpectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

export interface EloCalculationResult {
  newElo: number;
  eloChange: number;
  performanceBonus: number;
  streakBonus: number;
}

export function calculateNewEloWithBonuses(
  playerElo: number,
  opponentElo: number,
  won: boolean,
  guessCount?: number,
  winStreak: number = 0
): EloCalculationResult {
  const expected = calculateExpectedScore(playerElo, opponentElo);
  const actualScore = won ? 1 : 0;
  
  // Base ELO change
  let baseChange = K_FACTOR * (actualScore - expected);
  
  // Performance bonus (only for winners)
  let performanceBonus = 0;
  if (won && guessCount) {
    performanceBonus = getPerformanceBonus(guessCount);
  }
  
  // Win streak multiplier (only for winners)
  let streakBonus = 0;
  if (won && winStreak > 0) {
    const multiplier = getWinStreakMultiplier(winStreak);
    const bonusChange = baseChange * (multiplier - 1);
    streakBonus = Math.round(bonusChange);
  }
  
  // Total change
  const totalChange = baseChange + performanceBonus + streakBonus;
  
  // Calculate new ELO (ensure it doesn't go below MIN_ELO)
  const newElo = Math.max(MIN_ELO, Math.round(playerElo + totalChange));
  
  return {
    newElo,
    eloChange: Math.round(totalChange),
    performanceBonus,
    streakBonus,
  };
}

export function calculateBothNewElos(
  winnerElo: number,
  loserElo: number,
  winnerGuessCount?: number,
  winnerWinStreak: number = 0
): { 
  winnerNewElo: number; 
  loserNewElo: number;
  winnerEloChange: number;
  loserEloChange: number;
  winnerPerformanceBonus: number;
  winnerStreakBonus: number;
} {
  const winnerResult = calculateNewEloWithBonuses(
    winnerElo,
    loserElo,
    true,
    winnerGuessCount,
    winnerWinStreak
  );
  
  const loserResult = calculateNewEloWithBonuses(
    loserElo,
    winnerElo,
    false
  );
  
  return {
    winnerNewElo: winnerResult.newElo,
    loserNewElo: loserResult.newElo,
    winnerEloChange: winnerResult.eloChange,
    loserEloChange: loserResult.eloChange,
    winnerPerformanceBonus: winnerResult.performanceBonus,
    winnerStreakBonus: winnerResult.streakBonus,
  };
}

export function getRank(elo: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (elo >= RANKS[i].minElo) {
      return RANKS[i];
    }
  }
  return RANKS[0]; // Fallback to Novice
}

export function getEloTier(elo: number): {
  tier: string;
  color: string;
  emoji: string;
} {
  const rank = getRank(elo);
  return {
    tier: rank.name,
    color: rank.color,
    emoji: rank.emoji,
  };
}

export { DEFAULT_ELO, MIN_ELO, MAX_ELO };
