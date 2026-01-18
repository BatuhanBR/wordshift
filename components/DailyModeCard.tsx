"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Check, Lock, Users } from "lucide-react";

interface ModeCardProps {
    len: number;
    gradient: string;
    totalSolved?: number;
}

export function DailyModeCard({ len, gradient, totalSolved = 0 }: ModeCardProps) {
    const { userData } = useAuth();
    const { t, language } = useLanguage();

    // Check if user has already played this mode today
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyHistory = userData?.dailyHistory;
    const hasPlayedToday = dailyHistory?.date === todayStr && dailyHistory?.modes?.[len];

    const modeLabel = language === "en" ? `${len} Letters` : `${len} Harfli Mod`;
    const challengeLabel = len === 5
        ? t("Standart", "Standard")
        : t("Challenge", "Challenge");

    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white border border-[#e8e0d5] p-6 shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:scale-[1.02]">
            <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            <div className="relative">
                <div className="flex justify-between items-start mb-3">
                    <div className="text-xs text-[#9a9a9a] font-semibold uppercase tracking-wider flex items-center gap-2">
                        {modeLabel}
                        {hasPlayedToday && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold">
                                <Check className="w-3 h-3" />
                                {t("Oynandı", "Played")}
                            </span>
                        )}
                    </div>
                    {totalSolved > 0 && (
                        <div className="flex items-center gap-1 text-[10px] bg-black/5 px-2 py-1 rounded-full text-[#6a6a6a] font-medium">
                            <Users className="w-3 h-3" />
                            {totalSolved}
                        </div>
                    )}
                </div>

                <div className={`mb-5 text-xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
                    {challengeLabel}
                </div>

                {hasPlayedToday ? (
                    <div className="px-4 py-2 rounded-xl bg-[#f5efe6] text-[#9a9a9a] text-sm font-semibold flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        {t("Yarın tekrar dene", "Try again tomorrow")}
                    </div>
                ) : (
                    <Link href={len === 5 ? "/oyna?len=5" : `/oyna/${len}`}>
                        <button className={`px-4 py-2 rounded-xl bg-gradient-to-r ${gradient} text-white text-sm font-semibold shadow-soft hover:opacity-90 transition`}>
                            {t("Oyna →", "Play →")}
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}
