import { NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already initialized
function getAdminDb() {
    if (getApps().length === 0) {
        // Use default credentials for local development
        // In production, set GOOGLE_APPLICATION_CREDENTIALS or use service account
        initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
    return getFirestore();
}

interface LeaderboardPlayer {
    uid: string;
    displayName: string;
    elo: number;
    wins: number;
    losses: number;
    winRate: number;
    bestTimeMs: number | null;
    worstTimeMs: number | null;
}

const DEFAULT_ELO = 1200;

const RANKS = [
    { name: "Bronz", emoji: "🥉", minElo: 0 },
    { name: "Gümüş", emoji: "🥈", minElo: 1100 },
    { name: "Altın", emoji: "🥇", minElo: 1300 },
    { name: "Platin", emoji: "💎", minElo: 1500 },
    { name: "Elmas", emoji: "💠", minElo: 1700 },
    { name: "Grandmaster", emoji: "👑", minElo: 2000 },
];

function getRank(elo: number) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (elo >= RANKS[i].minElo) {
            return RANKS[i];
        }
    }
    return RANKS[0];
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode");
        const count = parseInt(searchParams.get("count") || "100");

        const db = getAdminDb();
        const usersRef = db.collection("users");

        let players: LeaderboardPlayer[] = [];

        if (mode && mode !== "all") {
            // Mode-specific leaderboard
            const modeNum = parseInt(mode);
            const snapshot = await usersRef.get();

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const modeStats = data.modeStats?.[mode];

                // Get match history for this mode
                let modeMatches: any[] = [];
                let bestTimeMs: number | null = null;
                let worstTimeMs: number | null = null;

                try {
                    const historyRef = usersRef.doc(doc.id).collection("matchHistory");
                    const historySnap = await historyRef.orderBy("timestamp", "desc").limit(100).get();

                    historySnap.docs.forEach((matchDoc) => {
                        const match = matchDoc.data();
                        if (Number(match.wordLength) === modeNum) {
                            modeMatches.push(match);
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
                    // Ignore errors
                }

                let modeElo: number, modeWins: number, modeLosses: number;

                if (modeStats && (modeStats.wins > 0 || modeStats.losses > 0)) {
                    modeElo = modeStats.elo ?? DEFAULT_ELO;
                    modeWins = modeStats.wins ?? 0;
                    modeLosses = modeStats.losses ?? 0;
                } else if (modeMatches.length > 0) {
                    modeWins = modeMatches.filter(m => m.won && !m.isDraw).length;
                    modeLosses = modeMatches.filter(m => !m.won && !m.isDraw).length;
                    modeElo = modeMatches[0]?.newElo ?? DEFAULT_ELO;
                } else {
                    continue;
                }

                const total = modeWins + modeLosses;
                if (total === 0) continue;

                players.push({
                    uid: doc.id,
                    displayName: data.displayName || "Oyuncu",
                    elo: modeElo,
                    wins: modeWins,
                    losses: modeLosses,
                    winRate: total > 0 ? (modeWins / total) * 100 : 0,
                    bestTimeMs,
                    worstTimeMs,
                });
            }

            // Sort by ELO
            players.sort((a, b) => b.elo - a.elo);
            players = players.slice(0, count);

        } else {
            // Global leaderboard
            const snapshot = await usersRef.orderBy("elo", "desc").limit(count).get();

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const wins = data.multiplayerWins || 0;
                const losses = data.multiplayerLosses || 0;
                const total = wins + losses;

                let bestTimeMs: number | null = null;
                let worstTimeMs: number | null = null;

                try {
                    const historyRef = usersRef.doc(doc.id).collection("matchHistory");
                    const historySnap = await historyRef.orderBy("timestamp", "desc").limit(50).get();

                    historySnap.docs.forEach((matchDoc) => {
                        const match = matchDoc.data();
                        if (match.won && match.durationMs) {
                            if (!bestTimeMs || match.durationMs < bestTimeMs) {
                                bestTimeMs = match.durationMs;
                            }
                            if (!worstTimeMs || match.durationMs > worstTimeMs) {
                                worstTimeMs = match.durationMs;
                            }
                        }
                    });
                } catch (e) {
                    // Ignore errors
                }

                players.push({
                    uid: doc.id,
                    displayName: data.displayName || "Oyuncu",
                    elo: data.elo || DEFAULT_ELO,
                    wins,
                    losses,
                    winRate: total > 0 ? (wins / total) * 100 : 0,
                    bestTimeMs,
                    worstTimeMs,
                });
            }
        }

        // Add rank to each player
        const playersWithRank = players.map(p => ({
            ...p,
            rank: getRank(p.elo),
        }));

        return NextResponse.json({ players: playersWithRank });
    } catch (error) {
        console.error("Leaderboard API error:", error);
        return NextResponse.json({ players: [], error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
