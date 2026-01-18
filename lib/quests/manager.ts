import { DailyQuest } from "./types";

// Daily Quest pool - her gün rastgele 3 tane seçilir
const DAILY_QUEST_POOL: Omit<DailyQuest, "progress" | "isClaimed">[] = [
    {
        id: "daily_play_1",
        type: "play_daily",
        title: "Oyun Oyna",
        titleEn: "Play a Game",
        description: "Günlük modda 1 oyun oyna",
        descriptionEn: "Play 1 game in daily mode",
        translationKey: "quest_play_daily_1",
        target: 1,
        reward: { xp: 50, coins: 25 },
        modeType: "daily"
    },
    {
        id: "daily_win_1",
        type: "win_daily",
        title: "Zafer Yolunda",
        titleEn: "Path to Victory",
        description: "Günlük modda 1 oyun kazan",
        descriptionEn: "Win 1 game in daily mode",
        translationKey: "quest_win_daily_1",
        target: 1,
        reward: { xp: 100, coins: 50 },
        modeType: "daily"
    },
    {
        id: "daily_find_word",
        type: "find_word",
        title: "Kelime Avcısı",
        titleEn: "Word Hunter",
        description: "Günlük modda 1 kelime bul",
        descriptionEn: "Find 1 word in daily mode",
        translationKey: "quest_find_word",
        target: 1,
        reward: { xp: 75, coins: 35 },
        modeType: "daily"
    }
];

// Practice Quest pool
const PRACTICE_QUEST_POOL: Omit<DailyQuest, "progress" | "isClaimed">[] = [
    {
        id: "practice_6_letter",
        type: "play_6_letter",
        title: "6 Harf Tutkusu",
        titleEn: "6 Letter Passion",
        description: "Sınırsız modda 6 harfli 1 oyun oyna",
        descriptionEn: "Play 1 game with 6 letters in unlimited mode",
        translationKey: "quest_6_letter",
        target: 1,
        reward: { xp: 40, coins: 20 },
        modeType: "practice"
    },
    {
        id: "practice_7_letter",
        type: "play_7_letter",
        title: "Zorlu Mücadele",
        titleEn: "Tough Challenge",
        description: "Sınırsız modda 7 harfli 1 oyun oyna",
        descriptionEn: "Play 1 game with 7 letters in unlimited mode",
        translationKey: "quest_7_letter",
        target: 1,
        reward: { xp: 50, coins: 25 },
        modeType: "practice"
    },
    {
        id: "practice_win_3",
        type: "win_practice_3",
        title: "Seri Katil",
        titleEn: "Serial Winner",
        description: "Sınırsız modda 3 oyun kazan",
        descriptionEn: "Win 3 games in unlimited mode",
        translationKey: "quest_win_3",
        target: 3,
        reward: { xp: 150, coins: 75 },
        modeType: "practice"
    },
    {
        id: "practice_play_5",
        type: "play_practice_5",
        title: "Pratik Yap",
        titleEn: "Practice Makes Perfect",
        description: "Sınırsız modda toplam 5 oyun oyna",
        descriptionEn: "Play 5 games total in unlimited mode",
        translationKey: "quest_play_5",
        target: 5,
        reward: { xp: 100, coins: 50 },
        modeType: "practice"
    }
];

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate daily quests (pick 3 random from pool)
export function generateDailyQuests(): DailyQuest[] {
    const shuffled = shuffleArray(DAILY_QUEST_POOL);
    return shuffled.slice(0, 3).map(quest => ({
        ...quest,
        progress: 0,
        isClaimed: false
    }));
}

// Generate practice quests (pick 4 random from pool)
export function generatePracticeQuests(): DailyQuest[] {
    const shuffled = shuffleArray(PRACTICE_QUEST_POOL);
    return shuffled.slice(0, 4).map(quest => ({
        ...quest,
        progress: 0,
        isClaimed: false
    }));
}

// Game result interface for quest progress updates
interface GameResult {
    won: boolean;
    wordLength: number;
    guesses: number;
}

// Update quest progress based on game results
export function updateQuestProgress(
    quests: DailyQuest[],
    gameResult: GameResult
): { updatedQuests: DailyQuest[] } {
    const { won, wordLength } = gameResult;

    const updatedQuests = quests.map(quest => {
        // Skip already claimed quests
        if (quest.isClaimed || quest.progress >= quest.target) {
            return quest;
        }

        let shouldIncrement = false;

        switch (quest.type) {
            // Daily mode quests
            case "play_daily":
                // Any daily game played
                shouldIncrement = true;
                break;
            case "win_daily":
                // Win a daily game
                shouldIncrement = won;
                break;
            case "find_word":
                // Find/guess a word (win)
                shouldIncrement = won;
                break;

            // Practice mode quests
            case "play_6_letter":
                shouldIncrement = wordLength === 6;
                break;
            case "play_7_letter":
                shouldIncrement = wordLength === 7;
                break;
            case "win_practice_3":
            case "win_practice":
                shouldIncrement = won;
                break;
            case "play_practice_5":
            case "play_practice":
                // Any practice game
                shouldIncrement = true;
                break;

            default:
                // For any other quest types, just increment if game was played
                shouldIncrement = true;
        }

        if (shouldIncrement) {
            return {
                ...quest,
                progress: Math.min(quest.progress + 1, quest.target)
            };
        }

        return quest;
    });

    return { updatedQuests };
}
