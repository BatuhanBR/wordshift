"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit, updateDoc, increment } from "firebase/firestore";
import { getRank, DEFAULT_ELO } from "@/lib/multiplayer/elo";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { FriendsList } from "@/components/friends/FriendsList";
import { DataPrivacySection } from "@/components/DataPrivacySection";
import { Trophy, Clock, Target, Flame, BarChart2, Users, Star, Coins, ShoppingBag, Gift, Check } from "lucide-react";
import { getNextLevelXp, calculateNewProgress } from "@/lib/progress";
import { AVATARS, FRAMES } from "@/lib/shop/shop-items";
import { AchievementList } from "@/components/AchievementList";
import { DailyQuest } from "@/lib/quests/types";
import confetti from "canvas-confetti";

interface UserStats {
  gamesPlayed: number;
  wins: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: Record<number, number>;
  avgGuesses: number;
  bestTimeMs: number | null;
}

interface ModeStats {
  4: UserStats;
  5: UserStats;
  6: UserStats;
  7: UserStats;
}

interface MultiplayerStats {
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
}

// Mode-specific multiplayer stats from Firebase
interface MultiplayerModeStats {
  "4"?: { elo: number; wins: number; losses: number; winStreak: number; lossStreak: number };
  "5"?: { elo: number; wins: number; losses: number; winStreak: number; lossStreak: number };
  "6"?: { elo: number; wins: number; losses: number; winStreak: number; lossStreak: number };
  "7"?: { elo: number; wins: number; losses: number; winStreak: number; lossStreak: number };
}

interface MatchHistoryItem {
  id: string;
  roomId: string;
  opponentUid: string;
  opponentName: string;
  won: boolean;
  eloChange: number;
  oldElo: number;
  newElo: number;
  wordLength: number;
  solution: string;
  timestamp: any;
  guessCount?: number;
  durationMs?: number;
  performanceBonus?: number;
  streakBonus?: number;
  isDraw?: boolean;
  language?: string;
}

const defaultStats: UserStats = {
  gamesPlayed: 0,
  wins: 0,
  winRate: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: {},
  avgGuesses: 0,
  bestTimeMs: null,
};

