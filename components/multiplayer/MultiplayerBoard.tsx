"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Row } from "@/components/Row";
import { Keyboard } from "@/components/Keyboard";
import { evaluateGuess, type LetterState, isWin } from "@/lib/game/engine";
import { sanitizeGuess } from "@/lib/utils/tr-normalize";
import { OpponentBoard } from "./OpponentBoard";
import type { GameRoom } from "@/lib/multiplayer/types";
import { useMultiplayerGame } from "@/hooks/useMultiplayerGame";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface MultiplayerBoardProps {
  roomId: string;
  playerId: string;
  onGameEnd: (result: {
    won: boolean;
    yourGuesses: number;
    opponentGuesses: number;
    timeUsed: string;
    oldElo: number;
    newElo: number;
    eloChange: number;
    opponentName: string;
    solution: string;
  }) => void;
}

const ATTEMPTS = 6;

export function MultiplayerBoard({ roomId, playerId, onGameEnd }: MultiplayerBoardProps) {
  const { room, myProgress, opponentProgress, timeLeft, updateProgress, gameFinished, didIWin, isDraw, eloInfo } = useMultiplayerGame(roomId, playerId);

  const [rows, setRows] = useState<string[][]>(Array.from({ length: ATTEMPTS }, () => []));
  const [rowStates, setRowStates] = useState<(LetterState | "empty")[][]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [resultSent, setResultSent] = useState(false);

  const { user, userData, refreshUserData } = useAuth();

  const onKeyRef = useRef<(k: string) => void>(() => { });

  // Powerups
  const [eliminatedLetters, setEliminatedLetters] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [eliminatesUsed, setEliminatesUsed] = useState(0);

  const handlePowerup = async (type: "hint" | "eliminate") => {
    if (!user || gameOver || !solution) return;

    // 1. Limit Check (Max 1 per game)
    if (type === "hint" && hintsUsed >= 1) {
      setMessage("Bu modda sadece 1 İpucu hakkın var!");
      setTimeout(() => setMessage(null), 1500);
      return;
    }
    if (type === "eliminate" && eliminatesUsed >= 1) {
      setMessage("Bu modda sadece 1 Eleme hakkın var!");
      setTimeout(() => setMessage(null), 1500);
      return;
    }

    // 2. Inventory Check
    const count = userData?.inventory?.powerups?.[type] || 0;
    if (count <= 0) {
      setMessage("Güçlendiricin kalmadı!");
      setTimeout(() => setMessage(null), 1500);
      return;
    }

    if (type === "hint") {
      const currentLen = rows[currentRow].length;
      if (currentLen >= wordLength) {
        setMessage("Önce satırı boşalt!");
        setTimeout(() => setMessage(null), 1500);
        return;
      }
      const char = solution[currentLen];
      onKeyRef.current(char);
      setHintsUsed(h => h + 1);
      setMessage("🔍 İpucu Kullanıldı!");
    }

    if (type === "eliminate") {
      const alphabet = "abcçdefgğhıijklmnoöprsştuüvyz";
      const presentLetters = new Set(solution.split(""));
      const candidates = alphabet.split("").filter(c =>
        !presentLetters.has(c) &&
        !letterHints[c] &&
        !eliminatedLetters.includes(c)
      );

      if (candidates.length === 0) {
        setMessage("Elenecek harf kalmadı!");
        setTimeout(() => setMessage(null), 1500);
        return;
      }

      const toEliminate: string[] = [];
      for (let i = 0; i < 4 && candidates.length > 0; i++) {
        const rnd = Math.floor(Math.random() * candidates.length);
        toEliminate.push(candidates[rnd]);
        candidates.splice(rnd, 1);
      }

      setEliminatedLetters(prev => [...prev, ...toEliminate]);
      setEliminatesUsed(e => e + 1);
      setMessage("🧹 4 Harf Elendi!");
    }

    // 3. Decrement Inventory
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
  const wordLength = room?.wordLength || 5;
  const solution = room?.solution || "";

  const opponent = room?.players.player1.uid === playerId
    ? room?.players.player2
    : room?.players.player1;

  // Initialize states
  useEffect(() => {
    if (wordLength) {
      setRowStates(Array.from({ length: ATTEMPTS }, () =>
        Array.from({ length: wordLength }, () => "empty")
      ));
    }
  }, [wordLength]);

  // Handle game end based on room status (not local state)
  // Bu efekt sadece BİR KEZ çalışmalı: oyun bittiğinde, eloInfo hazır olduğunda ve sonucu henüz göndermemişken.
  useEffect(() => {
    // Wait for eloInfo to be ready before sending result
    if (!gameFinished || resultSent || !room || !eloInfo) return;

    setResultSent(true);
    setGameOver(true);

    // Süre hesabı - kişinin kendi bitiş süresi
    const startTime = room.startTime;
    // Eğer oyuncu kelimeyi bildiyse kendi finishTime'ını kullan, yoksa maç bitiş süresini
    const myFinishTime = myProgress?.finishTime || room.endTime || Date.now();
    const timeUsedMs = myFinishTime - startTime;
    const minutes = Math.floor(timeUsedMs / 60000);
    const seconds = Math.floor((timeUsedMs % 60000) / 1000);
    const timeUsed = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    // Tahmin sayıları
    const yourGuesses = myProgress?.currentRow || 0;
    const opponentGuesses = opponentProgress?.currentRow || 0;

    // Rakip adı
    const opponentName = opponent?.displayName || "Rakip";

    onGameEnd({
      won: didIWin,
      yourGuesses,
      opponentGuesses,
      timeUsed,
      oldElo: eloInfo.oldElo,
      newElo: eloInfo.newElo,
      eloChange: eloInfo.eloChange,
      opponentName,
      solution,
    });
  }, [
    gameFinished,
    resultSent,
    room,
    myProgress,
    opponentProgress,
    opponent,
    playerId,
    eloInfo,
    didIWin,
    onGameEnd,
  ]);

  // Letter hints for keyboard
  const letterHints = useMemo(() => {
    const hints: Record<string, LetterState> = {};
    rowStates.forEach((states, r) => {
      states.forEach((st, c) => {
        const ch = rows[r]?.[c];
        if (!ch || st === "empty") return;
        const prev = hints[ch];
        if (st === "correct" || (st === "present" && prev !== "correct") || (!prev && st === "absent")) {
          hints[ch] = st as LetterState;
        }
      });
    });
    return hints;
  }, [rows, rowStates]);

  // Commit row
  const commitRow = useCallback(async () => {
    const guess = sanitizeGuess(rows[currentRow].join(""));
    if (guess.length !== wordLength) return;

    // Validate
    try {
      const roomLanguage = room?.language || "tr";
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: guess, len: wordLength, lang: roomLanguage })
      });
      const data = await res.json();
      if (!data.ok) {
        setShakeRow(currentRow);
        setTimeout(() => setShakeRow(null), 500);
        const msg = data.reason === "list_unavailable"
          ? (roomLanguage === "en" ? "Loading dictionary" : "Sözlük yükleniyor")
          : (roomLanguage === "en" ? "Not in word list" : "Sözlükte yok");
        setMessage(msg);
        setTimeout(() => setMessage(null), 1200);
        return;
      }
    } catch {
      return;
    }

    setRevealing(true);
    const ev = evaluateGuess(guess, solution);

    setRowStates((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[currentRow] = ev.states;
      return copy as (LetterState | "empty")[][];
    });

    const STEP_DELAY = 220;
    const ANIM_MS = 350;
    const totalMs = (ev.states.length - 1) * STEP_DELAY + ANIM_MS + 60;

    setTimeout(async () => {
      const won = isWin(ev);
      const isLastAttempt = currentRow + 1 >= ATTEMPTS;

      // Prepare updated data with the new guess
      const updatedRows = rows.map((row, i) =>
        i === currentRow ? rows[currentRow] : row
      );

      const updatedStates = rowStates.map((row, i) =>
        i === currentRow ? ev.states : row
      );

      // Update progress in Firebase
      const progressUpdate: any = {
        guesses: updatedRows,
        states: updatedStates,
        currentRow: currentRow + 1,
        finished: won || isLastAttempt,
        won,
      };

      // Only add finishTime if won
      if (won) {
        progressUpdate.finishTime = Date.now();
      }

      await updateProgress(progressUpdate);

      if (won || isLastAttempt) {
        // Don't call onGameEnd here - wait for room status to update
        // The useEffect will handle it based on actual winner from room
        return;
      }

      setCurrentRow((r) => r + 1);
      setRevealing(false);
    }, totalMs);
  }, [currentRow, rows, rowStates, solution, wordLength, updateProgress, onGameEnd]);

  // Handle key press
  const onKey = useCallback(
    (key: string) => {
      if (gameOver || revealing) return;
      const cur = rows[currentRow];

      if (key === "enter") {
        if (cur.length === wordLength) commitRow();
        return;
      }
      if (key === "back") {
        setRows((prev) => {
          const copy = prev.map((r) => [...r]);
          copy[currentRow].pop();
          return copy;
        });
        return;
      }
      if (key.length === 1 && /[a-zçğıöşü]/.test(key)) {
        if (cur.length >= wordLength) return;
        setRows((prev) => {
          const copy = prev.map((r) => [...r]);
          copy[currentRow].push(key);
          return copy;
        });
      }
    },
    [currentRow, gameOver, rows, wordLength, revealing, commitRow]
  );

  // Keyboard listener
  useEffect(() => {
    onKeyRef.current = onKey;
  }, [onKey]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const k = e.key.toLocaleLowerCase("tr");
      if (k === "enter") return onKeyRef.current("enter");
      if (k === "backspace") return onKeyRef.current("back");
      if (k.length === 1) return onKeyRef.current(k);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Leave detection - mark player as lost if they leave/refresh during active game
  useEffect(() => {
    // Only track if game is in progress (not finished)
    if (gameOver || gameFinished || !room || room.status === "finished") return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Mark player as finished/lost when they try to leave
      // Use sendBeacon for reliable delivery during page unload
      const progressData = {
        uid: playerId,
        guesses: myProgress?.guesses || [],
        states: myProgress?.states || [],
        currentRow: myProgress?.currentRow || 0,
        finished: true,
        won: false,
        abandoned: true, // Mark as abandoned
        finishTime: Date.now(),
      };

      // Use sendBeacon with a custom endpoint for more reliable unload handling
      const beaconData = JSON.stringify({
        roomId,
        playerId,
        progress: progressData,
      });

      // Try to send via beacon (most reliable during unload)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/multiplayer/abandon",
          new Blob([beaconData], { type: "application/json" })
        );
      }

      // Show confirmation dialog to give time for beacon to send
      e.preventDefault();
      e.returnValue = "Maçtan ayrılırsan otomatik olarak kaybedersin!";
      return e.returnValue;
    };

    const handleVisibilityChange = () => {
      // When user switches to another tab/app during active game
      // We only mark as lost if they're actually leaving, not just switching briefly
      // This is handled by beforeunload for actual departures
      // Visibility change is kept for future enhancement if needed
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [gameOver, gameFinished, room, roomId, playerId, myProgress, updateProgress]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Timer - Centered at top */}
      <div className="flex justify-center">
        <div className={cn(
          "px-6 py-3 rounded-2xl font-bold text-xl shadow-soft",
          timeLeft > 60 ? "bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white" :
            timeLeft > 30 ? "bg-gradient-to-r from-[#f9c784] to-[#e5a855] text-white" :
              "bg-gradient-to-r from-[#e57373] to-[#c62828] text-white animate-pulse"
        )}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-8 items-start">
        {/* My Board */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#e8e0d5] rounded-2xl p-6 shadow-soft">
          {/* Player Header */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e8e0d5]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] shadow-soft flex items-center justify-center">
              <span className="text-white text-lg">🎮</span>
            </div>
            <div>
              <h3 className="font-bold text-[#4a4a4a]">Sen</h3>
              <p className="text-xs text-[#7a7a7a]">Tahmin: {currentRow}/6</p>
            </div>
          </div>

          {/* Game Grid */}
          <div className="grid gap-2 mb-4">
            {rows.map((letters, i) => (
              <div key={i} className={shakeRow === i ? "row-shake" : undefined}>
                <Row letters={letters} states={rowStates[i]} wordLength={wordLength} />
              </div>
            ))}
          </div>

          {/* Powerups */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handlePowerup("hint")}
              disabled={hintsUsed >= 1}
              className={`flex-1 border-2 rounded-xl py-2.5 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 ${hintsUsed >= 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white border-orange-200 hover:bg-orange-50 text-orange-600"
                }`}
            >
              <span>🔍 İpucu</span>
              <span className="bg-orange-100 text-orange-700 px-1.5 rounded-full text-[10px]">
                {userData?.inventory?.powerups?.hint || 0}
              </span>
            </button>
            <button
              onClick={() => handlePowerup("eliminate")}
              disabled={eliminatesUsed >= 1}
              className={`flex-1 border-2 rounded-xl py-2.5 font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95 ${eliminatesUsed >= 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white border-purple-200 hover:bg-purple-50 text-purple-600"
                }`}
            >
              <span>🧹 Eleme</span>
              <span className="bg-purple-100 text-purple-700 px-1.5 rounded-full text-[10px]">
                {userData?.inventory?.powerups?.eliminate || 0}
              </span>
            </button>
          </div>

          {/* Keyboard */}
          <Keyboard onKey={onKey} letterHints={letterHints} disabledLetters={eliminatedLetters} />
        </div>

        {/* VS Indicator - Center */}
        <div className="hidden lg:flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#c4b5e0] to-[#9d8bc7] shadow-soft flex items-center justify-center">
            <span className="text-white font-bold text-xl">VS</span>
          </div>
        </div>

        {/* Opponent Board */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#e8e0d5] rounded-2xl p-6 shadow-soft">
          <OpponentBoard
            progress={opponentProgress}
            wordLength={wordLength}
            opponentName={opponent?.displayName || "Rakip"}
          />
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="fixed right-6 bottom-16 z-[2000]">
          <div className="rounded-xl border border-[#c4b5e0] bg-white/90 backdrop-blur-sm px-5 py-3 text-base text-[#4a4a4a] shadow-soft font-semibold">
            {message}
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
