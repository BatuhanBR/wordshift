"use client";

import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getRank, type Rank, DEFAULT_ELO } from "./elo";

export interface LeaderboardPlayer {
    uid: string;
    displayName: string;
    elo: number;
    rank: Rank;
    wins: number;
    losses: number;
    winRate: number;
    bestTimeMs: number | null;
    worstTimeMs: number | null;
    mode?: number; // Word length mode (4, 5, 6, 7)
    dailyStreak?: number;
}

/**
 * Get top players sorted by ELO for a specific language
 */
export async function getTopPlayers(count: number = 10, language: "tr" | "en" = "tr"): Promise<LeaderboardPlayer[]> {
    try {
        const usersRef = collection(db, "users");
        // Query all users and sort by language-specific ELO
        const eloField = language === "en" ? "elo_en" : "elo";
        const winsField = language === "en" ? "multiplayerWins_en" : "multiplayerWins";
        const lossesField = language === "en" ? "multiplayerLosses_en" : "multiplayerLosses";

        const q = query(usersRef, orderBy(eloField, "desc"), limit(count));
        const snapshot = await getDocs(q);

        const players: LeaderboardPlayer[] = [];

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const wins = data[winsField] || 0;
            const losses = data[lossesField] || 0;
            const total = wins + losses;
            const dailyStreak = data.dailyStreak || 0;
            const elo = data[eloField] || DEFAULT_ELO;

            // Skip users with no games in this language
            if (total === 0 && elo === DEFAULT_ELO) continue;

            // Get match history for best/worst times
            let bestTimeMs: number | null = null;
            let worstTimeMs: number | null = null;

            try {
                const historyRef = collection(db, "users", docSnap.id, "matchHistory");
                const historyQuery = query(historyRef, orderBy("timestamp", "desc"), limit(50));
                const historySnap = await getDocs(historyQuery);

                historySnap.docs.forEach((matchDoc) => {
                    const match = matchDoc.data();
                    // Only count matches for this language
                    if (match.language === language && match.won && match.durationMs) {
                        if (!bestTimeMs || match.durationMs < bestTimeMs) {
                            bestTimeMs = match.durationMs;
                        }
                        if (!worstTimeMs || match.durationMs > worstTimeMs) {
                            worstTimeMs = match.durationMs;
                        }
                    }
                });
            } catch (e) {
                // Ignore errors when fetching match history
            }

            players.push({
                uid: docSnap.id,
                displayName: data.displayName || (language === "en" ? "Player" : "Oyuncu"),
                elo,
                rank: getRank(elo),
                wins,
                losses,
                winRate: total > 0 ? (wins / total) * 100 : 0,
                bestTimeMs,
                worstTimeMs,
                dailyStreak,
            });
        }

        return players;
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

/**
 * Get top players for a specific mode (4, 5, 6, or 7 letter words)
 * Falls back to calculating stats from match history if modeStats is not available
 */
export async function getTopPlayersForMode(mode: number, count: number = 10): Promise<LeaderboardPlayer[]> {
    try {
        const usersRef = collection(db, "users");
        // Get all users and filter/sort by mode stats or match history
        const snapshot = await getDocs(usersRef);

        const players: LeaderboardPlayer[] = [];

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const modeStats = data.modeStats?.[mode.toString()];
            const dailyStreak = data.dailyStreak || 0;

            // Get match history for this mode (to calculate stats and times)
            let modeMatches: any[] = [];
            let bestTimeMs: number | null = null;
            let worstTimeMs: number | null = null;

            try {
                const historyRef = collection(db, "users", docSnap.id, "matchHistory");
                const historyQuery = query(historyRef, orderBy("timestamp", "desc"), limit(100));
                const historySnap = await getDocs(historyQuery);

                historySnap.docs.forEach((matchDoc) => {
                    const match = matchDoc.data();
                    // Use Number() for type-safe comparison
                    if (Number(match.wordLength) === mode) {
                        modeMatches.push(match);
                        // Track best/worst times for wins
                        if (match.won && match.durationMs) {
                            if (!bestTimeMs || match.durationMs < bestTimeMs) {
                                bestTimeMs = match.durationMs;
                            }
                            if (!worstTimeMs || match.durationMs > worstTimeMs) {
                                worstTimeMs = match.durationMs;
                            }
                        }
                    }
                });
            } catch (e) {
                // Ignore errors when fetching match history
            }

            // Calculate stats - prefer modeStats, fallback to match history
            let modeElo: number;
            let modeWins: number;
            let modeLosses: number;

            if (modeStats && (modeStats.wins > 0 || modeStats.losses > 0)) {
                // Use modeStats if available
                modeElo = modeStats.elo ?? DEFAULT_ELO;
                modeWins = modeStats.wins ?? 0;
                modeLosses = modeStats.losses ?? 0;
            } else if (modeMatches.length > 0) {
                // Fallback: calculate from match history
                modeWins = modeMatches.filter(m => m.won && !m.isDraw).length;
                modeLosses = modeMatches.filter(m => !m.won && !m.isDraw).length;
                // Get latest ELO from most recent match
                modeElo = modeMatches[0]?.newElo ?? DEFAULT_ELO;
            } else {
                // No data for this mode - skip this user
                continue;
            }

            const total = modeWins + modeLosses;
            if (total === 0) continue;

            players.push({
                uid: docSnap.id,
                displayName: data.displayName || "Oyuncu",
                elo: modeElo,
                rank: getRank(modeElo),
                wins: modeWins,
                losses: modeLosses,
                winRate: total > 0 ? (modeWins / total) * 100 : 0,
                bestTimeMs,
                worstTimeMs,
                mode,
                dailyStreak,
            });
        }

        // Sort by ELO descending and limit
        players.sort((a, b) => b.elo - a.elo);
        return players.slice(0, count);
    } catch (error) {
        console.error("Error fetching mode leaderboard:", error);
        return [];
    }
}

/**
 * Format milliseconds to mm:ss string
 */
export function formatTime(ms: number | null): string {
    if (!ms) return "-";
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

