"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Row } from "@/components/Row";
import { Keyboard } from "@/components/Keyboard";
import { evaluateGuess, type LetterState, isWin } from "@/lib/game/engine";
import { sanitizeGuess } from "@/lib/utils/tr-normalize";
import { SOLUTION_WORDS } from "@/lib/words/solution-list";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveGameResult, generateGrid } from "@/lib/game/save-game";
import { ResultModal } from "@/components/ResultModal";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, updateDoc, setDoc, increment, collection } from "firebase/firestore";
import { calculateGameRewards, calculateNewProgress } from "@/lib/progress";
import { updateQuestProgress } from "@/lib/quests/manager";
import { Achievement } from "@/lib/achievements/types";
import { checkNewAchievements, unlockAchievements, buildUserStats } from "@/lib/achievements/manager";

const ATTEMPTS = 6;

export function Board({ initialLen, modeType = "daily" }: { initialLen?: number; modeType?: "daily" | "practice" } = {}) {
    const { user, userData, refreshUserData } = useAuth();
    const { language, t } = useLanguage();

    // Get user's equipped theme
    const userTheme = userData?.equipped?.theme || "default";
    const [wordLength, setWordLength] = useState<number>(5);
    const [rows, setRows] = useState<string[][]>(Array.from({ length: ATTEMPTS }, () => []));
    const [rowStates, setRowStates] = useState<(LetterState | "empty")[][]>([]);
    const [currentRow, setCurrentRow] = useState(0);
    const [gameOver, setGameOver] = useState<null | { win: boolean }>(null);
    const [shakeRow, setShakeRow] = useState<number | null>(null);
    const [revealing, setRevealing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [resultGrid, setResultGrid] = useState("");
    const [resultWon, setResultWon] = useState(false);
    const [practiceStreak, setPracticeStreak] = useState(0);
    const [practiceHistory, setPracticeHistory] = useState<{ word: string; won: boolean }[]>([]);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const timerRef = useRef<number | null>(null);
    const [startTime] = useState<number>(Date.now());
    const onKeyRef = useRef<(k: string) => void>(() => { });

    const [solution, setSolution] = useState<string | null>(null);
    const [earnedRewards, setEarnedRewards] = useState<{ xp: number; coins: number } | null>(null);
    const [dailyStats, setDailyStats] = useState<{ guesses: number; durationMs: number; solution: string; won?: boolean; lastGuess?: string } | null>(null);
    const [newUnlockedAchievements, setNewUnlockedAchievements] = useState<Achievement[]>([]);

    // Powerups
    const [eliminatedLetters, setEliminatedLetters] = useState<string[]>([]);

    // Guest daily play limit
    const [guestLocked, setGuestLocked] = useState(false);

    // Check if guest already played today
    useEffect(() => {
        if (!user && modeType === "daily") {
            const todayStr = new Date().toISOString().split('T')[0];
            const guestPlays = localStorage.getItem('guestDailyPlays');
            if (guestPlays) {
                try {
                    const parsed = JSON.parse(guestPlays);
                    if (parsed[todayStr]?.[wordLength]) {
                        setGuestLocked(true);
                    }
                } catch (e) {
                    // Invalid JSON, ignore
                }
            }
        } else {
            setGuestLocked(false);
        }
    }, [user, modeType, wordLength]);

    // Hint Logic
    const handlePowerup = async (type: "hint" | "eliminate") => {
        if (!user || gameOver || !solution) return;

        const count = userData?.inventory?.powerups?.[type] || 0;
        if (count <= 0) {
            setMessage("Güçlendiricin kalmadı! (Mağazadan al)");
            setTimeout(() => setMessage(null), 2000);
            return;
        }

        if (type === "hint") {
            const currentLen = rows[currentRow].length;
            if (currentLen >= wordLength) {
                setMessage("Önce satırı boşalt!");
                setTimeout(() => setMessage(null), 1500);
                return;
            }
            // Auto-fill next char
            const char = solution[currentLen];
            onKeyRef.current(char); // Simulate key press
            setMessage("🔍 İpucu Kullanıldı!");
        }

        if (type === "eliminate") {
            const alphabet = "abcçdefgğhıijklmnoöprsştuüvyz";
            const presentLetters = new Set(solution.split(""));
            const candidates = alphabet.split("").filter(c =>
                !presentLetters.has(c) &&
                !letterHints[c] && // Not already known absent/present/correct
                !eliminatedLetters.includes(c)
            );

            if (candidates.length === 0) {
                setMessage("Elenecek harf kalmadı!");
                setTimeout(() => setMessage(null), 1500);
                return;
            }

            // Pick up to 4 random letters
            const toEliminate: string[] = [];
            for (let i = 0; i < 4 && candidates.length > 0; i++) {
                const rnd = Math.floor(Math.random() * candidates.length);
                toEliminate.push(candidates[rnd]);
                candidates.splice(rnd, 1);
            }

            setEliminatedLetters(prev => [...prev, ...toEliminate]);
            setMessage("🧹 4 Harf Elendi!");
        }

        // Decrement Inventory
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                [`inventory.powerups.${type}`]: increment(-1)
            });
            await refreshUserData();
        } catch (e) {
            console.error("Powerup use error", e);
        }

        setTimeout(() => setMessage(null), 1500);
    };

    const letterHints = useMemo(() => {
        const hints: Record<string, LetterState> = {};
        rowStates.forEach((states, r) => {
            states.forEach((st, c) => {
                const ch = rows[r]?.[c];
                if (!ch || st === "empty") return;
                const prev = hints[ch];
                // correct > present > absent öncelik
                if (st === "correct" || (st === "present" && prev !== "correct") || (!prev && st === "absent")) {
                    hints[ch] = st as LetterState;
                }
            });
        });
        return hints;
    }, [rows, rowStates]);

    const commitRow = useCallback(async () => {
        const guess = sanitizeGuess(rows[currentRow].join(""));
        if (guess.length !== wordLength) return;
        // Sunucuda doğrula
        try {
            const url = new URL(window.location.href);
            const len = Number(url.searchParams.get("len")) || wordLength;
            const res = await fetch("/api/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ word: guess, len, lang: language }) });
            const data = await res.json();
            if (!data.ok) {
                setShakeRow(currentRow);
                setTimeout(() => setShakeRow(null), 500);
                const msg = data.reason === "list_unavailable"
                    ? (language === "en" ? "Loading dictionary..." : "Sözlük yükleniyor, tekrar dene")
                    : data.reason === "non_turkish" || data.reason === "non_english"
                        ? (language === "en" ? "Only English letters" : "Sadece Türkçe harfler")
                        : (language === "en" ? "Not in word list" : "Sözlükte yok");
                setMessage(msg);
                setTimeout(() => setMessage(null), 1200);
                return;
            }
        } catch {
            return;
        }
        if (!solution) return;
        setRevealing(true);
        const ev = evaluateGuess(guess, solution);
        const STEP_DELAY = 220;
        const ANIM_MS = 350; // CSS flip süresi
        // Tüm durumları tek seferde yaz; animasyonlar delay ile sıraya girecek
        setRowStates((prev) => {
            const copy = prev.map((row) => [...row]);
            copy[currentRow] = ev.states;
            return copy as (LetterState | "empty")[][];
        });
        // Toplam süre kadar bekle ve sonuç/ilerleme yap
        const totalMs = (ev.states.length - 1) * STEP_DELAY + ANIM_MS + 60;
        setTimeout(async () => {
            const won = isWin(ev);
            const isLastAttempt = currentRow + 1 >= ATTEMPTS;
            // Kaydetme ve paylaşım için grid'i baştan hazırla
            const grid = generateGrid(rows, rowStates, currentRow);

            if (won || isLastAttempt) {
                // Günlük: modal, Pratik: otomatik yeni kelime
                if (modeType === "daily") {
                    setGameOver({ win: won });
                    setRevealing(false);
                    setResultGrid(grid);
                    setResultWon(won);
                    setShowResult(true);

                    if (user && userData) {
                        const durationMs = Date.now() - startTime;

                        // CRITICAL: Use actual solution length, not wordLength state!
                        // wordLength state can change during gameplay, but solution.length is the truth
                        const actualWordLength = solution?.length || wordLength;

                        // 1. Daily Limit Check
                        const todayStr = new Date().toISOString().split('T')[0];
                        const dailyHistory: {
                            date?: string;
                            modes?: Record<number, boolean>;
                            stats?: Record<number, { guesses: number; durationMs: number; solution: string; won?: boolean; lastGuess?: string }>;
                        } = userData.dailyHistory || {};
                        // Eğer tarih farklıysa sıfırla
                        if (dailyHistory.date !== todayStr) {
                            dailyHistory.date = todayStr;
                            dailyHistory.modes = {};
                            dailyHistory.stats = {};
                        }

                        // Bu mod bugün oynanmış kazanılmış mı?
                        const alreadyWonToday = dailyHistory.modes?.[actualWordLength];

                        let xpToAdd = 0;
                        let coinsToAdd = 0;

                        // Mark as played today (win or lose)
                        if (!dailyHistory.modes) dailyHistory.modes = {};
                        if (!dailyHistory.stats) dailyHistory.stats = {};

                        // Sadece bu mod için true yapıyoruz - use actual word length!
                        dailyHistory.modes[actualWordLength] = true;
                        dailyHistory.stats[actualWordLength] = {
                            guesses: currentRow + 1,
                            durationMs: durationMs,
                            solution: solution || "",
                            won: won,
                            lastGuess: rows[currentRow]?.join("").toUpperCase() || ""
                        };

                        // Sadece kazanırsa ve bugün ilk kez kazanıyorsa ödül ver
                        if (won) {
                            const rewards = calculateGameRewards(
                                actualWordLength,
                                true,
                                (ATTEMPTS - currentRow) * 50,
                                currentRow + 1,
                                durationMs / 1000
                            );
                            xpToAdd = rewards.xp;
                            coinsToAdd = rewards.coins;
                        }

                        // UI'da göster (0 olsa bile null değil)
                        setEarnedRewards({ xp: xpToAdd, coins: coinsToAdd });

                        // 2. Level & Progress Calculation
                        const currentLevel = Number(userData.level) || 1;
                        const currentXp = Number(userData.xp) || 0;
                        // helper fonksiyonu import etmeniz gerekecek!
                        const { newLevel, newXp } = calculateNewProgress(currentLevel, currentXp, xpToAdd);

                        // 3. Quest Updates
                        let questUpdates = {};
                        if (userData?.dailyQuests?.daily) {
                            const { updatedQuests } = updateQuestProgress(userData.dailyQuests.daily, {
                                won: won,
                                wordLength: actualWordLength,
                                guesses: currentRow + 1
                            });
                            questUpdates = { "dailyQuests.daily": updatedQuests };
                        }

                        // 4. Update Database
                        try {
                            const userRef = doc(db, "users", user.uid);

                            // Streak Logic
                            let newStreak = userData.dailyStreak || 0;
                            const lastWin = userData.lastDailyWin;

                            // Calculate yesterday string
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            const yesterdayStr = yesterday.toISOString().split('T')[0];

                            if (won && modeType === "daily") {
                                if (lastWin === yesterdayStr) {
                                    newStreak += 1;
                                } else if (lastWin !== todayStr) {
                                    newStreak = 1;
                                }
                                // If lastWin is already todayStr, don't increment
                            }

                            // Build update object - CRITICAL: xp must use increment!
                            const updateObj: any = {
                                xp: increment(xpToAdd), // Use increment, not set!
                                coins: increment(coinsToAdd),
                                dailyHistory: dailyHistory,
                                dailyStreak: newStreak,
                                lastDailyWin: won && modeType === "daily" ? todayStr : (userData.lastDailyWin || null),
                                ...(won && modeType === "daily" ? {
                                    [`dailyWins_${language}`]: increment(1),
                                    [`wins${actualWordLength}_${language}`]: increment(1)
                                } : {}),
                                ...questUpdates
                            };

                            // Only update level if it changed
                            if (newLevel > currentLevel) {
                                updateObj.level = newLevel;
                            }

                            await updateDoc(userRef, updateObj);

                            // Achievement Check (Only on Win)
                            if (userData && won) {
                                const currentStats = buildUserStats(userData);
                                // Manual update for immediate check
                                currentStats.totalWins = (currentStats.totalWins || 0) + 1;
                                currentStats.dailyWins = (currentStats.dailyWins || 0) + 1;
                                (currentStats as any)[`wins${actualWordLength}`] = ((currentStats as any)[`wins${actualWordLength}`] || 0) + 1;
                                currentStats.coins = (currentStats.coins || 0) + coinsToAdd;
                                currentStats.dailyStreak = newStreak;
                                if (!currentStats.bestTimeMs || durationMs < currentStats.bestTimeMs) {
                                    currentStats.bestTimeMs = durationMs;
                                }

                                const newAchievements = checkNewAchievements(userData, currentStats);
                                if (newAchievements.length > 0) {
                                    await unlockAchievements(user.uid, newAchievements, 0, 0);
                                    setNewUnlockedAchievements(newAchievements);
                                }
                            }

                            // Global Daily Stats
                            if (won && modeType === "daily" && !alreadyWonToday) {
                                const statsRef = doc(db, "stats", "daily");
                                await setDoc(statsRef, {
                                    [`${todayStr}_${actualWordLength}`]: increment(1)
                                }, { merge: true });
                            }

                            console.log("Game result verified & saved.");
                        } catch (e) {
                            console.error("Save error:", e);
                        }

                        try {
                            await saveGameResult({
                                userId: user.uid,
                                modeLen: actualWordLength,
                                modeType,
                                language: language as "tr" | "en",
                                won,
                                guesses: currentRow + 1,
                                durationMs,
                                grid,
                            });
                        } catch (error) {
                            console.error("Oyun kaydedilemedi:", error);
                        }
                    } else {
                        // Guest user - save to localStorage
                        const todayStr = new Date().toISOString().split('T')[0];
                        const guestPlays = localStorage.getItem('guestDailyPlays');
                        let parsed: Record<string, Record<number, boolean>> = {};
                        if (guestPlays) {
                            try {
                                parsed = JSON.parse(guestPlays);
                            } catch (e) {
                                // Invalid JSON, reset
                            }
                        }
                        // Reset if different day
                        if (!parsed[todayStr]) {
                            parsed = { [todayStr]: {} };
                        }
                        parsed[todayStr][wordLength] = true;
                        localStorage.setItem('guestDailyPlays', JSON.stringify(parsed));
                        setGuestLocked(true);
                    }
                    return;
                } else {
                    // practice mode
                    setRevealing(false);
                    setGameOver(null);
                    setPracticeStreak((s) => (won ? s + 1 : 0));
                    const proceed = async (resetTimer: boolean) => {
                        try {
                            const res = await fetch(`/api/word?len=${wordLength}&mode=practice&lang=${language}`);
                            const data = await res.json();
                            setSolution(String(data.word));
                            if (resetTimer) setTimerSeconds(0);
                        } catch { }
                        setRows(Array.from({ length: ATTEMPTS }, () => []));
                        setRowStates(Array.from({ length: ATTEMPTS }, () => Array.from({ length: wordLength }, () => "empty")));
                        setCurrentRow(0);
                        setMessage(null);
                    };
                    if (won && solution) {
                        setPracticeHistory((prev) => [
                            { word: solution.toUpperCase(), won: true },
                            ...prev,
                        ].slice(0, 8));
                    }
                    if (!won && isLastAttempt && solution) {
                        setMessage(`Cevap: ${solution.toUpperCase()}`);
                        setPracticeHistory((prev) => [
                            { word: solution.toUpperCase(), won: false },
                            ...prev,
                        ].slice(0, 8));
                        setTimeout(() => { void proceed(true); }, 1500);
                    } else {
                        void proceed(false);
                    }

                    // Practice: Save game result
                    if (user) {
                        const durationMs = Date.now() - startTime;
                        if (won) {
                            const { xp, coins } = calculateGameRewards(
                                wordLength,
                                true,
                                (ATTEMPTS - currentRow) * 50,
                                currentRow + 1,
                                durationMs / 1000
                            );
                            setEarnedRewards({ xp, coins });

                            try {
                                const userRef = doc(db, "users", user.uid);
                                await updateDoc(userRef, {
                                    xp: increment(xp),
                                    coins: increment(coins),
                                    practiceWins: increment(1),
                                    [`wins${wordLength}`]: increment(1)
                                });

                                // Achievement Check (Practice)
                                if (userData) {
                                    const currentStats = buildUserStats(userData);
                                    currentStats.totalWins = (currentStats.totalWins || 0) + 1;
                                    currentStats.practiceWins = (currentStats.practiceWins || 0) + 1;
                                    (currentStats as any)[`wins${wordLength}`] = ((currentStats as any)[`wins${wordLength}`] || 0) + 1;
                                    currentStats.coins = (currentStats.coins || 0) + coins;

                                    const newAchievements = checkNewAchievements(userData, currentStats);
                                    if (newAchievements.length > 0) {
                                        await unlockAchievements(user.uid, newAchievements, 0, 0);
                                        setNewUnlockedAchievements(newAchievements);
                                    }
                                }

                                if (userData?.dailyQuests?.practice) {
                                    const { updatedQuests } = updateQuestProgress(userData.dailyQuests.practice, {
                                        won: true,
                                        wordLength: wordLength,
                                        guesses: currentRow + 1
                                    });
                                    await updateDoc(userRef, {
                                        "dailyQuests.practice": updatedQuests
                                    });
                                }
                                console.log("Rewards saved successfully");
                            } catch (e) {
                                console.error("XP update error", e);
                            }
                        } else {
                            setEarnedRewards(null);
                            try {
                                const userRef = doc(db, "users", user.uid);
                                if (userData?.dailyQuests?.practice) {
                                    const { updatedQuests } = updateQuestProgress(userData.dailyQuests.practice, {
                                        won: false,
                                        wordLength: wordLength,
                                        guesses: currentRow + 1
                                    });
                                    await updateDoc(userRef, {
                                        "dailyQuests.practice": updatedQuests
                                    });
                                }
                            } catch (e) { console.error("Practice quest update error", e); }
                        }

                        try {
                            await saveGameResult({
                                userId: user.uid,
                                modeLen: wordLength,
                                modeType,
                                language: language as "tr" | "en",
                                won,
                                guesses: currentRow + 1,
                                durationMs,
                                grid,
                            });
                        } catch (error) {
                            console.error("Oyun kaydedilemedi:", error);
                        }
                    }
                    return;
                }
            }

            // Game continues - next row
            setCurrentRow((r) => r + 1);
            setRevealing(false);
        }, totalMs);
    }, [currentRow, rowStates, rows, solution, wordLength, user, startTime, userData, modeType]);

    const onKey = useCallback(
        (key: string) => {
            if (gameOver || revealing) return;
            const cur = rows[currentRow];

            // Safety check: prevent undefined errors during race conditions
            if (!cur) return;

            if (key === "enter") {
                if (cur.length === wordLength) commitRow();
                return;
            }
            if (key === "back") {
                setRows((prev) => {
                    const copy = prev.map((r) => [...r]);
                    // Safety check: ensure array exists before calling pop()
                    if (copy[currentRow] && copy[currentRow].length > 0) {
                        copy[currentRow].pop();
                    }
                    return copy;
                });
                return;
            }
            // Language-specific letter validation
            const validPattern = language === "en" ? /^[a-z]$/ : /^[a-zçğıöşüi]$/;
            if (key.length === 1 && validPattern.test(key)) {
                if (cur.length >= wordLength) return;
                setRows((prev) => {
                    const copy = prev.map((r) => [...r]);
                    // Safety check: ensure array exists before pushing
                    if (copy[currentRow]) {
                        copy[currentRow].push(key);
                    }
                    return copy;
                });
            }
        },
        [currentRow, gameOver, rows, wordLength, language]
    );

    // 1) Oyunu Başlat (Sadece mod veya uzunluk değişince)
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const url = new URL(window.location.href);
                const len = Number(url.searchParams.get("len")) || initialLen || 5;
                setWordLength(len);

                // Reset Game State
                setRows(Array.from({ length: ATTEMPTS }, () => []));
                setRowStates(Array.from({ length: ATTEMPTS }, () => Array.from({ length: len }, () => "empty")));
                setCurrentRow(0);
                setMessage(null);
                setGameOver(null);

                const res = await fetch(`/api/word?len=${len}&mode=${modeType}&lang=${language}`);
                if (!active) return;
                const data = await res.json();
                setSolution(String(data.word));

                if (modeType === "practice") {
                    setTimerSeconds(0);
                    if (timerRef.current) window.clearInterval(timerRef.current);
                    timerRef.current = window.setInterval(() => setTimerSeconds((s) => s + 1), 1000);
                }
            } catch {
                if (active) setSolution(SOLUTION_WORDS[0]);
            }
        })();
        return () => {
            active = false;
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, [initialLen, modeType]);

    // 2) Daily Mode Check (UserData değişince çalışabilir, state bozmaz)
    useEffect(() => {
        if (modeType === "daily" && userData) {
            const todayStr = new Date().toISOString().split('T')[0];
            const dailyHistory = userData.dailyHistory;
            if (dailyHistory?.date === todayStr && dailyHistory?.modes?.[wordLength]) {
                const stats = dailyHistory.stats?.[wordLength] || { guesses: 0, durationMs: 0, solution: "GİZLİ", won: false, lastGuess: "" };
                setDailyStats(stats as any);
            }
        }
    }, [modeType, userData, wordLength]);

    // 2) onKey fonksiyonunun güncel referansını sakla
    useEffect(() => {
        onKeyRef.current = onKey;
    }, [onKey]);

    // 3) Klavye dinleyicisini bir kez ekle, ref üzerinden güncel onKey'i çağır
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k === "enter") return onKeyRef.current("enter");
            if (k === "backspace") return onKeyRef.current("back");
            if (k.length === 1) return onKeyRef.current(k);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="flex flex-col items-center">
            {/* Already played today - blocked */}
            {dailyStats && modeType === "daily" && (() => {
                // Calculate the actual word length that was played from the solution
                const playedWordLength = dailyStats.solution?.length || wordLength;

                return (
                    <div className="fixed inset-0 z-[2000] bg-[#fdf8f3]/85 backdrop-blur-sm flex items-center justify-center">
                        <div className="bg-white rounded-3xl shadow-soft-lg border border-[#e8e0d5] p-8 max-w-md mx-4 text-center">
                            <div className="text-6xl mb-4">
                                {dailyStats.won ? "🎉" : "😔"}
                            </div>
                            <h2 className="text-2xl font-bold text-[#4a4a4a] mb-2">
                                {dailyStats.won ? "Tebrikler!" : "Maalesef Bilemedin"}
                            </h2>
                            <p className="text-[#9a9a9a] mb-6">
                                {playedWordLength} harfli günlük kelimeyi {dailyStats.won ? "başarıyla çözdün." : "çözemedin."}
                            </p>

                            <div className="bg-[#f5efe6] rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-xs text-[#9a9a9a] font-bold uppercase mb-1">Kelime</div>
                                    <div className="text-xl font-bold text-[#8fbc8f] tracking-wider">{dailyStats.solution}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs text-[#9a9a9a] font-bold uppercase mb-1">Tahmin</div>
                                    <div className="text-xl font-bold text-[#f9c784]">{dailyStats.guesses}/6</div>
                                </div>
                                <div className="col-span-2 text-center border-t border-[#e8e0d5] pt-3 mt-1">
                                    <div className="text-xs text-[#9a9a9a] font-bold uppercase mb-1">Son Tahmin</div>
                                    <div className="text-lg font-bold text-[#f9c784] tracking-widest">{dailyStats.lastGuess || "-"}</div>
                                </div>
                                <div className="col-span-2 text-center border-t border-[#e8e0d5] pt-3 mt-1">
                                    <div className="text-xs text-[#9a9a9a] font-bold uppercase mb-1">Süre</div>
                                    <div className="text-lg font-semibold text-[#c4b5e0]">{(dailyStats.durationMs / 1000).toFixed(1)}s</div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <a href="/" className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c4b5e0] to-[#9d8bc7] text-white font-semibold shadow-soft hover:opacity-90 transition">
                                    🏠 {t("Ana Sayfa", "Home")}
                                </a>
                                <a href="/oyna/pratik" className="px-6 py-3 rounded-xl bg-white border-2 border-[#e8e0d5] text-[#6a6a6a] font-semibold hover:bg-[#f5efe6] transition">
                                    ✨ {t("Sınırsız Mod", "Unlimited Mode")}
                                </a>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {/* Guest Lock Overlay */}
            {guestLocked && modeType === "daily" && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center space-y-6 border border-[#e8e0d5]">
                        <div className="text-6xl">🔒</div>
                        <h2 className="text-2xl font-bold text-[#4a4a4a]">{t("Günlük Hakkın Doldu!", "Daily Limit Reached!")}</h2>
                        <p className="text-[#7a7a7a]">
                            {t("Misafir olarak günde sadece", "As a guest, you can only play")} <strong>{t("1 kez", "once")}</strong> {t("günlük bulmaca oynayabilirsin.", "per day.")}
                        </p>
                        <p className="text-[#9a9a9a] text-sm">
                            {t("Kayıt olarak sınırsız oyna, XP kazan, sıralamaya gir!", "Register to play unlimited, earn XP, join leaderboard!")}
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/kayit"
                                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white font-bold shadow-soft hover:opacity-90 transition"
                            >
                                ✨ {t("Ücretsiz Kayıt Ol", "Register Free")}
                            </Link>
                            <Link
                                href="/giris"
                                className="w-full px-6 py-3 rounded-xl bg-white border-2 border-[#e8e0d5] text-[#6a6a6a] font-semibold hover:bg-[#f5efe6] transition"
                            >
                                {t("Giriş Yap", "Sign In")}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            {/* Sol tarafta pratik başarı listesi */}
            {modeType === "practice" && practiceHistory.length > 0 && (
                <div className="fixed left-6 top-24 z-[1500] w-56 space-y-2">
                    {practiceHistory.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-2 rounded-xl border backdrop-blur-xl px-3 py-2 text-sm text-white transition-all ${item.won ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"}`}>
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-bold ${item.won ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-md" : "bg-gradient-to-br from-red-500 to-pink-600 shadow-md"} text-white text-xs`}>{item.won ? "✓" : "✕"}</span>
                            <span className="truncate font-semibold">{item.word}</span>
                        </div>
                    ))}
                </div>
            )}
            {/* Sınırsız Seri rozeti + Timer */}
            {modeType === "practice" && (
                <div className="mb-4 flex justify-center items-center gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 backdrop-blur-xl px-5 py-2 text-sm font-bold shadow-lg">
                        <span className="text-neutral-200">🔥 {t("Seri", "Streak")}</span>
                        <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent text-lg">{practiceStreak}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl px-5 py-2 text-sm font-bold shadow-lg">
                        <span className="text-cyan-300">⏱️ {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}</span>
                    </div>
                </div>
            )}
            <div className="grid gap-2">
                {rows.map((letters, i) => (
                    <div key={i} className={shakeRow === i ? "row-shake" : undefined}>
                        <Row letters={letters} states={rowStates[i]} wordLength={wordLength} />
                    </div>
                ))}
            </div>
            {/* Powerups Bar */}
            <div className="flex gap-4 mb-2 w-full max-w-sm px-2">
                <button
                    onClick={() => handlePowerup("hint")}
                    className="flex-1 bg-white border-2 border-orange-200 hover:bg-orange-50 text-orange-600 rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
                >
                    <span>🔍 {t("İpucu", "Hint")}</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                        {userData?.inventory?.powerups?.hint || 0}
                    </span>
                </button>
                <button
                    onClick={() => handlePowerup("eliminate")}
                    className="flex-1 bg-white border-2 border-purple-200 hover:bg-purple-50 text-purple-600 rounded-xl py-2 font-bold text-sm flex items-center justify-center gap-2 transition active:scale-95"
                >
                    <span>🧹 {t("Eleme", "Eliminate")}</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                        {userData?.inventory?.powerups?.eliminate || 0}
                    </span>
                </button>
            </div>

            <Keyboard onKey={onKey} letterHints={letterHints} disabledLetters={eliminatedLetters} themeId={userTheme} />
            {gameOver && solution && (
                <div className="mt-4 text-center">
                    <div className="text-sm text-neutral-400">
                        {gameOver.win ? "Tur tamamlandı" : `Cevap: ${solution.toUpperCase()}`}
                    </div>
                </div>
            )}
            {message && (
                <div className="fixed right-6 bottom-16 z-[2000]">
                    <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 backdrop-blur-xl px-5 py-3 text-base text-white shadow-2xl font-semibold">
                        {message}
                    </div>
                </div>
            )}
            <ResultModal
                open={showResult}
                onClose={() => setShowResult(false)}
                win={resultWon}
                modeLen={wordLength}
                guesses={currentRow + 1}
                durationMs={Date.now() - startTime}
                grid={resultGrid}
                solution={solution?.toUpperCase()}
                lastGuess={rows[currentRow]?.join("").toUpperCase()}
                xp={earnedRewards?.xp}
                coins={earnedRewards?.coins}
                modeType={modeType}
                unlockedAchievements={newUnlockedAchievements}
            />
        </div>
    );
}


