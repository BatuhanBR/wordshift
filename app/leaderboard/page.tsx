"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Trophy, ArrowLeft, Clock, Zap, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTopPlayers, getTopPlayersForMode, formatTime, type LeaderboardPlayer } from "@/lib/multiplayer/leaderboard";

type SortKey = "elo" | "wins" | "losses" | "winRate" | "bestTimeMs" | "worstTimeMs" | "dailyStreak";
type SortDirection = "asc" | "desc";
type TabMode = "all" | 4 | 5 | 6 | 7;

const avatarColors = [
    "from-[#f5c6d6] to-[#e89db8]",
    "from-[#a7c7e7] to-[#7ba7d1]",
    "from-[#c4b5e0] to-[#9d8bc7]",
    "from-[#a8d5a2] to-[#7bc275]",
    "from-[#f9c784] to-[#e5a855]",
];

export default function LeaderboardPage() {
    const { language, t } = useLanguage();
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>("elo");
    const [sortDir, setSortDir] = useState<SortDirection>("desc");
    const [activeTab, setActiveTab] = useState<TabMode>("all");

    const TAB_CONFIG: { mode: TabMode; label: string; gradient: string }[] = [
        { mode: "all", label: language === "en" ? "🌐 Global" : "🌐 Genel", gradient: "from-[#c4b5e0] to-[#9d8bc7]" },
        { mode: 4, label: language === "en" ? "4 Letters" : "4 Harf", gradient: "from-[#a8d5a2] to-[#7bc275]" },
        { mode: 5, label: language === "en" ? "5 Letters" : "5 Harf", gradient: "from-[#f9c784] to-[#e5a855]" },
        { mode: 6, label: language === "en" ? "6 Letters" : "6 Harf", gradient: "from-[#c4b5e0] to-[#9d8bc7]" },
        { mode: 7, label: language === "en" ? "7 Letters" : "7 Harf", gradient: "from-[#a7c7e7] to-[#7ba7d1]" },
    ];

    useEffect(() => {
        loadLeaderboard();
    }, [activeTab, language]);

    const loadLeaderboard = async () => {
        setLoading(true);
        setError(null);

        try {
            let topPlayers: LeaderboardPlayer[];

            if (activeTab === "all") {
                topPlayers = await getTopPlayers(100, language);
            } else {
                topPlayers = await getTopPlayersForMode(activeTab, 100);
            }

            setPlayers(topPlayers);
        } catch (err) {
            console.error("Leaderboard fetch error:", err);
            setError(t("Sıralama yüklenirken bir hata oluştu. Lütfen tekrar deneyin.", "Error loading leaderboard. Please try again."));
        }

        setLoading(false);
    };

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            if (aVal === null) aVal = sortDir === "asc" ? Infinity : -Infinity;
            if (bVal === null) bVal = sortDir === "asc" ? Infinity : -Infinity;

            if (sortDir === "asc") {
                return (aVal as number) - (bVal as number);
            } else {
                return (bVal as number) - (aVal as number);
            }
        });
    }, [players, sortKey, sortDir]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === "desc" ? "asc" : "desc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };

    const SortHeader = ({ label, sortKeyName, icon }: { label?: string; sortKeyName: SortKey; icon?: React.ReactNode }) => {
        const isActive = sortKey === sortKeyName;
        return (
            <button
                onClick={() => handleSort(sortKeyName)}
                className={`flex items-center justify-center gap-1 hover:text-[#4a4a4a] transition-colors ${isActive ? "text-[#f9c784]" : ""}`}
            >
                {icon || label}
                {isActive ? (
                    sortDir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />
                ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                )}
            </button>
        );
    };

    const getTabTitle = () => {
        const tab = TAB_CONFIG.find(t => t.mode === activeTab);
        return tab ? (language === "en" ? `${tab.label} Ranking` : `${tab.label} Sıralaması`) : (language === "en" ? "Global Leaderboard" : "Global Liderlik Tablosu");
    };

    return (
        <div className="min-h-screen relative overflow-hidden text-[#4a4a4a] cozy-pattern">
            {/* Decorative Blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#f9c784]/20 to-[#f9c784]/5 blur-3xl" />
                <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#c4b5e0]/20 to-[#c4b5e0]/5 blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#a8d5a2]/20 to-[#a8d5a2]/5 blur-3xl" />
            </div>

            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/" className="p-2 rounded-xl hover:bg-[#f5efe6] text-[#9a9a9a] hover:text-[#4a4a4a] transition">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#f9c784] to-[#e5a855] shadow-soft flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#4a4a4a]">
                                🏆 {getTabTitle()}
                            </h1>
                            <p className="text-sm text-[#9a9a9a]">{t("Top 100 Oyuncu • Sıralamak için başlığa tıkla", "Top 100 Players • Click header to sort")}</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {TAB_CONFIG.map((tab) => (
                        <button
                            key={tab.mode}
                            onClick={() => setActiveTab(tab.mode)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.mode
                                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-soft`
                                : "bg-white text-[#9a9a9a] hover:bg-[#f5efe6] hover:text-[#4a4a4a] border border-[#e8e0d5]"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-[#9a9a9a]">{t("Yükleniyor...", "Loading...")}</div>
                        </div>
                    ) : players.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <Trophy className="h-12 w-12 text-[#d4d4d4] mx-auto mb-4" />
                                <div className="text-[#9a9a9a]">{t("Henüz sıralama yok", "No rankings yet")}</div>
                                <p className="text-sm text-[#c4c4c4] mt-2">{t("İlk maçını oyna ve sıralamaya gir!", "Play your first match and join the rankings!")}</p>
                                <Link href="/multiplayer" className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white font-semibold rounded-xl shadow-soft">
                                    {t("Multiplayer Oyna", "Play Multiplayer")}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#f5efe6] border-b border-[#e8e0d5] text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider">
                                <div className="col-span-1">#</div>
                                <div className="col-span-3">{t("Oyuncu", "Player")}</div>
                                <div className="col-span-1 text-center">Rank</div>
                                <div className="col-span-1 text-center">
                                    <SortHeader label="🔥" sortKeyName="dailyStreak" />
                                </div>
                                <div className="col-span-1 text-center">
                                    <SortHeader label="ELO" sortKeyName="elo" />
                                </div>
                                <div className="col-span-1 text-center">
                                    <SortHeader label="G" sortKeyName="wins" />
                                </div>
                                <div className="col-span-1 text-center">
                                    <SortHeader label="M" sortKeyName="losses" />
                                </div>
                                <div className="col-span-1 text-center">
                                    <SortHeader label="%" sortKeyName="winRate" />
                                </div>
                                <div className="col-span-1 text-center">
                                    <SortHeader sortKeyName="bestTimeMs" icon={<Zap className="h-3 w-3" />} />
                                </div>
                                <div className="col-span-1 text-center">
                                    <SortHeader sortKeyName="worstTimeMs" icon={<Clock className="h-3 w-3" />} />
                                </div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-[#f5efe6]">
                                {sortedPlayers.map((player, index) => (
                                    <div
                                        key={player.uid}
                                        className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-all hover:bg-[#f5efe6] ${index === 0
                                            ? "bg-gradient-to-r from-[#f9c784]/10 to-[#f9c784]/5"
                                            : index === 1
                                                ? "bg-gradient-to-r from-[#c4c4c4]/10 to-[#c4c4c4]/5"
                                                : index === 2
                                                    ? "bg-gradient-to-r from-[#deb887]/10 to-[#deb887]/5"
                                                    : ""
                                            }`}
                                    >
                                        {/* Rank Number */}
                                        <div className="col-span-1">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
                                                    ? "bg-gradient-to-br from-[#f9c784] to-[#e5a855] text-white shadow-soft"
                                                    : index === 1
                                                        ? "bg-gradient-to-br from-[#d4d4d4] to-[#a8a8a8] text-white shadow-soft"
                                                        : index === 2
                                                            ? "bg-gradient-to-br from-[#deb887] to-[#c4a575] text-white shadow-soft"
                                                            : "bg-[#f5efe6] text-[#9a9a9a]"
                                                    }`}
                                            >
                                                {index + 1}
                                            </div>
                                        </div>

                                        {/* Player */}
                                        <div className="col-span-3 flex items-center gap-3 min-w-0">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-soft`}>
                                                {player.displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-[#4a4a4a] truncate">{player.displayName}</span>
                                        </div>

                                        {/* Rank Badge */}
                                        <div className="col-span-1 text-center flex justify-center">
                                            <span className="text-xl" title={language === "en" ? player.rank.nameEn : player.rank.name}>{player.rank.emoji}</span>
                                        </div>

                                        {/* Streak */}
                                        <div className="col-span-1 text-center">
                                            <span className="font-bold text-orange-500">
                                                {player.dailyStreak || 0}
                                            </span>
                                        </div>

                                        {/* ELO */}
                                        <div className="col-span-1 text-center">
                                            <span className="font-bold text-[#4a4a4a]">
                                                {player.elo}
                                            </span>
                                        </div>

                                        {/* Wins */}
                                        <div className="col-span-1 text-center text-[#8fbc8f] font-semibold">
                                            {player.wins}
                                        </div>

                                        {/* Losses */}
                                        <div className="col-span-1 text-center text-[#e8a0a0] font-semibold">
                                            {player.losses}
                                        </div>

                                        {/* Win Rate */}
                                        <div className="col-span-1 text-center">
                                            <span className={`font-semibold ${player.winRate >= 60 ? "text-[#8fbc8f]" :
                                                player.winRate >= 40 ? "text-[#f9c784]" :
                                                    "text-[#e8a0a0]"
                                                }`}>
                                                {player.winRate.toFixed(0)}%
                                            </span>
                                        </div>

                                        {/* Best Time */}
                                        <div className="col-span-1 text-center text-[#a7c7e7] text-sm">
                                            {formatTime(player.bestTimeMs)}
                                        </div>

                                        {/* Worst Time */}
                                        <div className="col-span-1 text-center text-[#f9c784] text-sm">
                                            {formatTime(player.worstTimeMs)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#9a9a9a]">
                    <div className="flex items-center gap-2">
                        <span className="text-[#8fbc8f] font-semibold">G</span>
                        <span>{t("Galibiyet", "Wins")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[#e8a0a0] font-semibold">M</span>
                        <span>{t("Mağlubiyet", "Losses")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-[#a7c7e7]" />
                        <span>{t("En Hızlı Galibiyet", "Fastest Win")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-[#f9c784]" />
                        <span>{t("En Uzun Galibiyet", "Longest Win")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
