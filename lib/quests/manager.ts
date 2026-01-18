import { DailyQuest, UserQuests } from "./types";

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Pool of potential daily quests
const DAILY_QUEST_POOL = [
    {
        type: "play_game",
        translationKey: "quest_play_games",
        title: "Oyun Oyna",
        titleEn: "Play Games",
        description: "Günlük modda {target} oyun oyna",
        descriptionEn: "Play {target} games in Daily mode",
        baseTarget: 1,
        reward: { xp: 50, coins: 25 }
    },
    {
        type: "win_game",
        translationKey: "quest_win_games",
        title: "Zafer Yolunda",
        titleEn: "Victory Path",
        description: "Günlük modda {target} oyun kazan",
        descriptionEn: "Win {target} games in Daily mode",
        baseTarget: 1,
        reward: { xp: 100, coins: 50 }
    },
    {
        type: "find_word",
        translationKey: "quest_find_words",
        title: "Kelime Avcısı",
        titleEn: "Word Hunter",
        description: "Günlük modda {target} kelime bul",
        descriptionEn: "Find {target} words in Daily mode",
        baseTarget: 1, // Usually represents 1 daily word
        reward: { xp: 75, coins: 35 }
    }
];

// Pool of potential unlimited/practice quests
const PRACTICE_QUEST_POOL = [
    {
        type: "play_practice_6",
        translationKey: "quest_play_practice_6",
        title: "6 Harf Tutkusu",
        titleEn: "6 Letter Passion",
        description: "Sınırsız modda 6 harfli 1 oyun oyna",
        descriptionEn: "Play a 6-letter game in Unlimited mode",
        baseTarget: 1,
        reward: { xp: 40, coins: 20 }
    },
    {
        type: "play_practice_7",
        translationKey: "quest_play_practice_7",
        title: "Zorlu Mücadele",
        titleEn: "Tough Challenge",
        description: "Sınırsız modda 7 harfli 1 oyun oyna",
        descriptionEn: "Play a 7-letter game in Unlimited mode",
        baseTarget: 1,
        reward: { xp: 50, coins: 25 }
    },
    {
        type: "win_practice_3",
        translationKey: "quest_win_practice_3",
        title: "Seri Katil",
        titleEn: "Serial Killer",
        description: "Sınırsız modda 3 oyun kazan",
        descriptionEn: "Win 3 games in Unlimited mode",
        baseTarget: 3,
        reward: { xp: 150, coins: 75 }
    },
    {
        type: "play_practice_any",
        translationKey: "quest_play_practice_any",
        title: "Pratik Yap",
        titleEn: "Practice",
        description: "Sınırsız modda toplam {target} oyun oyna",
        descriptionEn: "Play {target} games in Unlimited mode",
        baseTarget: 5,
        reward: { xp: 100, coins: 50 }
    }
];

export function generateDailyQuests(): DailyQuest[] {
    return DAILY_QUEST_POOL.map(template => ({
        id: generateId(),
        type: template.type,
        translationKey: template.translationKey,
        title: template.title,
        titleEn: template.titleEn,
        description: template.description.replace("{target}", template.baseTarget.toString()),
        descriptionEn: template.descriptionEn.replace("{target}", template.baseTarget.toString()),
        target: template.baseTarget,
        progress: 0,
        reward: template.reward,
        isClaimed: false,
        modeType: "daily",
        variables: { target: template.baseTarget }
    }));
}

export function generatePracticeQuests(): DailyQuest[] {
    return PRACTICE_QUEST_POOL.map(template => ({
        id: generateId(),
        type: template.type,
        translationKey: template.translationKey,
        title: template.title,
        titleEn: template.titleEn,
        description: template.description.replace("{target}", template.baseTarget.toString()),
        descriptionEn: template.descriptionEn.replace("{target}", template.baseTarget.toString()),
        target: template.baseTarget,
        progress: 0,
        reward: template.reward,
        isClaimed: false,
        modeType: "practice",
        variables: { target: template.baseTarget }
    }));
}

// Update quest progress based on game result
export function updateQuestProgress(
    quests: DailyQuest[],
    gameResult: { won: boolean; wordLength: number; guesses: number }
): { updatedQuests: DailyQuest[]; completed: DailyQuest[] } {
    const completed: DailyQuest[] = [];

    const updatedQuests = quests.map(quest => {
        // Skip already claimed quests
        if (quest.isClaimed) return quest;

        let newProgress = quest.progress;

        // Check quest type and update progress accordingly
        switch (quest.type) {
            case "play_game":
            case "play_practice_any":
                // Increment for any game played
                newProgress = quest.progress + 1;
                break;

            case "win_game":
            case "win_practice_3":
                // Increment only if won
                if (gameResult.won) {
                    newProgress = quest.progress + 1;
                }
                break;

            case "find_word":
                // Increment if won (found the word)
                if (gameResult.won) {
                    newProgress = quest.progress + 1;
                }
                break;

            case "play_practice_6":
                // Increment if playing 6-letter mode
                if (gameResult.wordLength === 6) {
                    newProgress = quest.progress + 1;
                }
                break;

            case "play_practice_7":
                // Increment if playing 7-letter mode
                if (gameResult.wordLength === 7) {
                    newProgress = quest.progress + 1;
                }
                break;
        }

        // Check if quest is now complete
        const wasComplete = quest.progress >= quest.target;
        const isNowComplete = newProgress >= quest.target;

        if (!wasComplete && isNowComplete) {
            completed.push({ ...quest, progress: newProgress });
        }

        return {
            ...quest,
            progress: Math.min(newProgress, quest.target)
        };
    });

    return { updatedQuests, completed };
}

