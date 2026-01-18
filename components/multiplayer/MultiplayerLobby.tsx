"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { joinMatchmaking, leaveMatchmaking } from "@/lib/multiplayer/matchmaking";
import { getEloTier, getRank, DEFAULT_ELO } from "@/lib/multiplayer/elo";
import { Loader2, Swords, Users, Trophy, Sparkles } from "lucide-react";
import type { Player } from "@/lib/multiplayer/types";

interface MultiplayerLobbyProps {
  onMatchFound: (roomId: string) => void;
  onPrivateLobby?: () => void;
  autoStart?: boolean;
  onAutoStartConsumed?: () => void;
}

export function MultiplayerLobby({ onMatchFound, onPrivateLobby, autoStart, onAutoStartConsumed }: MultiplayerLobbyProps) {
  const { user, userData } = useAuth();
  const { language, t } = useLanguage();
  const [searching, setSearching] = useState(false);
  const [wordLength, setWordLength] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [modeStats, setModeStats] = useState<any>({});
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [loadingElo, setLoadingElo] = useState(true);


  // Fetch modeStats AND matchHistory from Firestore
  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoadingElo(false);
        return;
      }

      try {
        const { doc, getDoc, collection, query, orderBy, limit, getDocs } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");

        // Fetch user data with modeStats
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.modeStats) {
            setModeStats(data.modeStats);
          }
        }

        // Fetch match history as fallback
        const historyRef = collection(db, "users", user.uid, "matchHistory");
        const historyQuery = query(historyRef, orderBy("timestamp", "desc"), limit(100));
        const historySnap = await getDocs(historyQuery);

        const history = historySnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMatchHistory(history);

      } catch (err) {
        console.error("Failed to fetch data:", err);
      }

      setLoadingElo(false);
    }

    fetchData();
  }, [user]);

  // Get ELO for selected mode - with matchHistory fallback like profile page
  const getEloForMode = () => {
    // For English, use global ELO_EN since we don't have mode-specific stats for EN yet
    if (language === "en") {
      return userData?.elo_en || DEFAULT_ELO;
    }

    // For Turkish, keep existing logic
    const modeKey = wordLength.toString();
    const modeData = modeStats[modeKey];

    // First try modeStats
    if (modeData?.elo) {
      return modeData.elo;
    }

    // Fallback: use matchHistory
    const modeMatches = matchHistory.filter((match: any) => Number(match.wordLength) === wordLength);
    if (modeMatches.length > 0) {
      const latestMatch = modeMatches[0];
      return latestMatch.newElo || DEFAULT_ELO;
    }

    // Fallback to global elo if no mode stats
    return userData?.elo || DEFAULT_ELO;
  };

  const elo = getEloForMode();
  const rank = getRank(elo);



  useEffect(() => {
    if (autoStart && userData && user && !searching) {
      onAutoStartConsumed?.();
      handleStartSearchInternal();
    }
  }, [autoStart, userData, user, searching]);

  useEffect(() => {
    console.log('wordLength changed to:', wordLength);
  }, [wordLength]);


  const handleStartSearchInternal = async () => {
    if (!user) return;

    setSearching(true);
    setError(null);

    const player: Player = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Oyuncu",
      elo: userData?.elo || DEFAULT_ELO,
      elo_en: userData?.elo_en || DEFAULT_ELO,
    };

    try {
      const roomId = await joinMatchmaking(player, wordLength, language);
      onMatchFound(roomId);
    } catch (err) {
      setError(t("Rakip bulunamadı. Tekrar dene!", "No opponent found. Try again!"));
      setSearching(false);
    }
  };

  const handleStartSearch = async () => {
    if (!user) return;

    setSearching(true);
    setError(null);

    const player: Player = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Oyuncu",
      elo: userData?.elo || DEFAULT_ELO,
      elo_en: userData?.elo_en || DEFAULT_ELO,
    };


    try {
      const roomId = await joinMatchmaking(player, wordLength, language);
      onMatchFound(roomId);
    } catch (err) {
      setError(t("Rakip bulunamadı. Tekrar dene!", "No opponent found. Try again!"));
      setSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    if (!user) return;
    await leaveMatchmaking(user.uid, wordLength, language);
    setSearching(false);
  };

  // Pastel colors for mode buttons
  const modeColors: Record<number, string> = {
    4: "from-[#a8d5a2] to-[#7bc275]",
    5: "from-[#f9c784] to-[#e5a855]",
    6: "from-[#c4b5e0] to-[#9d8bc7]",
    7: "from-[#a7c7e7] to-[#7ba7d1]",
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {/* Player Card */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-[#e8e0d5]">
        <div className="flex items-center justify-between">
          {/* Player Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f5c6d6] to-[#e89db8] shadow-soft flex items-center justify-center text-xl font-bold text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#4a4a4a]">{user?.displayName || user?.email?.split("@")[0]}</h3>
              <p className="text-[#9a9a9a] text-sm">{t(`${wordLength} Harfli Mod`, `${wordLength} Letter Mode`)}</p>
            </div>
          </div>

          {/* ELO Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#f9c784]/20 to-[#f9c784]/10 border border-[#f9c784]/30">
            <span className="text-2xl">{rank.emoji}</span>
            <div className="text-right">
              <div className="text-xs font-medium text-[#9a9a9a]">{language === "en" ? rank.nameEn : rank.name}</div>
              <div className="text-xl font-bold text-[#4a4a4a]">{userData ? elo : "..."}</div>
            </div>
          </div>
        </div>
      </div>



      {/* Mode Selection */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-[#e8e0d5]">
        <h3 className="text-sm font-semibold text-[#7a7a7a] mb-3">{t("Kelime Uzunluğu", "Word Length")}</h3>
        <div className="grid grid-cols-4 gap-2">
          {[4, 5, 6, 7].map((len) => (
            <button
              key={len}
              onClick={() => !searching && setWordLength(len)}
              disabled={searching}
              className={`py-3 rounded-xl font-semibold transition-all ${wordLength === len
                ? `bg-gradient-to-r ${modeColors[len]} text-white shadow-soft`
                : "bg-[#f5efe6] text-[#6a6a6a] hover:bg-[#ebe4da]"
                } ${searching ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {len}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      {!searching ? (
        <div className="space-y-3">
          {/* Ranked Match */}
          <button
            onClick={handleStartSearch}
            disabled={!user}
            className="w-full flex items-center justify-center gap-3 h-14 text-lg font-semibold bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white rounded-2xl shadow-soft hover:opacity-90 transition disabled:opacity-50"
          >
            <Swords className="h-5 w-5" />
            {t("Rakip Bul", "Find Opponent")}
            <span className="text-sm opacity-80 ml-1">• {t("Sıralama", "Ranked")}</span>
          </button>

          {/* Private Lobby */}
          {onPrivateLobby && (
            <button
              onClick={onPrivateLobby}
              disabled={!user}
              className="w-full flex items-center justify-center gap-3 h-14 text-lg font-semibold bg-white text-[#6a6a6a] border-2 border-[#e8e0d5] rounded-2xl shadow-soft hover:bg-[#f5efe6] transition disabled:opacity-50"
            >
              <Users className="h-5 w-5 text-[#c4b5e0]" />
              {t("Özel Lobi", "Private Lobby")}
              <span className="text-sm opacity-60 ml-1">• {t("Arkadaşlarla", "With Friends")}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-soft border border-[#e8e0d5] text-center space-y-4">
          <div className="relative inline-block">
            <Loader2 className="h-12 w-12 animate-spin text-[#8fbc8f]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#4a4a4a] mb-1">{t("Rakip Aranıyor...", "Searching for Opponent...")}</h3>
            <p className="text-[#9a9a9a] text-sm">{t(`ELO: ${elo} civarı oyuncu bekleniyor`, `Waiting for player around ELO: ${elo}`)}</p>
          </div>
          <button
            onClick={handleCancelSearch}
            className="text-[#e8a0a0] hover:text-[#d88080] font-medium"
          >
            {t("İptal Et", "Cancel")}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-[#fef0f0] border border-[#f5c6c6] rounded-xl p-4 text-center">
          <p className="text-[#d88080] font-semibold">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-[#f5efe6] rounded-xl p-4 border border-[#e8e0d5]">
        <div className="flex gap-3">
          <Sparkles className="h-5 w-5 text-[#f9c784] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#7a7a7a]">
            <p><strong className="text-[#4a4a4a]">{t("Sıralama Maçı:", "Ranked Match:")}</strong> {t("Kazanınca ELO artar, kaybedince azalır.", "Win to gain ELO, lose to drop.")}</p>
            <p className="mt-1"><strong className="text-[#4a4a4a]">{t("Özel Lobi:", "Private Lobby:")}</strong> {t("Arkadaşlarla oyna, ELO değişmez.", "Play with friends, ELO stays the same.")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
