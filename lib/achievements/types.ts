export type AchievementCategory = "daily" | "unlimited" | "general" | "social" | "collection" | "mastery" | "gameplay";

export interface LocalizedText {
    tr: string;
    en: string;
}

export interface Achievement {
    id: string;
    title: LocalizedText;
    description: LocalizedText;
    icon: string; // Emoji
    category: AchievementCategory;
    tier: "bronze" | "silver" | "gold" | "platinum";
    reward: {
        xp: number;
        coins: number;
        item?: {
            type: "avatar" | "frame" | "theme";
            id: string;
        };
    };
    condition: (stats: UserStats) => boolean;
    maxProgress?: number; // Target value (e.g., 100 wins)
    getProgress?: (stats: UserStats) => number; // Current value (e.g., 45 wins)
}

export interface UserStats {
    totalWins: number;
    level: number;
    coins: number;
    dailyStreak: number;
    bestTimeMs?: number; // Lowest time ever
    totalGames: number; // Wins + Losses
    inventorySize?: number; // Number of items owned
    wins4: number;
    wins5: number;
    wins6: number;
    wins7: number;
    dailyWins: number;
    practiceWins: number;
}
