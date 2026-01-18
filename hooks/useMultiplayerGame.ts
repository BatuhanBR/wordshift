"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ref, onValue, set, get, runTransaction } from "firebase/database";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { database, db } from "@/lib/firebase";
import type { GameRoom, PlayerProgress, ModeStats } from "@/lib/multiplayer/types";
import { calculateBothNewElos, getRank, DEFAULT_ELO } from "@/lib/multiplayer/elo";

export function useMultiplayerGame(roomId: string, playerId: string) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [myProgress, setMyProgress] = useState<PlayerProgress | null>(null);
  const [opponentProgress, setOpponentProgress] = useState<PlayerProgress | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [eloInfo, setEloInfo] = useState<{
    oldElo: number;
    newElo: number;
    eloChange: number;
  } | null>(null);

  // Ref to prevent double-processing of game end logic (ELO updates)
  const processedGameRef = useRef<string | null>(null);

  const opponentId = room?.players.player1.uid === playerId
    ? room?.players.player2.uid
    : room?.players.player1.uid;

  // Load room data
  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as GameRoom;
        setRoom(data);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // Timer countdown (synchronized with room startTime)
  useEffect(() => {
    if (!room || room.status === "finished") return;

    const updateTimer = () => {
      const elapsed = Date.now() - room.startTime;
      const remaining = Math.max(0, room.duration * 1000 - elapsed);
      setTimeLeft(Math.floor(remaining / 1000));
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [room]);

  // Load my progress
  useEffect(() => {
    if (!roomId || !playerId) return;

    const progressRef = ref(database, `progress/${roomId}/${playerId}`);
    const unsubscribe = onValue(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        setMyProgress(snapshot.val() as PlayerProgress);
      }
    });

    return () => unsubscribe();
  }, [roomId, playerId]);

  // Load opponent progress
  useEffect(() => {
    if (!roomId || !opponentId) return;

    const progressRef = ref(database, `progress/${roomId}/${opponentId}`);
    const unsubscribe = onValue(progressRef, (snapshot) => {
      if (snapshot.exists()) {
        setOpponentProgress(snapshot.val() as PlayerProgress);
      }
    });

    return () => unsubscribe();
  }, [roomId, opponentId]);

  // Check if game should end
  const checkGameEnd = useCallback(async () => {
    if (!room || !roomId) return;
    if (room.status === "finished") return; // Already finished

    const p1Progress = await get(ref(database, `progress/${roomId}/${room.players.player1.uid}`));
    const p2Progress = await get(ref(database, `progress/${roomId}/${room.players.player2.uid}`));

    // Get progress or use defaults
    // Prevent double processing for the same room
    // Prevent double processing for the same room
    if (processedGameRef.current === roomId) {
      return;
    }

    // LOCK: Mark as processed immediately to block concurrent executions
    // If it turns out the game isn't finished, we will unlock (set to null)
    processedGameRef.current = roomId;

    const p1 = p1Progress.exists()
      ? p1Progress.val() as PlayerProgress
      : { uid: room.players.player1.uid, finished: false, won: false, guesses: [], states: [], currentRow: 0 };

    const p2 = p2Progress.exists()
      ? p2Progress.val() as PlayerProgress
      : { uid: room.players.player2.uid, finished: false, won: false, guesses: [], states: [], currentRow: 0 };

    // Both finished or time's up
    const timeIsUp = timeLeft <= 0;

    // SAFETY: If the game is NOT ready to end, we must release the lock immediately
    // otherwise the game will be stuck in a "processing" state forever.
    if (!((p1.finished && p2.finished) || timeIsUp)) {
      processedGameRef.current = null;
    }

    if ((p1.finished && p2.finished) || timeIsUp) {
      let winner: string | undefined;
      let winnerGuessCount: number | undefined;
      let isDraw = false;

      // Determine winner based on new logic:
      // 1. Fewer guesses wins
      // 2. If equal guesses, faster time wins
      // 3. If neither won, it's a draw

      if (p1.won && !p2.won) {
        // P1 won, P2 didn't
        winner = p1.uid;
        winnerGuessCount = p1.currentRow; // currentRow is 1-indexed (1 = first guess)
      } else if (p2.won && !p1.won) {
        // P2 won, P1 didn't
        winner = p2.uid;
        winnerGuessCount = p2.currentRow;
      } else if (p1.won && p2.won) {
        // Both won - compare guesses first
        const p1Guesses = p1.currentRow;
        const p2Guesses = p2.currentRow;

        if (p1Guesses < p2Guesses) {
          // P1 won with fewer guesses
          winner = p1.uid;
          winnerGuessCount = p1Guesses;
        } else if (p2Guesses < p1Guesses) {
          // P2 won with fewer guesses
          winner = p2.uid;
          winnerGuessCount = p2Guesses;
        } else {
          // Equal guesses - compare time
          const p1Time = p1.finishTime || Infinity;
          const p2Time = p2.finishTime || Infinity;

          if (p1Time < p2Time) {
            winner = p1.uid;
            winnerGuessCount = p1Guesses;
          } else if (p2Time < p1Time) {
            winner = p2.uid;
            winnerGuessCount = p2Guesses;
          } else {
            // Truly equal - draw (shouldn't happen but handle it)
            isDraw = true;
          }
        }
      } else {
        // Neither won - draw
        isDraw = true;
      }

      // Update room to finished
      const updatedRoom: any = {
        ...room,
        status: "finished",
        endTime: Date.now(),
      };

      // Only add winner if it exists
      if (winner) {
        updatedRoom.winner = winner;
      }

      // Use Transaction to ensure only ONE instance finishes the game and updates ELOs
      const roomRef = ref(database, `rooms/${roomId}`);
      let transactionResult;

      try {
        transactionResult = await runTransaction(roomRef, (currentData) => {
          if (currentData === null) return currentData;
          if (currentData.status === "finished") {
            // Already finished by someone else/another thread
            return; // Abort
          }
          // Apply updates
          return {
            ...currentData,
            ...updatedRoom
          };
        });
      } catch (e) {
        console.error("Transaction failed", e);
        return;
      }

      // Lock is already set at the top function locally, but transaction confirms global lock.

      // Only proceed with ELO updates if WE were the ones who committed the transaction
      if (transactionResult.committed && transactionResult.snapshot.exists()) {
        // Update ELOs if there's a winner
        if (winner && !isDraw) {
          const winnerData = winner === room.players.player1.uid ? room.players.player1 : room.players.player2;
          const loserData = winner === room.players.player1.uid ? room.players.player2 : room.players.player1;
          const modeKey = room.wordLength.toString();
          const isPrivateMatch = room.isPrivate === true;

          // For private matches, skip ELO calculations and updates
          if (isPrivateMatch) {
            // Show no ELO change for private matches
            const myPlayerData = room.players.player1.uid === playerId ? room.players.player1 : room.players.player2;
            setEloInfo({
              oldElo: myPlayerData.elo,
              newElo: myPlayerData.elo,
              eloChange: 0,
            });

            // Calculate match duration
            const matchDuration = Date.now() - room.startTime;
            const winnerDuration = p1.uid === winner ? (p1.finishTime || matchDuration) - room.startTime : (p2.finishTime || matchDuration) - room.startTime;

            // Still save match history but without ELO change
            try {
              // Save match history for winner (no ELO change)
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
                guessCount: p1.uid === winner ? p1.currentRow : p2.currentRow,
                durationMs: winnerDuration,
                wordLength: room.wordLength,
                solution: room.solution,
                isPrivate: true,
                timestamp: serverTimestamp(),
              });

              // Save match history for loser (no ELO change)
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
                guessCount: p1.uid === loserData.uid ? p1.currentRow : p2.currentRow,
                durationMs: matchDuration,
                wordLength: room.wordLength,
                solution: room.solution,
                isPrivate: true,
                timestamp: serverTimestamp(),
              });
            } catch (error) {
              console.error("Failed to save private match history:", error);
            }
          } else {
            // Regular ranked match - calculate and update ELO

            // Get mode stats from Firestore for both players
            let winnerModeStats: ModeStats = { elo: DEFAULT_ELO, wins: 0, losses: 0, winStreak: 0, lossStreak: 0 };
            let loserModeStats: ModeStats = { elo: DEFAULT_ELO, wins: 0, losses: 0, winStreak: 0, lossStreak: 0 };

            // Fetch latest stats from Firestore to ensure we use the correct current ELO
            // IMPORTANT: Check room language to decide which ELO to use
            const roomLang = room.language || "tr";
            let winnerCurrentElo = DEFAULT_ELO;
            let loserCurrentElo = DEFAULT_ELO;
            let winnerStatsForCalc = { winStreak: 0 };
            let loserStatsForCalc = { winStreak: 0 };

            let winnerGlobalStats = {
              elo: DEFAULT_ELO, elo_en: DEFAULT_ELO,
              multiplayerWins: 0, multiplayerWins_en: 0,
              multiplayerLosses: 0, multiplayerLosses_en: 0,
              multiplayerWinStreak: 0, multiplayerWinStreak_en: 0,
              multiplayerLossStreak: 0, multiplayerLossStreak_en: 0
            };
            let loserGlobalStats = {
              elo: DEFAULT_ELO, elo_en: DEFAULT_ELO,
              multiplayerWins: 0, multiplayerWins_en: 0,
              multiplayerLosses: 0, multiplayerLosses_en: 0,
              multiplayerWinStreak: 0, multiplayerWinStreak_en: 0,
              multiplayerLossStreak: 0, multiplayerLossStreak_en: 0
            };

            try {
              const winnerRef = doc(db, "users", winnerData.uid);
              const winnerDoc = await getDoc(winnerRef);
              if (winnerDoc.exists()) {
                const data = winnerDoc.data();
                winnerGlobalStats = { ...winnerGlobalStats, ...data };

                if (roomLang === "en") {
                  winnerCurrentElo = data.elo_en || DEFAULT_ELO;
                  winnerStatsForCalc.winStreak = data.multiplayerWinStreak_en || 0;
                  // English mode uses global stats
                  winnerModeStats = {
                    elo: winnerCurrentElo,
                    wins: data.multiplayerWins_en || 0,
                    losses: data.multiplayerLosses_en || 0,
                    winStreak: data.multiplayerWinStreak_en || 0,
                    lossStreak: data.multiplayerLossStreak_en || 0
                  };
                } else {
                  // Turkish mode uses modeStats
                  if (data.modeStats?.[modeKey]) {
                    winnerModeStats = data.modeStats[modeKey];
                    winnerCurrentElo = winnerModeStats.elo; // Use mode-specific ELO
                    winnerStatsForCalc.winStreak = winnerModeStats.winStreak;
                  } else {
                    // Fallback for TR if no mode stats
                    winnerCurrentElo = data.elo || DEFAULT_ELO;
                  }
                }
              }

              const loserRef = doc(db, "users", loserData.uid);
              const loserDoc = await getDoc(loserRef);
              if (loserDoc.exists()) {
                const data = loserDoc.data();
                loserGlobalStats = { ...loserGlobalStats, ...data };

                if (roomLang === "en") {
                  loserCurrentElo = data.elo_en || DEFAULT_ELO;
                  loserStatsForCalc.winStreak = data.multiplayerWinStreak_en || 0;
                  loserModeStats = {
                    elo: loserCurrentElo,
                    wins: data.multiplayerWins_en || 0,
                    losses: data.multiplayerLosses_en || 0,
                    winStreak: data.multiplayerWinStreak_en || 0,
                    lossStreak: data.multiplayerLossStreak_en || 0
                  };
                } else {
                  if (data.modeStats?.[modeKey]) {
                    loserModeStats = data.modeStats[modeKey];
                    loserCurrentElo = loserModeStats.elo;
                    loserStatsForCalc.winStreak = loserModeStats.winStreak;
                  } else {
                    loserCurrentElo = data.elo || DEFAULT_ELO;
                  }
                }
              }
            } catch (error) {
              console.error("Failed to get latest stats:", error);
            }

            // Calculate ELO with bonuses using mode-specific ELO
            const {
              winnerNewElo,
              loserNewElo,
              winnerEloChange,
              loserEloChange,
              winnerPerformanceBonus,
              winnerStreakBonus
            } = calculateBothNewElos(
              winnerCurrentElo, // Use the fetched correct ELO
              loserCurrentElo,
              winnerGuessCount,
              winnerStatsForCalc.winStreak
            );

            // Store ELO info for current player IMMEDIATELY (before Firestore updates)
            // This ensures modal can open right away
            const isWinner = winner === playerId;
            const myNewElo = isWinner ? winnerNewElo : loserNewElo;
            const myEloChange = isWinner ? winnerEloChange : loserEloChange;
            // Calculate safeOldElo to ensure UI consistency (newElo - change = oldElo)
            // This protects against cases where DB gave us already-updated data
            const safeOldElo = myNewElo - myEloChange;

            setEloInfo({
              oldElo: safeOldElo,
              newElo: myNewElo,
              eloChange: myEloChange,
            });



            // Calculate match duration
            const matchDuration = Date.now() - room.startTime;
            const winnerDuration = p1.uid === winner ? (p1.finishTime || matchDuration) - room.startTime : (p2.finishTime || matchDuration) - room.startTime;
            const loserDuration = p1.uid === winner ? matchDuration : matchDuration;

            // Update Firestore (persistent ELO)
            try {
              // Update winner's stats in Firestore
              const winnerRef = doc(db, "users", winnerData.uid);
              const newWinnerModeStats: ModeStats = {
                elo: winnerNewElo,
                wins: winnerModeStats.wins + 1,
                losses: winnerModeStats.losses,
                winStreak: winnerModeStats.winStreak + 1,
                lossStreak: 0,
              };
              const eloField = roomLang === "en" ? "elo_en" : "elo";
              const winsField = roomLang === "en" ? "multiplayerWins_en" : "multiplayerWins";
              const winStreakField = roomLang === "en" ? "multiplayerWinStreak_en" : "multiplayerWinStreak";
              const lossStreakField = roomLang === "en" ? "multiplayerLossStreak_en" : "multiplayerLossStreak";

              // Prepare update data for winner
              const winnerUpdateData: any = {
                [eloField]: winnerNewElo,
                [winsField]: increment(1),
                [winStreakField]: increment(1),
                [lossStreakField]: 0,
              };
              // Only update modeStats for Turkish language (or current default behavior)
              if (roomLang !== "en") {
                winnerUpdateData[`modeStats.${modeKey}`] = newWinnerModeStats;
              }
              await updateDoc(winnerRef, winnerUpdateData);

              // Update loser's stats in Firestore
              const loserRef = doc(db, "users", loserData.uid);
              const newLoserModeStats: ModeStats = {
                elo: loserNewElo,
                wins: loserModeStats.wins,
                losses: loserModeStats.losses + 1,
                winStreak: 0,
                lossStreak: loserModeStats.lossStreak + 1,
              };
              const lossesField = roomLang === "en" ? "multiplayerLosses_en" : "multiplayerLosses";

              // Prepare update data for loser
              const loserUpdateData: any = {
                [eloField]: loserNewElo,
                [lossesField]: increment(1),
                [winStreakField]: 0,
                [lossStreakField]: increment(1),
              };
              // Only update modeStats for Turkish language
              if (roomLang !== "en") {
                loserUpdateData[`modeStats.${modeKey}`] = newLoserModeStats;
              }
              await updateDoc(loserRef, loserUpdateData);

              // Save match history for winner
              await addDoc(collection(db, "users", winnerData.uid, "matchHistory"), {
                roomId,
                opponentUid: loserData.uid,
                opponentName: loserData.displayName,
                won: true,
                eloChange: winnerEloChange,
                oldElo: winnerCurrentElo, // Use database ELO, not room player ELO to be consistent
                newElo: winnerNewElo,
                performanceBonus: winnerPerformanceBonus,
                streakBonus: winnerStreakBonus,
                guessCount: winnerGuessCount,
                durationMs: winnerDuration,
                wordLength: room.wordLength,
                solution: room.solution,
                language: roomLang,
                timestamp: serverTimestamp(),
              });

              // Save match history for loser
              await addDoc(collection(db, "users", loserData.uid, "matchHistory"), {
                roomId,
                opponentUid: winnerData.uid,
                opponentName: winnerData.displayName,
                won: false,
                eloChange: loserEloChange,
                oldElo: loserCurrentElo, // Use database ELO
                newElo: loserNewElo,
                performanceBonus: 0,
                streakBonus: 0,
                guessCount: p1.uid === loserData.uid ? p1.currentRow : p2.currentRow,
                durationMs: loserDuration,
                wordLength: room.wordLength,
                solution: room.solution,
                language: roomLang,
                timestamp: serverTimestamp(),
              });
            } catch (error) {
              console.error("Failed to update ELO:", error);
            }
          } // End of ranked match else block
        } else if (isDraw) {
          // Handle draw - no ELO change, but save match history
          const myPlayerData = room.players.player1.uid === playerId ? room.players.player1 : room.players.player2;
          setEloInfo({
            oldElo: myPlayerData.elo,
            newElo: myPlayerData.elo,
            eloChange: 0,
          });

          try {
            const p1Ref = doc(db, "users", room.players.player1.uid);
            const p2Ref = doc(db, "users", room.players.player2.uid);

            // Save match history for both (draw)
            await addDoc(collection(db, "users", room.players.player1.uid, "matchHistory"), {
              roomId,
              opponentUid: room.players.player2.uid,
              opponentName: room.players.player2.displayName,
              won: false,
              eloChange: 0,
              oldElo: room.players.player1.elo,
              newElo: room.players.player1.elo,
              performanceBonus: 0,
              streakBonus: 0,
              guessCount: p1.currentRow,
              durationMs: Date.now() - room.startTime,
              wordLength: room.wordLength,
              solution: room.solution,
              isDraw: true,
              timestamp: serverTimestamp(),
            });

            await addDoc(collection(db, "users", room.players.player2.uid, "matchHistory"), {
              roomId,
              opponentUid: room.players.player1.uid,
              opponentName: room.players.player1.displayName,
              won: false,
              eloChange: 0,
              oldElo: room.players.player2.elo,
              newElo: room.players.player2.elo,
              performanceBonus: 0,
              streakBonus: 0,
              guessCount: p2.currentRow,
              durationMs: Date.now() - room.startTime,
              wordLength: room.wordLength,
              solution: room.solution,
              isDraw: true,
              timestamp: serverTimestamp(),
            });
          } catch (error) {
            console.error("Failed to save draw match:", error);
          }
        }
      }
    }
  }, [room, roomId, timeLeft, playerId]);

  // Update my progress
  const updateProgress = useCallback(
    async (progress: Partial<PlayerProgress>) => {
      if (!roomId || !playerId) return;

      const currentProgress = myProgress || {
        uid: playerId,
        guesses: [],
        states: [],
        currentRow: 0,
        finished: false,
        won: false,
      };

      const updated = { ...currentProgress, ...progress };

      // Remove undefined values (Firebase doesn't accept them)
      const cleaned = JSON.parse(JSON.stringify(updated));

      await set(ref(database, `progress/${roomId}/${playerId}`), cleaned);

      // Check if game should end
      if (updated.finished) {
        await checkGameEnd();
      }
    },
    [roomId, playerId, myProgress, checkGameEnd]
  );

  // Auto-end game when time runs out
  useEffect(() => {
    if (!room || !roomId || room.status === "finished") return;
    if (timeLeft !== 0) return;

    // Time's up! End the game
    const endGame = async () => {
      // Mark my progress as finished if not already
      if (myProgress && !myProgress.finished) {
        await updateProgress({
          finished: true,
          won: false,
        });
      } else {
        // If already finished, just trigger checkGameEnd
        await checkGameEnd();
      }
    };

    // Small delay to ensure timer shows 0:00
    const timeout = setTimeout(endGame, 500);
    return () => clearTimeout(timeout);
  }, [timeLeft, room, roomId, myProgress, updateProgress, checkGameEnd]);

  // Determine if I won based on room winner (not local state)
  const didIWin = room?.status === "finished" && room?.winner === playerId;
  const isDraw = room?.status === "finished" && !room?.winner;
  const gameFinished = room?.status === "finished";

  // Fallback ELO calculation for the player who didn't trigger checkGameEnd
  // This ensures both players see correct ELO changes in the result modal
  useEffect(() => {
    if (!room || room.status !== "finished" || eloInfo !== null) return;

    const calculateFallbackElo = async () => {
      // Game is finished but we don't have ELO info - calculate it now
      const myPlayerData = room.players.player1.uid === playerId
        ? room.players.player1
        : room.players.player2;
      const opponentPlayerData = room.players.player1.uid === playerId
        ? room.players.player2
        : room.players.player1;

      if (isDraw) {
        // Draw - no ELO change
        setEloInfo({
          oldElo: myPlayerData.elo,
          newElo: myPlayerData.elo,
          eloChange: 0,
        });
      } else if (room.winner) {
        // Someone won - calculate ELO changes using FRESH DB DATA
        // This mirrors the Transaction logic to ensure consistency

        const isWinner = room.winner === playerId;
        const winnerUid = room.winner;
        const loserUid = isWinner ? opponentPlayerData.uid : myPlayerData.uid;

        // Fetch guess count from Progress Data (accurate)
        let winnerGuessCount = 6;
        try {
          const winnerProgressSnap = await get(ref(database, `progress/${roomId}/${winnerUid}`));
          if (winnerProgressSnap.exists()) {
            winnerGuessCount = winnerProgressSnap.val().currentRow;
          }
        } catch (e) {
          winnerGuessCount = 6;
        }

        // Fetch latest stats from DB to get correct ELO and Steak
        const roomLang = room.language || "tr";
        const modeKey = room.wordLength.toString();

        let winnerCurrentElo = DEFAULT_ELO;
        let loserCurrentElo = DEFAULT_ELO;
        let winnerWinStreak = 0;

        try {
          const winnerDoc = await getDoc(doc(db, "users", winnerUid));
          if (winnerDoc.exists()) {
            const d = winnerDoc.data();
            if (roomLang === "en") {
              winnerCurrentElo = d.elo_en || DEFAULT_ELO;
              winnerWinStreak = d.multiplayerWinStreak_en || 0;
            } else {
              winnerCurrentElo = d.modeStats?.[modeKey]?.elo || d.elo || DEFAULT_ELO;
              winnerWinStreak = d.modeStats?.[modeKey]?.winStreak || 0;
            }
          }

          const loserDoc = await getDoc(doc(db, "users", loserUid));
          if (loserDoc.exists()) {
            const d = loserDoc.data();
            if (roomLang === "en") {
              loserCurrentElo = d.elo_en || DEFAULT_ELO;
            } else {
              loserCurrentElo = d.modeStats?.[modeKey]?.elo || d.elo || DEFAULT_ELO;
            }
          }

          // Calculate
          const { winnerNewElo, loserNewElo, winnerEloChange, loserEloChange } = calculateBothNewElos(
            winnerCurrentElo,
            loserCurrentElo,
            winnerGuessCount,
            winnerWinStreak
          );

          const myNewElo = isWinner ? winnerNewElo : loserNewElo;
          const myEloChange = isWinner ? winnerEloChange : loserEloChange;
          const safeOldElo = myNewElo - myEloChange;

          setEloInfo({
            oldElo: safeOldElo,
            newElo: myNewElo,
            eloChange: myEloChange,
          });

        } catch (e) {
          console.error("Fallback ELO calc failed", e);
          // Ultra-fallback: use Room data (inaccurate but better than crash)
          // But we shouldn't hit this often
        }
      }
    };

    calculateFallbackElo();
  }, [room, playerId, eloInfo, isDraw]);

  return {
    room,
    myProgress,
    opponentProgress,
    timeLeft,
    loading,
    updateProgress,
    isMyTurn: true, // In Wordle, both play simultaneously
    gameFinished,
    didIWin,
    isDraw,
    eloInfo,
  };
}
