export interface QuestReward {
    xp: number;
    coins: number;
}

export interface DailyQuest {
    id: string;
    type: string;
    title: string;          // TR text
    titleEn: string;        // EN text
    description: string;    // TR text
    descriptionEn: string;  // EN text
    translationKey: string; // Key for localization (e.g., "quest_win_3_games")
    target: number;
    progress: number;
    reward: QuestReward;
    isClaimed: boolean;
    modeType?: "daily" | "practice"; // To differentiate context if needed
    variables?: Record<string, number | string>; // For dynamic translations like "Win {count} games"
}

export interface UserQuests {
    date: string;
    daily: DailyQuest[];
    practice: DailyQuest[];
}
