import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, increment, collection } from "firebase/firestore";
import { getUtcDayIndex } from "./seed";

interface GameResult {
  userId: string;
  modeLen: number;
  modeType?: "daily" | "practice";
  language?: "tr" | "en";
  won: boolean;
  guesses: number;
  durationMs?: number;
  grid: string; // Emoji formatında sonuç
}

export async function saveGameResult(result: GameResult): Promise<void> {
  const dayIndex = getUtcDayIndex();

  try {
    // 1. Oyun kaydını ekle
    const gameRef = doc(collection(db, "games"));
    await setDoc(gameRef, {
      userId: result.userId,
      dayIndex: result.modeType === "practice" ? null : dayIndex,
      modeLen: result.modeLen,
      modeType: result.modeType || "daily",
      language: result.language || "tr",
      guesses: result.guesses,
      won: result.won,
      durationMs: result.durationMs || null,
      grid: result.grid,
      createdAt: new Date().toISOString(),
    });

    // 2. İstatistikleri güncelle
    const modeKey = result.modeType || "daily";
    const langKey = result.language || "tr";
    const statsRef = doc(db, "stats", `${result.userId}_${result.modeLen}_${modeKey}_${langKey}`);
    const statsSnap = await getDoc(statsRef);

    if (!statsSnap.exists()) {
      // İlk oyun
      await setDoc(statsRef, {
        userId: result.userId,
        modeLen: result.modeLen,
        modeType: modeKey,
        gamesPlayed: 1,
        wins: result.won ? 1 : 0,
        currentStreak: modeKey === "daily" ? (result.won ? 1 : 0) : 0,
        maxStreak: modeKey === "daily" ? (result.won ? 1 : 0) : 0,
        guessDistribution: result.won ? { [result.guesses]: 1 } : {},
        totalGuesses: result.won ? result.guesses : 0,
        bestTimeMs: result.won && result.durationMs ? result.durationMs : null,
        lastPlayedDay: modeKey === "daily" ? dayIndex : null,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Var olan istatistikleri güncelle
      const currentData = statsSnap.data();
      const lastPlayedDay = currentData.lastPlayedDay || 0;

      let newStreak = currentData.currentStreak || 0;

      if (modeKey === "daily" && result.won) {
        // Streak hesapla: eğer son oyun dün ise streak devam eder
        if (dayIndex === lastPlayedDay + 1) {
          newStreak++;
        } else if (dayIndex === lastPlayedDay) {
          // Aynı gün tekrar oynuyorsa streak değişmez
          newStreak = currentData.currentStreak || 1;
        } else {
          // Streak kırıldı, yeniden başla
          newStreak = 1;
        }
      } else if (modeKey === "daily" && !result.won) {
        // Kaybedildi, streak sıfırlandı
        newStreak = 0;
      }

      const newMaxStreak = modeKey === "daily" ? Math.max(currentData.maxStreak || 0, newStreak) : currentData.maxStreak || 0;

      const guessDistribution = { ...(currentData.guessDistribution || {}) };
      if (result.won) {
        guessDistribution[result.guesses] = (guessDistribution[result.guesses] || 0) + 1;
      }

      const newBestTime =
        result.won && result.durationMs && (!currentData.bestTimeMs || result.durationMs < currentData.bestTimeMs)
          ? result.durationMs
          : currentData.bestTimeMs;

      await updateDoc(statsRef, {
        gamesPlayed: increment(1),
        wins: result.won ? increment(1) : currentData.wins,
        currentStreak: modeKey === "daily" ? newStreak : 0,
        maxStreak: newMaxStreak,
        guessDistribution,
        totalGuesses: result.won ? increment(result.guesses) : currentData.totalGuesses,
        bestTimeMs: newBestTime,
        lastPlayedDay: modeKey === "daily" ? dayIndex : null,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Oyun kaydedilirken hata:", error);
    throw error;
  }
}

export function generateGrid(
  rows: string[][],
  rowStates: ("correct" | "present" | "absent" | "empty")[][],
  currentRow: number
): string {
  const lines: string[] = [];

  for (let i = 0; i <= currentRow; i++) {
    const states = rowStates[i];
    const line = states
      .map((state) => {
        if (state === "correct") return "🟩";
        if (state === "present") return "🟨";
        if (state === "absent") return "⬜";
        return "⬜";
      })
      .join("");
    lines.push(line);
  }

  return lines.join("\n");
}

