import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ACHIEVEMENTS } from "@/lib/achievements/data";
import { Lock, Check, Calendar, Trophy, Gift } from "lucide-react";
import { buildUserStats } from "@/lib/achievements/manager";

export function AchievementList() {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState<"daily" | "unlimited" | "general">("daily");

    if (!userData) return null;

    const userAchievements = userData.achievements || {};
    const currentStats = buildUserStats(userData);

    const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
        if (activeTab === "daily") return ach.category === "daily";
        if (activeTab === "unlimited") return ach.category === "unlimited";
        return ["general", "social", "collection", "mastery"].includes(ach.category);
    });

    // Sort: Unlocked first? Or Locked first? Usually Unlocked to show progress or Locked to motivate?
    // Let's keep original order but maybe grouping unlocked could be nice.
    // For now strict id order defined in data.ts is better for consistency.

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex p-1 bg-[#f5efe6] rounded-xl border border-[#e8e0d5]">
                {[
                    { id: "daily", label: "Günlük" },
                    { id: "unlimited", label: "Sınırsız" },
                    { id: "general", label: "Genel" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id
                            ? "bg-white text-[#4a4a4a] shadow-sm"
                            : "text-[#9a9a9a] hover:text-[#6a6a6a]"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {filteredAchievements.map((ach) => {
                    const isUnlocked = !!userAchievements[ach.id];
                    const unlockedData = userAchievements[ach.id];
                    const progress = ach.getProgress ? ach.getProgress(currentStats) : 0;
                    const maxProgress = ach.maxProgress || 1;
                    const progressPercent = Math.min(100, (progress / maxProgress) * 100);

                    // Tier colors
                    let tierColor = "bg-slate-50 border-slate-200";
                    let iconBg = "bg-slate-200";
                    const isGold = ach.tier === "gold";
                    const isPlatinum = ach.tier === "platinum";

                    if (ach.tier === "bronze") {
                        tierColor = isUnlocked ? "bg-orange-50/50 border-orange-200" : "bg-white border-slate-200";
                        iconBg = isUnlocked ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400";
                    } else if (ach.tier === "silver") {
                        tierColor = isUnlocked ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200";
                        iconBg = isUnlocked ? "bg-slate-200 text-slate-600" : "bg-slate-100 text-slate-400";
                    } else if (ach.tier === "gold") {
                        tierColor = isUnlocked ? "bg-yellow-50/50 border-yellow-200" : "bg-white border-slate-200";
                        iconBg = isUnlocked ? "bg-yellow-100 text-yellow-600" : "bg-slate-100 text-slate-400";
                    } else if (ach.tier === "platinum") {
                        tierColor = isUnlocked ? "bg-purple-50/50 border-purple-200" : "bg-white border-slate-200";
                        iconBg = isUnlocked ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-400";
                    }

                    return (
                        <div
                            key={ach.id}
                            className={`relative overflow-hidden rounded-xl border p-4 transition-all ${tierColor} ${!isUnlocked && 'opacity-90'}`}
                        >
                            {/* Locked Overlay Pattern */}
                            {!isUnlocked && (
                                <div className="absolute inset-0 bg-black/[0.02] pointer-events-none" />
                            )}

                            <div className="flex items-start gap-4 relative z-10">
                                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-sm ${iconBg} ${!isUnlocked && 'grayscale'}`}>
                                    {isUnlocked ? ach.icon : <Lock className="h-6 w-6 opacity-50" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-[#4a4a4a] truncate pr-2 text-base">{ach.title}</div>
                                        {isUnlocked && (
                                            <div className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                <Check className="h-3 w-3" />
                                                <span>Tamamlandı</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-sm text-[#8a8a8a] mb-3 leading-snug">{ach.description}</div>

                                    {/* Progress Bar */}
                                    {!isUnlocked && ach.maxProgress && ach.maxProgress > 1 && (
                                        <div className="space-y-1.5 mb-3">
                                            <div className="flex justify-between text-xs font-bold text-[#9a9a9a]">
                                                <span>İlerleme</span>
                                                <span>{Math.floor(progress)} / {maxProgress}</span>
                                            </div>
                                            <div className="h-2.5 w-full rounded-full bg-[#f0f0f0] overflow-hidden border border-black/5">
                                                <div
                                                    className={`h-full transition-all duration-500 rounded-full ${isGold ? 'bg-yellow-400' : isPlatinum ? 'bg-purple-400' : 'bg-green-400'}`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Rewards */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold mt-2">
                                        <div className="flex items-center gap-1 bg-white border border-[#e8e0d5] px-2 py-1 rounded-lg text-[#f9c784] shadow-sm">
                                            <Trophy className="h-3 w-3" />
                                            <span>+{ach.reward.xp} XP</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-white border border-[#e8e0d5] px-2 py-1 rounded-lg text-[#e5a855] shadow-sm">
                                            <span>💰 +{ach.reward.coins}</span>
                                        </div>
                                        {ach.reward.item && (
                                            <div className="flex items-center gap-1 bg-gradient-to-r from-[#c4b5e0] to-[#9d8bc7] text-white px-2 py-1 rounded-lg shadow-sm border border-white/20">
                                                <Gift className="h-3 w-3" />
                                                <span>
                                                    {ach.reward.item.type === "avatar" ? "Özel Avatar" :
                                                        ach.reward.item.type === "frame" ? "Özel Çerçeve" : "Özel Tema"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {isUnlocked && unlockedData?.unlockedAt && (
                                        <div className="mt-3 pt-3 border-t border-black/5 text-[10px] text-[#c4c4c4] flex items-center gap-1 font-medium">
                                            <Calendar className="h-3 w-3" />
                                            Kazanıldı: {new Date(unlockedData.unlockedAt).toLocaleDateString("tr-TR")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredAchievements.length === 0 && (
                <div className="text-center py-12 text-[#9a9a9a]">
                    Bu kategoride henüz başarım yok.
                </div>
            )}
        </div>
    );
}
