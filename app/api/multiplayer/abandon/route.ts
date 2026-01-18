import { NextRequest, NextResponse } from "next/server";
import { ref, set, get, runTransaction } from "firebase/database";
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { database, db } from "@/lib/firebase";
import { calculateBothNewElos, DEFAULT_ELO } from "@/lib/multiplayer/elo";
import type { GameRoom, PlayerProgress, ModeStats } from "@/lib/multiplayer/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { roomId, playerId, progress } = body;

        if (!roomId || !playerId || !progress) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Get current room state
        const roomRef = ref(database, `rooms/${roomId}`);
        const roomSnapshot = await get(roomRef);

        if (!roomSnapshot.exists()) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        const room = roomSnapshot.val() as GameRoom;

        // If game is already finished, don't process again
        if (room.status === "finished") {
            return NextResponse.json({ success: true, message: "Game already finished" });
        }

        // Update the abandoning player's progress
        await set(ref(database, `progress/${roomId}/${playerId}`), progress);

        // Determine the winner (the other player)
        const winner = room.players.player1.uid === playerId
            ? room.players.player2.uid
            : room.players.player1.uid;

        const winnerData = winner === room.players.player1.uid ? room.players.player1 : room.players.player2;
        const loserData = winner === room.players.player1.uid ? room.players.player2 : room.players.player1;

        // Use transaction to finish the game
        const transactionResult = await runTransaction(roomRef, (currentData) => {
            if (currentData === null) return currentData;
            if (currentData.status === "finished") {
                return; // Abort - already finished
            }
            return {
                ...currentData,
                status: "finished",
                winner,
                endTime: Date.now(),
                abandonedBy: playerId, // Mark who abandoned
            };
        });

        // If transaction was committed, update ELOs and stats
        if (transactionResult.committed && transactionResult.snapshot.exists()) {
            const isPrivateMatch = room.isPrivate === true;
            const roomLang = room.language || "tr";
            const modeKey = room.wordLength.toString();

            // Get opponent's progress to determine their guess count
            const opponentProgressSnap = await get(ref(database, `progress/${roomId}/${winner}`));
            let winnerGuessCount = 6; // Default if opponent hasn't made any guesses
            if (opponentProgressSnap.exists()) {
                winnerGuessCount = opponentProgressSnap.val().currentRow || 6;
            }

            // Calculate match duration
            const matchDuration = Date.now() - room.startTime;

            if (!isPrivateMatch) {
                // Get current ELOs from Firestore
                let winnerCurrentElo = DEFAULT_ELO;
                let loserCurrentElo = DEFAULT_ELO;
                let winnerModeStats: ModeStats = { elo: DEFAULT_ELO, wins: 0, losses: 0, winStreak: 0, lossStreak: 0 };
                let loserModeStats: ModeStats = { elo: DEFAULT_ELO, wins: 0, losses: 0, winStreak: 0, lossStreak: 0 };
                let winnerWinStreak = 0;

                try {
                    const winnerDoc = await getDoc(doc(db, "users", winnerData.uid));
                    if (winnerDoc.exists()) {
                        const d = winnerDoc.data();
                        if (roomLang === "en") {
                            winnerCurrentElo = d.elo_en || DEFAULT_ELO;
                            winnerWinStreak = d.multiplayerWinStreak_en || 0;
                            winnerModeStats = {
                                elo: winnerCurrentElo,
                                wins: d.multiplayerWins_en || 0,
                                losses: d.multiplayerLosses_en || 0,
                                winStreak: d.multiplayerWinStreak_en || 0,
                                lossStreak: d.multiplayerLossStreak_en || 0,
                            };
                        } else {
                            winnerCurrentElo = d.modeStats?.[modeKey]?.elo || d.elo || DEFAULT_ELO;
                            winnerWinStreak = d.modeStats?.[modeKey]?.winStreak || 0;
                            if (d.modeStats?.[modeKey]) {
                                winnerModeStats = d.modeStats[modeKey];
                            }
                        }
                    }

                    const loserDoc = await getDoc(doc(db, "users", loserData.uid));
                    if (loserDoc.exists()) {
                        const d = loserDoc.data();
                        if (roomLang === "en") {
                            loserCurrentElo = d.elo_en || DEFAULT_ELO;
                            loserModeStats = {
                                elo: loserCurrentElo,
                                wins: d.multiplayerWins_en || 0,
                                losses: d.multiplayerLosses_en || 0,
                                winStreak: d.multiplayerWinStreak_en || 0,
                                lossStreak: d.multiplayerLossStreak_en || 0,
                            };
                        } else {
                            loserCurrentElo = d.modeStats?.[modeKey]?.elo || d.elo || DEFAULT_ELO;
                            if (d.modeStats?.[modeKey]) {
                                loserModeStats = d.modeStats[modeKey];
                            }
                        }
                    }

                    // Calculate ELO changes
                    const { winnerNewElo, loserNewElo, winnerEloChange, loserEloChange, winnerPerformanceBonus, winnerStreakBonus } =
                        calculateBothNewElos(winnerCurrentElo, loserCurrentElo, winnerGuessCount, winnerWinStreak);

                    // Update winner stats
                    const winnerRef = doc(db, "users", winnerData.uid);
                    const eloField = roomLang === "en" ? "elo_en" : "elo";
                    const winsField = roomLang === "en" ? "multiplayerWins_en" : "multiplayerWins";
                    const winStreakField = roomLang === "en" ? "multiplayerWinStreak_en" : "multiplayerWinStreak";
                    const lossStreakField = roomLang === "en" ? "multiplayerLossStreak_en" : "multiplayerLossStreak";

                    const winnerUpdateData: any = {
                        [eloField]: winnerNewElo,
                        [winsField]: increment(1),
                        [winStreakField]: increment(1),
                        [lossStreakField]: 0,
                    };
                    if (roomLang !== "en") {
                        winnerUpdateData[`modeStats.${modeKey}`] = {
                            elo: winnerNewElo,
                            wins: winnerModeStats.wins + 1,
                            losses: winnerModeStats.losses,
                            winStreak: winnerModeStats.winStreak + 1,
                            lossStreak: 0,
                        };
                    }
                    await updateDoc(winnerRef, winnerUpdateData);

                    // Update loser stats
                    const loserRef = doc(db, "users", loserData.uid);
                    const lossesField = roomLang === "en" ? "multiplayerLosses_en" : "multiplayerLosses";

                    const loserUpdateData: any = {
                        [eloField]: loserNewElo,
                        [lossesField]: increment(1),
                        [winStreakField]: 0,
                        [lossStreakField]: increment(1),
                    };
                    if (roomLang !== "en") {
                        loserUpdateData[`modeStats.${modeKey}`] = {
                            elo: loserNewElo,
                            wins: loserModeStats.wins,
                            losses: loserModeStats.losses + 1,
                            winStreak: 0,
                            lossStreak: loserModeStats.lossStreak + 1,
                        };
                    }
                    await updateDoc(loserRef, loserUpdateData);

                    // Save match history for both players
                    await addDoc(collection(db, "users", winnerData.uid, "matchHistory"), {
                        roomId,
                        opponentUid: loserData.uid,
                        opponentName: loserData.displayName,
                        won: true,
                        eloChange: winnerEloChange,
                        oldElo: winnerCurrentElo,
                        newElo: winnerNewElo,
                        performanceBonus: winnerPerformanceBonus,
                        streakBonus: winnerStreakBonus,
                        guessCount: winnerGuessCount,
                        durationMs: matchDuration,
                        wordLength: room.wordLength,
                        solution: room.solution,
                        language: roomLang,
                        opponentAbandoned: true,
                        timestamp: serverTimestamp(),
                    });

                    await addDoc(collection(db, "users", loserData.uid, "matchHistory"), {
                        roomId,
                        opponentUid: winnerData.uid,
                        opponentName: winnerData.displayName,
                        won: false,
                        eloChange: loserEloChange,
                        oldElo: loserCurrentElo,
                        newElo: loserNewElo,
                        performanceBonus: 0,
                        streakBonus: 0,
                        guessCount: progress.currentRow || 0,
                        durationMs: matchDuration,
                        wordLength: room.wordLength,
                        solution: room.solution,
                        language: roomLang,
                        abandoned: true,
                        timestamp: serverTimestamp(),
                    });
                } catch (error) {
                    console.error("Failed to update ELO for abandoned game:", error);
                }
            } else {
                // Private match - just save history without ELO changes
                try {
                    await addDoc(collection(db, "users", winnerData.uid, "matchHistory"), {
                        roomId,
                        opponentUid: loserData.uid,
                        opponentName: loserData.displayName,
                        won: true,
                        eloChange: 0,
                        oldElo: winnerData.elo,
                        newElo: winnerData.elo,
                        performanceBonus: 0,
                        streakBonus: 0,
                        guessCount: winnerGuessCount,
                        durationMs: matchDuration,
                        wordLength: room.wordLength,
                        solution: room.solution,
                        isPrivate: true,
                        opponentAbandoned: true,
                        timestamp: serverTimestamp(),
                    });

                    await addDoc(collection(db, "users", loserData.uid, "matchHistory"), {
                        roomId,
                        opponentUid: winnerData.uid,
                        opponentName: winnerData.displayName,
                        won: false,
                        eloChange: 0,
                        oldElo: loserData.elo,
                        newElo: loserData.elo,
                        performanceBonus: 0,
                        streakBonus: 0,
                        guessCount: progress.currentRow || 0,
                        durationMs: matchDuration,
                        wordLength: room.wordLength,
                        solution: room.solution,
                        isPrivate: true,
                        abandoned: true,
                        timestamp: serverTimestamp(),
                    });
                } catch (error) {
                    console.error("Failed to save private match history for abandoned game:", error);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Abandon endpoint error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
