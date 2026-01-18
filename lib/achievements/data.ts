import { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
    // --- DAILY MODE ---
    {
        id: "daily_first_win",
        title: { tr: "İlk Günlük Zafer", en: "First Daily Victory" },
        description: { tr: "Günlük modda ilk galibiyetini al.", en: "Get your first win in daily mode." },
        icon: "🌅",
        category: "daily",
        tier: "bronze",
        reward: { xp: 50, coins: 50 },
        condition: (stats) => stats.dailyWins >= 1,
        maxProgress: 1,
        getProgress: (stats) => stats.dailyWins
    },
    {
        id: "daily_streak_3",
        title: { tr: "Isınma Turları", en: "Warm Up Rounds" },
        description: { tr: "3 gün üst üste oyuna gir.", en: "Play for 3 consecutive days." },
        icon: "🔥",
        category: "daily",
        tier: "bronze",
        reward: { xp: 100, coins: 100 },
        condition: (stats) => stats.dailyStreak >= 3,
        maxProgress: 3,
        getProgress: (stats) => stats.dailyStreak
    },
    {
        id: "daily_streak_7",
        title: { tr: "Sadık Oyuncu", en: "Loyal Player" },
        description: { tr: "7 gün üst üste oyuna gir.", en: "Play for 7 consecutive days." },
        icon: "📅",
        category: "daily",
        tier: "silver",
        reward: { xp: 300, coins: 300 },
        condition: (stats) => stats.dailyStreak >= 7,
        maxProgress: 7,
        getProgress: (stats) => stats.dailyStreak
    },
    {
        id: "daily_streak_30",
        title: { tr: "Aylık Maraton", en: "Monthly Marathon" },
        description: { tr: "30 gün üst üste serini koru.", en: "Maintain a 30-day streak." },
        icon: "🏆",
        category: "daily",
        tier: "gold",
        reward: { xp: 1000, coins: 1000, item: { type: "frame", id: "gold" } },
        condition: (stats) => stats.dailyStreak >= 30,
        maxProgress: 30,
        getProgress: (stats) => stats.dailyStreak
    },
    {
        id: "daily_master",
        title: { tr: "Günlük Rutin", en: "Daily Routine" },
        description: { tr: "Toplam 50 günlük oyun kazan.", en: "Win 50 daily games total." },
        icon: "☕",
        category: "daily",
        tier: "silver",
        reward: { xp: 500, coins: 500 },
        condition: (stats) => stats.dailyWins >= 50,
        maxProgress: 50,
        getProgress: (stats) => stats.dailyWins
    },

    // --- UNLIMITED (PRACTICE) MODE ---
    {
        id: "unlimited_novice",
        title: { tr: "Pratik Yap", en: "Practice Makes Perfect" },
        description: { tr: "Sınırsız modda 10 oyun kazan.", en: "Win 10 games in unlimited mode." },
        icon: "🎮",
        category: "unlimited",
        tier: "bronze",
        reward: { xp: 100, coins: 100, item: { type: "avatar", id: "cat" } },
        condition: (stats) => stats.practiceWins >= 10,
        maxProgress: 10,
        getProgress: (stats) => stats.practiceWins
    },
    {
        id: "unlimited_expert",
        title: { tr: "Kelime Avcısı", en: "Word Hunter" },
        description: { tr: "Sınırsız modda 100 oyun kazan.", en: "Win 100 games in unlimited mode." },
        icon: "🏹",
        category: "unlimited",
        tier: "silver",
        reward: { xp: 500, coins: 500, item: { type: "avatar", id: "owl" } },
        condition: (stats) => stats.practiceWins >= 100,
        maxProgress: 100,
        getProgress: (stats) => stats.practiceWins
    },
    {
        id: "unlimited_legend",
        title: { tr: "Kelime Efsanesi", en: "Word Legend" },
        description: { tr: "Sınırsız modda 500 oyun kazan.", en: "Win 500 games in unlimited mode." },
        icon: "🐲",
        category: "unlimited",
        tier: "gold",
        reward: { xp: 2000, coins: 2000, item: { type: "avatar", id: "dragon" } },
        condition: (stats) => stats.practiceWins >= 500,
        maxProgress: 500,
        getProgress: (stats) => stats.practiceWins
    },
    {
        id: "master_5_letters",
        title: { tr: "5 Harf Uzmanı", en: "5 Letter Master" },
        description: { tr: "5 harfli oyunlarda 50 galibiyet al.", en: "Win 50 games with 5-letter words." },
        icon: "5️⃣",
        category: "unlimited",
        tier: "silver",
        reward: { xp: 300, coins: 300 },
        condition: (stats) => stats.wins5 >= 50,
        maxProgress: 50,
        getProgress: (stats) => stats.wins5
    },
    {
        id: "master_6_letters",
        title: { tr: "6 Harf Uzmanı", en: "6 Letter Master" },
        description: { tr: "6 harfli oyunlarda 50 galibiyet al.", en: "Win 50 games with 6-letter words." },
        icon: "6️⃣",
        category: "unlimited",
        tier: "silver",
        reward: { xp: 400, coins: 400 },
        condition: (stats) => stats.wins6 >= 50,
        maxProgress: 50,
        getProgress: (stats) => stats.wins6
    },

    // --- GENERAL & COLLECTION ---
    {
        id: "level_10",
        title: { tr: "Deneyimli", en: "Experienced" },
        description: { tr: "10. Seviyeye ulaş.", en: "Reach level 10." },
        icon: "⭐",
        category: "general",
        tier: "silver",
        reward: { xp: 500, coins: 500, item: { type: "theme", id: "dark" } },
        condition: (stats) => stats.level >= 10,
        maxProgress: 10,
        getProgress: (stats) => stats.level
    },
    {
        id: "rich_kid",
        title: { tr: "Kasa Doldu", en: "Money Bags" },
        description: { tr: "5000 Coin biriktir.", en: "Collect 5000 coins." },
        icon: "💰",
        category: "collection",
        tier: "gold",
        reward: { xp: 1000, coins: 500, item: { type: "theme", id: "sunset" } },
        condition: (stats) => stats.coins >= 5000,
        maxProgress: 5000,
        getProgress: (stats) => stats.coins
    },
    {
        id: "collector",
        title: { tr: "Koleksiyoner", en: "Collector" },
        description: { tr: "5 farklı eşyaya sahip ol.", en: "Own 5 different items." },
        icon: "🎒",
        category: "collection",
        tier: "silver",
        reward: { xp: 300, coins: 300 },
        condition: (stats) => (stats.inventorySize || 0) >= 5,
        maxProgress: 5,
        getProgress: (stats) => stats.inventorySize || 0
    }
];
