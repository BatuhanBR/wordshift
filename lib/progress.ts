export const LEVEL_THRESHOLDS = {
    1: 500,
    2: 1000,
    3: 2000,
    4: 3500,
    5: 5000,
    // Sonrası için formül: floor(level^1.5 * 1000) gibi dinamik olabilir
};

export const getNextLevelXp = (level: number) => {
    if (level <= 5) return LEVEL_THRESHOLDS[level as keyof typeof LEVEL_THRESHOLDS] || 5000;
    return Math.floor(Math.pow(level, 1.5) * 1000);
};

export const calculateGameRewards = (
    gameMode: number,
    isWin: boolean,
    score: number,
    moves: number,
    timeRequired: number // o anki geçen süre (saniye) - opsiyonel eklenebilir
) => {
    let xp = 0;
    let coins = 0;

    if (isWin) {
        // Base XP
        xp = 100;
        // Score Bonus
        xp += Math.floor(score / 10);
        // Game mode bonus (Zorluk)
        xp += gameMode * 10;

        // Coins
        coins = 50 + (gameMode * 5);
    } else {
        // Teselli ödülü
        xp = 25;
        coins = 10;
    }

    return { xp, coins };
};

export interface LevelProgress {
    newLevel: number;
    newXp: number;
    leveledUp: boolean;
}

export const calculateNewProgress = (
    currentLevel: number,
    currentXp: number,
    earnedXp: number
): LevelProgress => {
    let level = currentLevel;
    let xp = currentXp + earnedXp;
    let leveledUp = false;

    let nextLevelXp = getNextLevelXp(level);

    // Level atlama dongusu (birden fazla level atlanabilir)
    while (xp >= nextLevelXp) {
        xp -= nextLevelXp;
        level++;
        leveledUp = true;
        nextLevelXp = getNextLevelXp(level);
    }

    return {
        newLevel: level,
        newXp: xp, // Kalan XP
        leveledUp,
    };
};
