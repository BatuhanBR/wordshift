"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { getTopPlayers, type LeaderboardPlayer } from "@/lib/multiplayer/leaderboard";
import { useLanguage } from "@/contexts/LanguageContext";

export function LeaderboardCard() {
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage();

    useEffect(() => {
        loadLeaderboard();
    }, [language]);

    const loadLeaderboard = async () => {
        setLoading(true);
        const topPlayers = await getTopPlayers(10, language);
        setPlayers(topPlayers);
        setLoading(false);
    };

    // Pastel avatar colors
    const avatarColors = [
        "from-[#f5c6d6] to-[#e89db8]",
        "from-[#a7c7e7] to-[#7ba7d1]",
        "from-[#c4b5e0] to-[#9d8bc7]",
        "from-[#a8d5a2] to-[#7bc275]",
        "from-[#f9c784] to-[#e5a855]",
    ];

    return (
        <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#f9c784]/20 via-[#f5c6d6]/20 to-[#c4b5e0]/20 border-b border-[#e8e0d5] px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#f9c784] to-[#e5a855] shadow-soft flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#4a4a4a]">🏆 {t("Liderlik Tablosu", "Leaderboard")}</h2>
                            <p className="text-xs text-[#9a9a9a]">{t("Top 10 Oyuncu", "Top 10 Players")}</p>
                        </div>
                    </div>
                    <Link href="/leaderboard" className="flex items-center gap-1 text-sm font-medium text-[#f9c784] hover:text-[#e5a855] transition">
                        {t("Tümünü Gör", "View All")}
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-[#9a9a9a]">{t("Yükleniyor...", "Loading...")}</div>
                    </div>
                ) : players.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="text-[#9a9a9a]">{t("Henüz oyuncu yok", "No players yet")}</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {players.map((player, index) => (
                            <div
                                key={player.uid}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-[#f5efe6] ${index === 0
                                    ? "bg-gradient-to-r from-[#f9c784]/10 to-[#f9c784]/5 border border-[#f9c784]/30"
                                    : index === 1
                                        ? "bg-gradient-to-r from-[#c4c4c4]/10 to-[#c4c4c4]/5 border border-[#c4c4c4]/30"
                                        : index === 2
                                            ? "bg-gradient-to-r from-[#e5a855]/10 to-[#e5a855]/5 border border-[#e5a855]/30"
                                            : "border border-transparent"
                                    }`}
                            >
                                {/* Rank Number */}
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0
                                        ? "bg-gradient-to-br from-[#f9c784] to-[#e5a855] text-white"
                                        : index === 1
                                            ? "bg-gradient-to-br from-[#d4d4d4] to-[#a8a8a8] text-white"
                                            : index === 2
                                                ? "bg-gradient-to-br from-[#deb887] to-[#c4a575] text-white"
                                                : "bg-[#f5efe6] text-[#9a9a9a]"
                                        }`}
                                >
                                    {index + 1}
                                </div>

                                {/* Avatar */}
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-soft`}>
                                    {player.displayName.charAt(0).toUpperCase()}
                                </div>

                                {/* Player Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-[#4a4a4a] truncate">{player.displayName}</span>
                                        <span className="text-sm">{player.rank.emoji}</span>
                                    </div>
                                    <div className="text-xs text-[#9a9a9a]">
                                        {player.wins}{t("G", "W")} - {player.losses}{t("M", "L")}
                                    </div>
                                </div>

                                {/* ELO */}
                                <div className="text-right">
                                    <div className="text-lg font-bold text-[#4a4a4a]">
                                        {player.elo}
                                    </div>
                                    <div className="text-xs text-[#c4c4c4]">ELO</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
