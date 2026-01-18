import { UserData } from "@/contexts/AuthContext";
import { ACHIEVEMENTS } from "./data";
import { Achievement, UserStats } from "./types";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";

/**
 * Checks for newly unlocked achievements based on current user stats.
 * Returns a list of achievements that were JUST unlocked.
 */
export function checkNewAchievements(userData: UserData, currentStats: UserStats): Achievement[] {
    const unlocked: Achievement[] = [];
    const existingAchievements = userData.achievements || {};

    ACHIEVEMENTS.forEach((achievement) => {
        // Skip if already unlocked
        if (existingAchievements[achievement.id]) return;

        // Check condition
        if (achievement.condition(currentStats)) {
            unlocked.push(achievement);
        }
    });

    return unlocked;
}

/**
 * Unlocks achievements in Firestore and grants rewards.
 * Helper function to be used when specific events happen.
 */
export async function unlockAchievements(userId: string, achievements: Achievement[], currentXp: number, currentCoins: number) {
    if (achievements.length === 0) return;

    const userRef = doc(db, "users", userId);
    const updates: Record<string, any> = {};

    let totalXpToAdd = 0;
    let totalCoinsToAdd = 0;

    achievements.forEach(ach => {
        updates[`achievements.${ach.id}`] = {
            unlockedAt: new Date().toISOString(),
            isClaimed: true // Auto-claim for simplicity, or false if we want manual claim
        };
        totalXpToAdd += ach.reward.xp;
        totalCoinsToAdd += ach.reward.coins;

        // Item Reward Logic
        if (ach.reward.item) {
            const field = ach.reward.item.type === "avatar" ? "inventory.avatars" :
                ach.reward.item.type === "frame" ? "inventory.frames" : "inventory.themes";
            updates[field] = arrayUnion(ach.reward.item.id);
        }
    });

    updates.xp = increment(totalXpToAdd);
    updates.coins = increment(totalCoinsToAdd);

    // Update level if needed (simple logic here, ideally use shared helper)
    // For now just add XP, level calc happens elsewhere usually

    await updateDoc(userRef, updates);

    return { totalXp: totalXpToAdd, totalCoins: totalCoinsToAdd };
}

/**
 * Builds a UserStats object from UserData.
 * Use this to check achievements on profile load or game end.
 */
export function buildUserStats(userData: UserData): UserStats {
    let bestTime = 999999;

    // Calculate best time from somewhere? 
    // Ideally bestTime should be stored on UserData root or similar
    // For now we check if stats exist in match history or we'll rely on what's passed during game end
    // But for general checks (like level, coins) this is enough.

    // We need to fetch/store bestTime in UserData to be accurate globally
    // Currently UserData has no 'bestTime'. We might need to add it or pass it explicitly.

    const totalWins = (userData.wins4 || 0) + (userData.wins5 || 0) + (userData.wins6 || 0) + (userData.wins7 || 0);
    const totalLosses = (userData.losses4 || 0) + (userData.losses5 || 0) + (userData.losses6 || 0) + (userData.losses7 || 0);

    return {
        totalWins,
        totalGames: totalWins + totalLosses,
        level: userData.level || 1,
        coins: userData.coins || 0,
        dailyStreak: userData.dailyStreak || 0,
        inventorySize: (userData.inventory?.avatars?.length || 0) + (userData.inventory?.frames?.length || 0),
        wins4: userData.wins4 || 0,
        wins5: userData.wins5 || 0,
        wins6: userData.wins6 || 0,
        wins7: userData.wins7 || 0,
        dailyWins: userData.dailyWins || 0,
        practiceWins: userData.practiceWins || 0,
        bestTimeMs: undefined, // Add if available
    };
}
