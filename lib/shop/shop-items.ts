// Shop Items Configuration
// Tüm satın alınabilir avatarlar, çerçeveler ve temalar

export type ShopItemType = "avatar" | "frame" | "theme" | "powerup";

export interface ShopItem {
    id: string;
    name: string;
    name_en?: string; // English name
    type: ShopItemType;
    price: number;
    emoji?: string;      // for avatars
    color?: string;      // for frames (gradient)
    preview?: string;    // for themes
    rarity: "common" | "rare" | "epic" | "legendary";
}

// Avatarlar - Emoji karakterler
export const AVATARS: ShopItem[] = [
    { id: "default", name: "Varsayılan", name_en: "Default", type: "avatar", price: 0, emoji: "😊", rarity: "common" },
    { id: "cat", name: "Kedi", name_en: "Cat", type: "avatar", price: 100, emoji: "🐱", rarity: "common" },
    { id: "dog", name: "Köpek", name_en: "Dog", type: "avatar", price: 100, emoji: "🐶", rarity: "common" },
    { id: "fox", name: "Tilki", name_en: "Fox", type: "avatar", price: 150, emoji: "🦊", rarity: "common" },
    { id: "frog", name: "Kurbağa", name_en: "Frog", type: "avatar", price: 150, emoji: "🐸", rarity: "common" },
    { id: "owl", name: "Baykuş", name_en: "Owl", type: "avatar", price: 200, emoji: "🦉", rarity: "rare" },
    { id: "unicorn", name: "Unicorn", name_en: "Unicorn", type: "avatar", price: 300, emoji: "🦄", rarity: "rare" },
    { id: "dragon", name: "Ejderha", name_en: "Dragon", type: "avatar", price: 500, emoji: "🐉", rarity: "epic" },
    { id: "phoenix", name: "Anka Kuşu", name_en: "Phoenix", type: "avatar", price: 750, emoji: "🔥", rarity: "epic" },
    { id: "alien", name: "Uzaylı", name_en: "Alien", type: "avatar", price: 1000, emoji: "👽", rarity: "legendary" },
    { id: "robot", name: "Robot", name_en: "Robot", type: "avatar", price: 1000, emoji: "🤖", rarity: "legendary" },
];

// Çerçeveler - Avatar etrafındaki çerçeveler
export const FRAMES: ShopItem[] = [
    { id: "none", name: "Yok", name_en: "None", type: "frame", price: 0, color: "from-transparent to-transparent", rarity: "common" },
    { id: "silver", name: "Gümüş", name_en: "Silver", type: "frame", price: 200, color: "from-gray-300 to-gray-500", rarity: "common" },
    { id: "gold", name: "Altın", name_en: "Gold", type: "frame", price: 400, color: "from-yellow-400 to-amber-600", rarity: "rare" },
    { id: "emerald", name: "Zümrüt", name_en: "Emerald", type: "frame", price: 500, color: "from-emerald-400 to-green-600", rarity: "rare" },
    { id: "ruby", name: "Yakut", name_en: "Ruby", type: "frame", price: 500, color: "from-red-400 to-rose-600", rarity: "rare" },
    { id: "sapphire", name: "Safir", name_en: "Sapphire", type: "frame", price: 500, color: "from-blue-400 to-indigo-600", rarity: "rare" },
    { id: "rainbow", name: "Gökkuşağı", name_en: "Rainbow", type: "frame", price: 1000, color: "from-red-500 via-yellow-500 to-blue-500", rarity: "epic" },
    { id: "neon", name: "Neon", name_en: "Neon", type: "frame", price: 1500, color: "from-cyan-400 via-purple-500 to-pink-500", rarity: "epic" },
    { id: "cosmic", name: "Kozmik", name_en: "Cosmic", type: "frame", price: 2000, color: "from-purple-600 via-pink-600 to-orange-400", rarity: "legendary" },
];

// Temalar - Klavye ve tahta renk şemaları
export const THEMES: ShopItem[] = [
    { id: "default", name: "Klasik", name_en: "Classic", type: "theme", price: 0, preview: "#f5efe6", rarity: "common" },
    { id: "dark", name: "Karanlık", name_en: "Dark", type: "theme", price: 300, preview: "#1a1a2e", rarity: "common" },
    { id: "ocean", name: "Okyanus", name_en: "Ocean", type: "theme", price: 500, preview: "#0077b6", rarity: "rare" },
    { id: "forest", name: "Orman", name_en: "Forest", type: "theme", price: 500, preview: "#2d6a4f", rarity: "rare" },
    { id: "sunset", name: "Gün Batımı", name_en: "Sunset", type: "theme", price: 750, preview: "#ff6b6b", rarity: "epic" },
    { id: "galaxy", name: "Galaksi", name_en: "Galaxy", type: "theme", price: 1500, preview: "#7209b7", rarity: "legendary" },
];

// Güçlendiriciler - Oyun içi yardımcılar
export const POWERUPS: ShopItem[] = [
    { id: "hint", name: "Harf İpucu", name_en: "Letter Hint", type: "powerup", price: 50, emoji: "🔍", rarity: "common" },
    { id: "eliminate", name: "Harf Eleme", name_en: "Letter Eliminate", type: "powerup", price: 30, emoji: "🧹", rarity: "common" },
];


// Tüm öğeler
export const ALL_SHOP_ITEMS = [...AVATARS, ...FRAMES, ...THEMES, ...POWERUPS];

// Helper: ID'ye göre öğe bul
export function getShopItem(id: string): ShopItem | undefined {
    return ALL_SHOP_ITEMS.find(item => item.id === id);
}

// Helper: Tipe göre öğeler
export function getItemsByType(type: ShopItemType): ShopItem[] {
    return ALL_SHOP_ITEMS.filter(item => item.type === type);
}

// Rarity renkleri
export const RARITY_COLORS = {
    common: "text-gray-500",
    rare: "text-blue-500",
    epic: "text-purple-500",
    legendary: "text-amber-500",
};

export const RARITY_BG_COLORS = {
    common: "bg-gray-100 border-gray-300",
    rare: "bg-blue-50 border-blue-300",
    epic: "bg-purple-50 border-purple-300",
    legendary: "bg-amber-50 border-amber-300",
};
