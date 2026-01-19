import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DailyQuest } from "@/lib/quests/types";
import { Check, Gift, Coins, Trophy, Lock, ExternalLink } from "lucide-react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function DailyQuestsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, userData, refreshUserData } = useAuth();
    const { t } = useLanguage();
    const [claiming, setClaiming] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"daily" | "practice">("daily");

    if (!userData?.dailyQuests) return null;

    const currentQuests = activeTab === "daily" ? userData.dailyQuests.daily : userData.dailyQuests.practice;

    // Güvenlik önlemi: Eğer yeni yapıya geçilmediyse eski yapıyı kontrol et
    // (AuthContext bu durumu düzeltir ama anlık hata almamak için)
    const questsToRender = currentQuests || [];

    const handleClaim = async (quest: DailyQuest) => {
        if (!user || quest.isClaimed || quest.progress < quest.target) return;

        setClaiming(quest.id);
        try {
            const userRef = doc(db, "users", user.uid);

            const targetField = activeTab === "daily" ? "dailyQuests.daily" : "dailyQuests.practice";
            const updatedList = questsToRender.map(q =>
                q.id === quest.id ? { ...q, isClaimed: true } : q
            );

            const statsField = activeTab === "daily" ? "totalDailyQuestsCompleted" : "totalUnlimitedQuestsCompleted";

            await updateDoc(userRef, {
                xp: increment(quest.reward.xp),
                coins: increment(quest.reward.coins),
                [targetField]: updatedList,
                [statsField]: increment(1)
            });

            // Refresh user data to update UI immediately
            await refreshUserData();

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

        } catch (error) {
            console.error("Error claiming reward:", error);
        } finally {
            setClaiming(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#fdf8f3] border-[#e8e0d5]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#4a4a4a] flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-[#f9c784]" />
                        {t("Görevler", "Quests")}
                    </DialogTitle>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-[#f5efe6] rounded-lg mb-2">
                    <button
                        onClick={() => setActiveTab("daily")}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === "daily" ? "bg-white text-[#4a4a4a] shadow-sm" : "text-[#9a9a9a]"}`}
                    >
                        {t("Günlük", "Daily")}
                    </button>
                    <button
                        onClick={() => setActiveTab("practice")}
                        className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${activeTab === "practice" ? "bg-white text-[#4a4a4a] shadow-sm" : "text-[#9a9a9a]"}`}
                    >
                        {t("Sınırsız", "Unlimited")}
                    </button>
                </div>

                <div className="space-y-4 py-2 max-h-[50vh] overflow-y-auto">
                    {questsToRender.length === 0 && (
                        <p className="text-center text-[#9a9a9a] py-4">{t("Henüz görev yok...", "No quests yet...")}</p>
                    )}
                    {questsToRender.map((quest) => {
                        const isCompleted = quest.progress >= quest.target;
                        const progressPercent = Math.min((quest.progress / quest.target) * 100, 100);

                        return (
                            <div
                                key={quest.id}
                                className={`flex flex-col gap-3 p-4 rounded-xl border-2 transition-all ${isCompleted && !quest.isClaimed
                                    ? "bg-white border-[#f9c784] shadow-md"
                                    : quest.isClaimed
                                        ? "bg-[#f0f0f0] border-transparent opacity-60"
                                        : "bg-white border-[#e8e0d5]"
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-[#4a4a4a]">{t(quest.title, quest.titleEn || quest.title)}</h4>
                                        <p className="text-sm text-[#9a9a9a]">{t(quest.description, quest.descriptionEn || quest.description)}</p>
                                    </div>

                                    {/* Rewards Badge */}
                                    <div className="flex items-center gap-2 text-xs font-bold bg-[#fdf8f3] px-2 py-1 rounded-lg border border-[#e8e0d5]">
                                        <span className="flex items-center text-[#ffb54d]"><Trophy className="w-3 h-3 mr-1" /> {quest.reward.xp}</span>
                                        <span className="flex items-center text-[#e8a0a0]"><Coins className="w-3 h-3 mr-1" /> {quest.reward.coins}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-1">
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

                                {/* Claim Action */}
                                {isCompleted && !quest.isClaimed && (
                                    <button
                                        onClick={() => handleClaim(quest)}
                                        disabled={claiming === quest.id}
                                        className="mt-1 w-full py-2 bg-[#7fd1ae] hover:bg-[#6fc19e] text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
                                    >
                                        {claiming === quest.id ? (
                                            t("Alınıyor...", "Claiming...")
                                        ) : (
                                            <>
                                                <Gift className="w-5 h-5" /> {t("Ödülü Topla", "Claim Reward")}
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* Claimed State */}
                                {quest.isClaimed && (
                                    <div className="mt-1 w-full py-2 bg-gray-200 text-gray-400 font-bold rounded-lg flex items-center justify-center gap-2 cursor-default">
                                        <Check className="w-5 h-5" /> {t("Tamamlandı", "Completed")}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* View All Quests Button */}
                <Link
                    href="/profil?tab=quests"
                    onClick={onClose}
                    className="mt-2 w-full py-3 bg-gradient-to-r from-[#c4b5e0] to-[#9d8bc7] text-white font-bold rounded-xl shadow-soft flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                    <ExternalLink className="w-4 h-4" />
                    {t("Tüm Görevleri Görüntüle", "View All Quests")}
                </Link>
            </DialogContent>
        </Dialog>
    );
}

