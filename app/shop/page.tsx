"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    AVATARS, FRAMES, THEMES, POWERUPS,
    ShopItem, ShopItemType,
    RARITY_COLORS, RARITY_BG_COLORS
} from "@/lib/shop/shop-items";
import { purchaseItem, equipItem, hasItem, DEFAULT_INVENTORY, DEFAULT_EQUIPPED } from "@/lib/shop/purchase";
import { ShoppingBag, Coins, Check, Lock, Sparkles } from "lucide-react";

type TabType = "avatars" | "frames" | "themes" | "powerups";

export default function ShopPage() {
    const { user, userData, loading, refreshUserData } = useAuth();
    const router = useRouter();
    const { language, t } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabType>("avatars");
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    const inventory = userData?.inventory ?? DEFAULT_INVENTORY;
    const equipped = userData?.equipped ?? DEFAULT_EQUIPPED;
    const coins = userData?.coins ?? 0;

    useEffect(() => {
        if (!loading && !user) {
            router.push("/giris");
        }
    }, [loading, user, router]);

    const getItems = (): ShopItem[] => {
        switch (activeTab) {
            case "avatars": return AVATARS;
            case "frames": return FRAMES;
            case "themes": return THEMES;
            case "powerups": return POWERUPS;
        }
    };

    const getItemType = (): ShopItemType => {
        switch (activeTab) {
            case "avatars": return "avatar";
            case "frames": return "frame";
            case "themes": return "theme";
            case "powerups": return "powerup";
        }
    };

    const isOwned = (item: ShopItem) => hasItem(inventory, item.id, item.type);

    const isEquipped = (item: ShopItem) => {
        switch (item.type) {
            case "avatar": return equipped.avatar === item.id;
            case "frame": return equipped.frame === item.id;
            case "theme": return equipped.theme === item.id;
        }
    };

    const handlePurchase = async (item: ShopItem) => {
        if (!user) return;
        setPurchasing(item.id);

        const result = await purchaseItem(user.uid, item.id, coins);

        if (result.success) {
            setMessage({
                text: `${language === "en" ? (item.name_en || item.name) : item.name} ${t("satın alındı!", "purchased!")}`,
                type: "success"
            });
            await refreshUserData();
        } else {
            setMessage({
                text: result.error || t("Hata oluştu", "An error occurred"),
                type: "error"
            });
        }

        setPurchasing(null);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleEquip = async (item: ShopItem) => {
        if (!user) return;
        setPurchasing(item.id);

        const result = await equipItem(user.uid, item.id, item.type);

        if (result.success) {
            setMessage({
                text: `${language === "en" ? (item.name_en || item.name) : item.name} ${t("donatıldı!", "equipped!")}`,
                type: "success"
            });
            await refreshUserData();
        } else {
            setMessage({
                text: result.error || t("Hata oluştu", "An error occurred"),
                type: "error"
            });
        }

        setPurchasing(null);
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdf8f3] flex items-center justify-center">
                <div className="text-[#7a7a7a]">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans text-[#4a4a4a] relative overflow-hidden cozy-pattern">
            {/* Decorative Blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#f9c784]/20 to-[#f9c784]/5 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#c4b5e0]/20 to-[#c4b5e0]/5 blur-3xl" />
            </div>

            <Navbar />

            <main className="relative z-10 max-w-4xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f9c784] to-[#e5a855] shadow-soft flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#4a4a4a]">{t("Mağaza", "Shop")}</h1>
                    </div>

                    {/* Coin Balance */}
                    <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#e8e0d5] shadow-soft">
                        <Coins className="w-5 h-5 text-[#f9c784]" />
                        <span className="text-xl font-bold text-[#4a4a4a]">{coins}</span>
                    </div>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-semibold ${message.type === "success"
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {[
                        { key: "avatars", label: t("Avatarlar", "Avatars"), icon: "😊" },
                        { key: "frames", label: t("Çerçeveler", "Frames"), icon: "✨" },
                        { key: "themes", label: t("Temalar", "Themes"), icon: "🎨" },
                        { key: "powerups", label: t("Güçlendiriciler", "Power-ups"), icon: "⚡" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as TabType)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${activeTab === tab.key
                                ? "bg-gradient-to-r from-[#f9c784] to-[#e5a855] text-white shadow-soft"
                                : "bg-white text-[#9a9a9a] hover:bg-[#f5efe6] border border-[#e8e0d5]"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getItems().map((item) => {
                        const owned = isOwned(item);
                        const active = isEquipped(item);
                        const canAfford = coins >= item.price;
                        const isLoading = purchasing === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`relative rounded-2xl border-2 p-4 transition-all hover:scale-[1.02] ${active
                                    ? "border-emerald-400 bg-emerald-50"
                                    : RARITY_BG_COLORS[item.rarity]
                                    }`}
                            >
                                {/* Rarity Badge */}
                                <div className={`absolute top-2 right-2 text-xs font-bold uppercase ${RARITY_COLORS[item.rarity]}`}>
                                    {item.rarity === "legendary" && <Sparkles className="w-4 h-4" />}
                                </div>

                                {item.type === "powerup" && (
                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg">
                                        x{(inventory.powerups?.[item.id] || 0)}
                                    </div>
                                )}

                                {/* Preview */}
                                <div className="flex items-center justify-center h-20 mb-3">
                                    {(item.type === "avatar" || item.type === "powerup") && (
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl ${item.id === "default" ? "bg-gradient-to-br from-[#c4b5e0] to-[#9d8bc7]" : "bg-white shadow-soft"
                                            }`}>
                                            {item.emoji}
                                        </div>
                                    )}
                                    {item.type === "frame" && (
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} p-1`}>
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">
                                                😊
                                            </div>
                                        </div>
                                    )}
                                    {item.type === "theme" && (
                                        <div
                                            className="w-full h-16 rounded-xl border-2 border-white shadow-inner"
                                            style={{ backgroundColor: item.preview }}
                                        />
                                    )}
                                </div>

                                {/* Name */}
                                <h3 className="font-bold text-center text-[#4a4a4a] mb-2">
                                    {language === "en" ? (item.name_en || item.name) : item.name}
                                </h3>

                                {/* Action Button */}
                                {item.type !== "powerup" && active ? (
                                    <div className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold">
                                        <Check className="w-4 h-4" />
                                        {t("Aktif", "Active")}
                                    </div>
                                ) : (item.type !== "powerup" && owned) ? (
                                    <button
                                        onClick={() => handleEquip(item)}
                                        disabled={isLoading}
                                        className="w-full py-2 px-3 rounded-xl bg-[#a7c7e7] hover:bg-[#7ba7d1] text-white text-sm font-semibold transition disabled:opacity-50"
                                    >
                                        {isLoading ? "..." : t("Donat", "Equip")}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(item)}
                                        disabled={!canAfford || isLoading}
                                        className={`w-full py-2 px-3 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-1 ${canAfford
                                            ? "bg-[#f9c784] hover:bg-[#e5a855] text-white"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        {!canAfford && <Lock className="w-3 h-3" />}
                                        <Coins className="w-3 h-3" />
                                        {isLoading ? "..." : item.price}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
