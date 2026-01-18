// Purchase Logic
// Mağazadan öğe satın alma ve donatma işlemleri

import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getShopItem, ShopItemType } from "./shop-items";

export interface UserInventory {
    avatars: string[];
    frames: string[];
    themes: string[];
    powerups?: Record<string, number>;
}

export interface UserEquipped {
    avatar: string;
    frame: string;
    theme: string;
}

// Varsayılan inventory (yeni kullanıcılar için)
export const DEFAULT_INVENTORY: UserInventory = {
    avatars: ["default"],
    frames: ["none"],
    themes: ["default"],
};

export const DEFAULT_EQUIPPED: UserEquipped = {
    avatar: "default",
    frame: "none",
    theme: "default",
};

// Satın alma işlemi
export async function purchaseItem(
    userId: string,
    itemId: string,
    userCoins: number
): Promise<{ success: boolean; error?: string }> {
    const item = getShopItem(itemId);

    if (!item) {
        return { success: false, error: "Öğe bulunamadı" };
    }

    if (userCoins < item.price) {
        return { success: false, error: "Yeterli coin yok" };
    }

    try {
        const userRef = doc(db, "users", userId);

        if (item.type === "powerup") {
            const powerupField = `inventory.powerups.${item.id}`;
            await updateDoc(userRef, {
                [powerupField]: increment(1),
                coins: increment(-item.price),
            });
        } else {
            const inventoryField = `inventory.${item.type}s`; // avatars, frames, themes
            await updateDoc(userRef, {
                [inventoryField]: arrayUnion(itemId),
                coins: increment(-item.price),
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Purchase error:", error);
        return { success: false, error: "Satın alma başarısız" };
    }
}

// Öğe donatma işlemi
export async function equipItem(
    userId: string,
    itemId: string,
    itemType: ShopItemType
): Promise<{ success: boolean; error?: string }> {
    try {
        const userRef = doc(db, "users", userId);
        const equippedField = `equipped.${itemType}`;

        await updateDoc(userRef, {
            [equippedField]: itemId,
        });

        return { success: true };
    } catch (error) {
        console.error("Equip error:", error);
        return { success: false, error: "Donatma başarısız" };
    }
}

// Kullanıcının öğeye sahip olup olmadığını kontrol et
export function hasItem(inventory: UserInventory | undefined, itemId: string, itemType: ShopItemType): boolean {
    if (!inventory) return false;

    switch (itemType) {
        case "avatar":
            return inventory.avatars?.includes(itemId) ?? false;
        case "frame":
            return inventory.frames?.includes(itemId) ?? false;
        case "theme":
            return inventory.themes?.includes(itemId) ?? false;
        default:
            return false;
    }
}
