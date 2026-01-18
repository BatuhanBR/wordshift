import { Achievement } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
    // --- DAILY MODE ---
    {
        id: "daily_first_win",
        title: "İlk Günlük Zafer",
        description: "Günlük modda ilk galibiyetini al.",
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
        title: "Isınma Turları",
        description: "3 gün üst üste oyuna gir.",
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
        title: "Sadık Oyuncu",
        description: "7 gün üst üste oyuna gir.",
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
        title: "Aylık Maraton",
        description: "30 gün üst üste serini koru.",
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
        title: "Günlük Rutin",
        description: "Toplam 50 günlük oyun kazan.",
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
        title: "Pratik Yap",
        description: "Sınırsız modda 10 oyun kazan.",
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
        title: "Kelime Avcısı",
        description: "Sınırsız modda 100 oyun kazan.",
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
        title: "Kelime Efsanesi",
        description: "Sınırsız modda 500 oyun kazan.",
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
        title: "5 Harf Uzmanı",
        description: "5 harfli oyunlarda 50 galibiyet al.",
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
        title: "6 Harf Uzmanı",
        description: "6 harfli oyunlarda 50 galibiyet al.",
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
        title: "Deneyimli",
        description: "10. Seviyeye ulaş.",
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
        title: "Kasa Doldu",
        description: "5000 Coin biriktir.",
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
        title: "Koleksiyoner",
        description: "5 farklı eşyaya sahip ol.",
        icon: "🎒",
        category: "collection",
        tier: "silver",
        reward: { xp: 300, coins: 300 },
        condition: (stats) => (stats.inventorySize || 0) >= 5,
        maxProgress: 5,
        getProgress: (stats) => stats.inventorySize || 0
    }
];