function ProfileContent() {
  const { user, userData, loading, logout, refreshUserData } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"stats" | "friends" | "achievements" | "quests">("stats");
  const [stats, setStats] = useState<ModeStats>({
    4: { ...defaultStats },
    5: { ...defaultStats },
    6: { ...defaultStats },
    7: { ...defaultStats },
  });
  const [selectedMode, setSelectedMode] = useState<4 | 5 | 6 | 7>(5);
  const [selectedModeType, setSelectedModeType] = useState<"daily" | "practice">("daily");
  const [loadingStats, setLoadingStats] = useState(true);
  const [questTab, setQuestTab] = useState<"daily" | "practice">("daily");
  const [claiming, setClaiming] = useState<string | null>(null);

  const [multiplayerModeStats, setMultiplayerModeStats] = useState<MultiplayerModeStats>({});
  const [matchHistory, setMatchHistory] = useState<MatchHistoryItem[]>([]);
  const [loadingMultiplayer, setLoadingMultiplayer] = useState(true);

  // Check URL for tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'quests') {
      setActiveTab('quests');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/giris");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && activeTab === "stats") {
      loadUserStats(selectedModeType);
      loadMultiplayerStats();
    }
    // Live userData handles profile loading automatically
  }, [user, selectedModeType, activeTab, language]);



  const loadMultiplayerStats = async () => {
    if (!user) return;
    setLoadingMultiplayer(true);

    try {
      // Kullanıcı verilerini çek
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.modeStats) {
          setMultiplayerModeStats(userData.modeStats);
        }
      }

      // Maç geçmişini çek
      const historyRef = collection(db, "users", user.uid, "matchHistory");
      const historyQuery = query(historyRef, orderBy("timestamp", "desc"), limit(100));
      const historySnap = await getDocs(historyQuery);

      const history: MatchHistoryItem[] = historySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MatchHistoryItem[];

      setMatchHistory(history);
    } catch (error) {
      console.error("Multiplayer stats yüklenirken hata:", error);
    } finally {
      setLoadingMultiplayer(false);
    }
  };

  const getMultiplayerStatsForMode = (): MultiplayerStats => {
    // For English mode, use global ELO and stats since we don't have separate mode stats yet
    if (language === "en") {
      const modeMatches = matchHistory.filter(match =>
        (Number(match.wordLength) === selectedMode) && (match.language === "en")
      );

      if (modeMatches.length === 0) {
        return {
          elo: userData?.elo_en || DEFAULT_ELO,
          wins: userData?.multiplayerWins_en || 0,
          losses: userData?.multiplayerLosses_en || 0,
          winRate: (userData?.multiplayerWins_en || 0) + (userData?.multiplayerLosses_en || 0) > 0
            ? ((userData?.multiplayerWins_en || 0) / ((userData?.multiplayerWins_en || 0) + (userData?.multiplayerLosses_en || 0))) * 100
            : 0
        };
      }

      const wins = modeMatches.filter(m => m.won && !m.isDraw).length;
      const losses = modeMatches.filter(m => !m.won && !m.isDraw).length;
      const total = wins + losses;

      const latestMatch = modeMatches[0];
      const latestElo = latestMatch ? latestMatch.newElo : (userData?.elo_en || DEFAULT_ELO);

      return {
        elo: latestElo,
        wins,
        losses,
        winRate: total > 0 ? (wins / total) * 100 : 0,
      };
    }

    // For Turkish mode, keep existing logic but filter by language='tr' or undefined
    const modeKey = selectedMode.toString() as keyof MultiplayerModeStats;
    const modeData = multiplayerModeStats[modeKey];

    if (modeData && (modeData.wins > 0 || modeData.losses > 0)) {
      const total = modeData.wins + modeData.losses;
      return {
        elo: modeData.elo,
        wins: modeData.wins,
        losses: modeData.losses,
        winRate: total > 0 ? (modeData.wins / total) * 100 : 0,
      };
    }

    const modeMatches = matchHistory.filter(match =>
      Number(match.wordLength) === selectedMode && (!match.language || match.language === "tr")
    );

    if (modeMatches.length === 0) {
      return { elo: 1200, wins: 0, losses: 0, winRate: 0 };
    }

    const wins = modeMatches.filter(m => m.won && !m.isDraw).length;
    const losses = modeMatches.filter(m => !m.won && !m.isDraw).length;
    const total = wins + losses;

    const latestMatch = modeMatches[0];
    const latestElo = latestMatch ? latestMatch.newElo : 1200;

    return {
      elo: latestElo,
      wins,
      losses,
      winRate: total > 0 ? (wins / total) * 100 : 0,
    };
  };

  const filteredMatchHistory = matchHistory.filter(match =>
    Number(match.wordLength) === selectedMode &&
    (language === "en" ? match.language === "en" : (!match.language || match.language === "tr"))
  );

  const loadUserStats = async (modeType: "daily" | "practice") => {
    if (!user) return;

    setLoadingStats(true);

    try {
      const modes: (4 | 5 | 6 | 7)[] = [4, 5, 6, 7];
      const newStats: ModeStats = {
        4: { ...defaultStats },
        5: { ...defaultStats },
        6: { ...defaultStats },
        7: { ...defaultStats },
      };

      for (const mode of modes) {
        const gamesRef = collection(db, "games");
        const q = query(
          gamesRef,
          where("userId", "==", user.uid),
          where("modeLen", "==", mode),
          where("modeType", "==", modeType)
        );
        const gamesSnap = await getDocs(q);

        // Filter by language client-side (to avoid composite index requirement)
        const allGames = gamesSnap.docs.map((doc) => doc.data());
        const games = allGames.filter((g) => {
          // For practice mode, filter by current language
          // For daily mode, also filter by language
          const gameLanguage = g.language || "tr"; // Default to "tr" for old records
          return gameLanguage === language;
        });

        const wins = games.filter((g) => g.won).length;
        const guessDistribution: Record<number, number> = {};
        let totalGuesses = 0;
        let bestTimeMs: number | null = null;

        games.forEach((game) => {
          if (game.won) {
            guessDistribution[game.guesses] = (guessDistribution[game.guesses] || 0) + 1;
            totalGuesses += game.guesses;

            if (game.durationMs) {
              if (!bestTimeMs || game.durationMs < bestTimeMs) {
                bestTimeMs = game.durationMs;
              }
            }
          }
        });

        const sortedGames = games
          .filter((g) => typeof g.dayIndex === "number")
          .sort((a, b) => b.dayIndex - a.dayIndex);
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        sortedGames.forEach((game, i) => {
          if (game.won) {
            tempStreak++;
            if (i === 0) currentStreak = tempStreak;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
          } else {
            if (i === 0) currentStreak = 0;
            tempStreak = 0;
          }
        });

        newStats[mode] = {
          gamesPlayed: games.length,
          wins,
          winRate: games.length > 0 ? (wins / games.length) * 100 : 0,
          currentStreak: modeType === "daily" ? currentStreak : 0,
          maxStreak: modeType === "daily" ? maxStreak : 0,
          guessDistribution,
          avgGuesses: wins > 0 ? totalGuesses / wins : 0,
          bestTimeMs,
        };
      }

      setStats(newStats);
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf8f3]">
        <div className="text-xl text-[#9a9a9a]">Yükleniyor...</div>
      </div>
    );
  }

  const currentStats = stats[selectedMode];

  return (
    <div className="min-h-screen relative overflow-hidden text-[#4a4a4a] cozy-pattern">
      {/* Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#c4b5e0]/20 to-[#c4b5e0]/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#f5c6d6]/20 to-[#f5c6d6]/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#a7c7e7]/20 to-[#a7c7e7]/5 blur-3xl" />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto py-12 px-4">
        {/* Header - Profile Card */}
        <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 mb-6 relative overflow-hidden">
          {/* Background Gradient Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f9c784]/20 to-[#f9c784]/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5 w-full md:w-auto">
              {/* Avatar and Level Badge */}
              {(() => {
                const avatarId = userData?.equipped?.avatar || "default";
                const frameId = userData?.equipped?.frame || "none";
                const avatarItem = AVATARS.find(a => a.id === avatarId);
                const frameItem = FRAMES.find(f => f.id === frameId);
                const frameClass = frameItem?.color || "from-transparent to-transparent";

                return (
                  <div className="relative">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${frameClass} p-1`}>
                      <div className="w-full h-full bg-gradient-to-br from-[#c4b5e0] to-[#9d8bc7] rounded-full shadow-soft flex items-center justify-center text-3xl">
                        {avatarItem?.emoji || (userData?.displayName || user.displayName || "O").charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#f9c784] text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                      <span>Lvl {userData?.level || 1}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Name and XP Bar */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#4a4a4a] flex items-center gap-2">
                  {userData?.displayName || user.displayName || "Oyuncu"}
                  {(userData?.level || 1) >= 10 && <Star className="w-5 h-5 text-[#f9c784] fill-current" />}
                </h1>
                <div className="flex items-center gap-2 text-sm text-[#9a9a9a] mb-2">
                  <span>{user.email}</span>
                </div>

                {/* XP Progress Bar */}
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs font-semibold mb-1 text-[#9a9a9a]">
                    <span>XP</span>
                    <span>{userData?.xp || 0} / {getNextLevelXp(userData?.level || 1)}</span>
                  </div>
                  <div className="h-2.5 bg-[#f5efe6] rounded-full overflow-hidden border border-[#e8e0d5]">
                    <div
                      className="h-full bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(((userData?.xp || 0) / getNextLevelXp(userData?.level || 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coins and Actions */}
            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-[#fdf8f3] px-4 py-2 rounded-xl border border-[#e8e0d5] shadow-sm">
                <div className="bg-[#f9c784] p-1.5 rounded-full">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col items-end leading-none">
                  <span className="text-lg font-bold text-[#4a4a4a]">{userData?.coins || 0}</span>
                  <span className="text-[10px] text-[#9a9a9a] font-bold uppercase">Coins</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-[#e8a0a0] hover:text-[#d88080] hover:bg-[#fef0f0] rounded-xl transition font-medium w-full md:w-auto text-center"
              >
                {t("Çıkış Yap", "Sign Out")}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 min-w-[100px] py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === "stats"
              ? "bg-gradient-to-r from-[#f9c784] to-[#f9c784] text-white shadow-soft"
              : "text-[#9a9a9a] hover:bg-[#f5efe6]"
              }`}
          >
            {t("İstatistikler", "Statistics")}
          </button>
          <button
            onClick={() => setActiveTab("quests")}
            className={`flex-1 min-w-[100px] py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === "quests"
              ? "bg-gradient-to-r from-[#7fd1ae] to-[#6fc19e] text-white shadow-soft"
              : "text-[#9a9a9a] hover:bg-[#f5efe6]"
              }`}
          >
            {t("Görevler", "Quests")}
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`flex-1 min-w-[100px] py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === "achievements"
              ? "bg-gradient-to-r from-[#e5a855] to-[#d49942] text-white shadow-soft"
              : "text-[#9a9a9a] hover:bg-[#f5efe6]"
              }`}
          >
            {t("Başarımlar", "Achievements")}
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 min-w-[100px] py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === "friends"
              ? "bg-gradient-to-r from-[#a7c7e7] to-[#8fb8e6] text-white shadow-soft"
              : "text-[#9a9a9a] hover:bg-[#f5efe6]"
              }`}
          >
            {t("Arkadaşlar", "Friends")}
          </button>
        </div>

        {activeTab === "stats" && (
          <>
            {/* Mode Selector & Control Panel */}
            <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#f9c784]/20 rounded-lg">
                    <Target className="w-5 h-5 text-[#f9c784]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#4a4a4a]">{t("Performans Özeti", "Performance Summary")}</h2>
                </div>

                <div className="inline-flex rounded-xl bg-[#f5efe6] p-1 border border-[#e8e0d5]">
                  {[{ k: "daily", t: t("Günlük", "Daily") }, { k: "practice", t: t("Sınırsız", "Unlimited") }].map((m: any) => (
                    <button
                      key={m.k}
                      onClick={() => setSelectedModeType(m.k)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedModeType === m.k
                        ? "bg-white text-[#4a4a4a] shadow-sm"
                        : "text-[#9a9a9a] hover:text-[#6a6a6a]"
                        }`}
                    >
                      {m.t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[4, 5, 6, 7].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode as 4 | 5 | 6 | 7)}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all ${selectedMode === mode
                      ? "bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white shadow-soft"
                      : "bg-[#f5efe6] text-[#9a9a9a] hover:bg-[#eae0d5] hover:text-[#6a6a6a]"
                      }`}
                  >
                    {mode} {t("Harf", "Letters")}
                  </button>
                ))}
              </div>
            </div>

            {loadingStats ? (
              <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-8 text-center text-[#9a9a9a]">
                {t("İstatistikler yükleniyor...", "Loading statistics...")}
              </div>
            ) : (
              <>
                {/* Solo Stats Grid */}
                <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-8 mb-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#4a4a4a]">
                        {t("Solo Performans", "Solo Performance")}
                      </h2>
                      <span className="text-sm text-[#9a9a9a] font-normal">• {selectedMode} {t("Harf", "Letters")}</span>
                    </div>

                    {selectedModeType === "daily" && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5efe6] text-[#9a9a9a] border border-[#e8e0d5]">
                        {t("Seriler Dahil", "Streaks Included")}
                      </span>
                    )}
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Games Played - Violet */}
                    <div className="rounded-2xl bg-[#c4b5e0]/20 border border-[#c4b5e0] p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-[#9d8bc7] font-bold uppercase tracking-wider mb-1">{t("Oyun", "Games")}</span>
                      <div className="text-3xl font-bold text-[#9d8bc7]">{currentStats.gamesPlayed}</div>
                    </div>

                    {/* Win Rate - Green */}
                    <div className="rounded-2xl bg-[#a8d5a2]/20 border border-[#8fbc8f] p-4 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-[#6a9a6a] font-bold uppercase tracking-wider mb-1">{t("Kazanma", "Win Rate")}</span>
                      <div className="text-3xl font-bold text-[#6a9a6a]">{currentStats.winRate.toFixed(0)}%</div>
                    </div>

                    {/* Current Streak - Blue */}
                    <div className="rounded-2xl bg-[#a7c7e7]/20 border border-[#a7c7e7] p-4 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-[#7ba7d1] font-bold uppercase tracking-wider">{t("Seri", "Streak")}</span>
                        <Flame className="w-3 h-3 text-[#7ba7d1]" />
                      </div>
                      <div className="text-3xl font-bold text-[#7ba7d1]">{currentStats.currentStreak}</div>
                    </div>

                    {/* Max Streak - Orange */}
                    <div className="rounded-2xl bg-[#f9c784]/20 border border-[#f9c784] p-4 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-[#e5a855] font-bold uppercase tracking-wider">{t("Rekor", "Record")}</span>
                        <Trophy className="w-3 h-3 text-[#e5a855]" />
                      </div>
                      <div className="text-3xl font-bold text-[#e5a855]">{currentStats.maxStreak}</div>
                    </div>
                  </div>

                  {/* Secondary metrics */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-[#f5efe6] p-4 border border-[#e8e0d5]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-[#c4b5e0]" />
                          <span className="text-sm font-medium text-[#6a6a6a]">{t("Ortalama Tahmin", "Avg. Guesses")}</span>
                        </div>
                        <div className="text-xl font-bold text-[#4a4a4a]">
                          {currentStats.avgGuesses > 0 ? currentStats.avgGuesses.toFixed(1) : "-"}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#f5efe6] p-4 border border-[#e8e0d5]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#f9c784]" />
                          <span className="text-sm font-medium text-[#6a6a6a]">{t("En İyi Süre", "Best Time")}</span>
                        </div>
                        <div className="text-xl font-bold text-[#4a4a4a]">
                          {currentStats.bestTimeMs ? (currentStats.bestTimeMs / 1000).toFixed(1) + "s" : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Görev İstatistikleri */}
                <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-8 mb-6">
                  <h2 className="text-lg font-bold text-[#4a4a4a] mb-6 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#f9c784]" />
                    {t("Görev İstatistikleri", "Quest Statistics")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-[#f9c784]/20 border border-[#f9c784] p-6 flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-[#e5a855] font-bold uppercase tracking-wider mb-2">{t("Tamamlanan Günlük Görev", "Completed Daily Quests")}</span>
                      <div className="text-4xl font-bold text-[#e5a855]">{userData?.totalDailyQuestsCompleted || 0}</div>
                    </div>
                    <div className="rounded-2xl bg-[#7fd1ae]/20 border border-[#7fd1ae] p-6 flex flex-col items-center justify-center text-center">
                      <span className="text-sm text-[#5da88e] font-bold uppercase tracking-wider mb-2">{t("Tamamlanan Sınırsız Görev", "Completed Unlimited Quests")}</span>
                      <div className="text-4xl font-bold text-[#5da88e]">{userData?.totalUnlimitedQuestsCompleted || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Tahmin Dağılımı */}
                {Object.keys(currentStats.guessDistribution).length > 0 && (
                  <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-8 mb-6">
                    <h2 className="text-lg font-bold text-[#4a4a4a] mb-6 flex items-center gap-2">
                      {t("Tahmin Dağılımı", "Guess Distribution")}
                    </h2>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6].map((guess) => {
                        const count = currentStats.guessDistribution[guess] || 0;
                        const maxCount = Math.max(
                          ...Object.values(currentStats.guessDistribution)
                        );
                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

                        return (
                          <div key={guess} className="flex items-center gap-3">
                            <div className="w-4 text-sm font-bold text-[#9a9a9a]">
                              {guess}
                            </div>
                            <div className="flex-1 bg-[#f5efe6] rounded-full overflow-hidden h-3">
                              <div
                                className="bg-gradient-to-r from-[#a8d5a2] to-[#6a9a6a] h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                              />
                            </div>
                            <div className="w-6 text-sm font-medium text-[#6a6a6a] text-right">
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multiplayer İstatistikleri */}
                <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-8 mb-6">
                  <h2 className="text-lg font-bold text-[#4a4a4a] mb-6 flex items-center gap-2">
                    <span className="text-[#f9c784]">⚔️</span> Multiplayer
                    <span className="text-sm font-normal text-[#9a9a9a]">• {selectedMode} {t("Harf", "Letters")}</span>
                  </h2>

                  {loadingMultiplayer ? (
                    <div className="text-[#9a9a9a] text-center py-4">{t("Yükleniyor...", "Loading...")}</div>
                  ) : (
                    <>
                      {/* Rank Badge */}
                      {(() => {
                        const modeStats = getMultiplayerStatsForMode();
                        const rank = getRank(modeStats.elo);
                        return (
                          <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#e8e8e8] to-[#f5f5f5] p-1 shadow-sm">
                            <div className={`rounded-xl bg-gradient-to-r ${rank.color} p-6 text-white shadow-inner`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium opacity-90 mb-1">{t("Mevcut Rank", "Current Rank")}</div>
                                  <div className="text-3xl font-bold flex items-center gap-3">
                                    <span>{rank.emoji}</span>
                                    <span>{language === "en" ? rank.nameEn : rank.name}</span>
                                  </div>
                                  <div className="text-xs opacity-75 mt-1 font-medium">
                                    {rank.minElo} - {rank.maxElo === Infinity ? "∞" : rank.maxElo} ELO
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium opacity-90 mb-1">{t("ELO Puanı", "ELO Score")}</div>
                                  <div className="text-4xl font-bold">{modeStats.elo}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Multiplayer KPI Cards */}
                      {(() => {
                        const modeStats = getMultiplayerStatsForMode();
                        return (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-xl bg-[#a8d5a2]/10 border border-[#a8d5a2]/30 p-3 text-center">
                              <div className="text-[#6a9a6a] font-bold text-xl">{modeStats.wins}</div>
                              <div className="text-xs text-[#8fbc8f] font-semibold uppercase">{t("Galibiyet", "Wins")}</div>
                            </div>

                            <div className="rounded-xl bg-[#e8a0a0]/10 border border-[#e8a0a0]/30 p-3 text-center">
                              <div className="text-[#d88080] font-bold text-xl">{modeStats.losses}</div>
                              <div className="text-xs text-[#e8a0a0] font-semibold uppercase">{t("Mağlubiyet", "Losses")}</div>
                            </div>

                            <div className="rounded-xl bg-[#a7c7e7]/10 border border-[#a7c7e7]/30 p-3 text-center">
                              <div className="text-[#7ba7d1] font-bold text-xl">{modeStats.winRate.toFixed(0)}%</div>
                              <div className="text-xs text-[#a7c7e7] font-semibold uppercase">Kazanma %</div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Maç Geçmişi */}
                {filteredMatchHistory.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-8 mb-6">
                    <h2 className="text-lg font-bold text-[#4a4a4a] mb-6 flex items-center gap-2">
                      📜 {t("Maç Geçmişi", "Match History")}
                    </h2>

                    <div className="space-y-3">
                      {filteredMatchHistory.map((match) => {
                        const durationSeconds = match.durationMs ? Math.floor(match.durationMs / 1000) : 0;
                        const minutes = Math.floor(durationSeconds / 60);
                        const seconds = durationSeconds % 60;
                        const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

                        return (
                          <div
                            key={match.id}
                            className={`rounded-xl border p-4 transition-all hover:bg-[#f5efe6] ${match.isDraw
                              ? "bg-[#f5efe6] border-[#d4d4d4]"
                              : match.won
                                ? "bg-[#a8d5a2]/5 border-[#a8d5a2]/30"
                                : "bg-[#e8a0a0]/5 border-[#e8a0a0]/30"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <span className="text-2xl">
                                  {match.isDraw ? "🤝" : match.won ? "🏆" : "💔"}
                                </span>
                                <div className="flex-1">
                                  <div className="font-semibold text-[#4a4a4a]">
                                    vs {match.opponentName}
                                  </div>
                                  <div className="text-xs text-[#9a9a9a] mt-1 space-x-2">
                                    <span>{match.wordLength} {t("Harf", "Letters")}</span>
                                    {match.guessCount && <span>• {match.guessCount} {t("Deneme", "Attempts")}</span>}
                                    {match.durationMs && <span>• {timeStr}</span>}
                                    <span>• {t("Kelime", "Word")}: <span className="font-mono text-[#6a6a6a]">{match.solution?.toUpperCase()}</span></span>
                                  </div>
                                  {((match.performanceBonus || 0) > 0 || (match.streakBonus || 0) > 0) && match.won && (
                                    <div className="text-xs text-[#6a9a6a] mt-1 font-medium bg-[#a8d5a2]/20 inline-block px-2 py-0.5 rounded-md">
                                      {(match.performanceBonus || 0) > 0 && `+${match.performanceBonus} ${t("Performans", "Performance")}`}
                                      {(match.performanceBonus || 0) > 0 && (match.streakBonus || 0) > 0 && " • "}
                                      {(match.streakBonus || 0) > 0 && `+${match.streakBonus} ${t("Seri", "Streak")}`}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className={`text-lg font-bold ${match.isDraw ? "text-[#9a9a9a]" : match.won ? "text-[#6a9a6a]" : "text-[#d88080]"}`}>
                                  {match.isDraw ? "+0" : match.eloChange > 0 ? `+${match.eloChange}` : match.eloChange}
                                </div>
                                <div className="text-xs text-[#c4c4c4]">
                                  {match.oldElo} → {match.newElo}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === "achievements" && (
          <div className="animate-in slide-in-from-bottom-5 duration-500 fade-in">
            <AchievementList />
          </div>
        )}

        {activeTab === "friends" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <FriendsList />
            <DataPrivacySection />
          </div>
        )}

        {activeTab === "quests" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quest Category Tabs */}
            <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-4 mb-6">
              <div className="flex gap-2 p-1 bg-[#f5efe6] rounded-lg">
                <button
                  onClick={() => setQuestTab("daily")}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${questTab === "daily" ? "bg-white text-[#4a4a4a] shadow-sm" : "text-[#9a9a9a]"}`}
                >
                  {t("Günlük", "Daily")}
                </button>
                <button
                  onClick={() => setQuestTab("practice")}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${questTab === "practice" ? "bg-white text-[#4a4a4a] shadow-sm" : "text-[#9a9a9a]"}`}
                >
                  {t("Sınırsız", "Unlimited")}
                </button>
              </div>
            </div>

            {/* Quests Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {(() => {
                const quests = questTab === "daily"
                  ? (userData?.dailyQuests?.daily || [])
                  : (userData?.dailyQuests?.practice || []);

                const handleClaimQuest = async (quest: DailyQuest) => {
                  if (!user || quest.isClaimed || quest.progress < quest.target) return;
                  setClaiming(quest.id);
                  try {
                    const userRef = doc(db, "users", user.uid);
                    const targetField = questTab === "daily" ? "dailyQuests.daily" : "dailyQuests.practice";
                    const updatedList = quests.map((q: DailyQuest) =>
                      q.id === quest.id ? { ...q, isClaimed: true } : q
                    );

                    // Update total completed quests counter
                    const counterField = questTab === "daily" ? "totalDailyQuestsCompleted" : "totalUnlimitedQuestsCompleted";

                    // Calculate new level and XP with level up check
                    const currentXp = userData?.xp || 0;
                    const currentLevel = userData?.level || 1;
                    const { newLevel, newXp, leveledUp } = calculateNewProgress(currentLevel, currentXp, quest.reward.xp);

                    await updateDoc(userRef, {
                      xp: newXp,
                      level: newLevel,
                      coins: increment(quest.reward.coins),
                      [targetField]: updatedList,
                      [counterField]: increment(1)
                    });

                    // Refresh user data immediately to update UI
                    await refreshUserData();

                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

                    // Extra confetti for level up!
                    if (leveledUp) {
                      setTimeout(() => {
                        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
                      }, 300);
                    }
                  } catch (error) {
                    console.error("Error claiming reward:", error);
                  } finally {
                    setClaiming(null);
                  }
                };

                if (quests.length === 0) {
                  return (
                    <div className="col-span-2 text-center py-12">
                      <Trophy className="w-12 h-12 text-[#d4d4d4] mx-auto mb-4" />
                      <p className="text-[#9a9a9a]">{t("Bu kategoride henüz görev yok", "No quests in this category yet")}</p>
                    </div>
                  );
                }

                return quests.map((quest: DailyQuest) => {
                  const isCompleted = quest.progress >= quest.target;
                  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

                  return (
                    <div
                      key={quest.id}
                      className={`bg-white rounded-2xl shadow-soft border-2 p-5 transition-all ${isCompleted && !quest.isClaimed
                        ? "border-[#f9c784] shadow-md"
                        : quest.isClaimed
                          ? "border-transparent opacity-60"
                          : "border-[#e8e0d5]"
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompleted ? "bg-[#7fd1ae]/20" : "bg-[#f5efe6]"}`}>
                          {quest.isClaimed ? (
                            <Check className="w-6 h-6 text-[#7fd1ae]" />
                          ) : (
                            <Trophy className="w-6 h-6 text-[#9a9a9a]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[#4a4a4a]">{language === "en" ? quest.titleEn : quest.title}</h4>
                          <p className="text-sm text-[#9a9a9a]">{language === "en" ? quest.descriptionEn : quest.description}</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-[#9a9a9a] font-semibold">
                          <span>{t("İlerleme", "Progress")}</span>
                          <span>{quest.progress} / {quest.target}</span>
                        </div>
                        <div className="h-2.5 bg-[#f5efe6] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-[#7fd1ae]" : "bg-[#f9c784]"}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm font-bold">
                          <span className="flex items-center gap-1 text-[#ffb54d] bg-[#fff8e8] px-2 py-1 rounded-lg">
                            <Trophy className="w-4 h-4" /> +{quest.reward.xp} XP
                          </span>
                          <span className="flex items-center gap-1 text-[#e8a0a0] bg-[#fef0f0] px-2 py-1 rounded-lg">
                            <Coins className="w-4 h-4" /> +{quest.reward.coins}
                          </span>
                        </div>

                        {isCompleted && !quest.isClaimed && (
                          <button
                            onClick={() => handleClaimQuest(quest)}
                            disabled={claiming === quest.id}
                            className="px-4 py-2 bg-[#7fd1ae] hover:bg-[#6fc19e] text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition active:scale-95"
                          >
                            {claiming === quest.id ? (
                              t("Alınıyor...", "Claiming...")
                            ) : (
                              <>
                                <Gift className="w-4 h-4" /> {t("Topla", "Claim")}
                              </>
                            )}
                          </button>
                        )}

                        {quest.isClaimed && (
                          <span className="px-4 py-2 bg-gray-200 text-gray-400 font-bold rounded-lg flex items-center gap-2">
                            <Check className="w-4 h-4" /> {t("Tamamlandı", "Completed")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div >
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fdf8f3]"><div className="text-xl text-[#9a9a9a]">Loading...</div></div>}>
      <ProfileContent />
    </Suspense>
  );
}

