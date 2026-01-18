"use client";

import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { ref, set, onValue, remove, get } from "firebase/database";
import { db, database } from "@/lib/firebase";
import { TR_4 } from "@/lib/words/tr-4";
import { TR_5 } from "@/lib/words/tr-5";
import { TR_6 } from "@/lib/words/tr-6";
import { TR_7 } from "@/lib/words/tr-7";

export interface PrivateLobby {
    id: string;
    hostUid: string;
    hostName: string;
    guestUid: string | null;
    guestName: string | null;
    wordLength: number;
    isPublic: boolean;
    inviteCode: string;
    status: "waiting" | "ready" | "playing" | "finished";
    createdAt: Timestamp;
    roomId?: string; // Game room ID when game starts
}

/**
 * Generate a unique 6-character invite code
 */
function generateInviteCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

/**
 * Create a new private/public lobby
 */
export async function createLobby(
    hostUid: string,
    hostName: string,
    wordLength: number,
    isPublic: boolean
): Promise<{ success: boolean; lobbyId?: string; inviteCode?: string; message?: string }> {
    try {
        const inviteCode = generateInviteCode();
        const lobbyRef = doc(collection(db, "privateLobbies"));

        await setDoc(lobbyRef, {
            hostUid,
            hostName,
            guestUid: null,
            guestName: null,
            wordLength,
            isPublic,
            inviteCode,
            status: "waiting",
            createdAt: serverTimestamp(),
        });

        return {
            success: true,
            lobbyId: lobbyRef.id,
            inviteCode
        };
    } catch (error) {
        console.error("Error creating lobby:", error);
        return { success: false, message: "Lobi oluşturulamadı." };
    }
}

/**
 * Join a lobby by invite code
 */
export async function joinLobbyByCode(
    inviteCode: string,
    guestUid: string,
    guestName: string
): Promise<{ success: boolean; lobbyId?: string; message?: string }> {
    try {
        const lobbiesRef = collection(db, "privateLobbies");
        const q = query(
            lobbiesRef,
            where("inviteCode", "==", inviteCode.toUpperCase()),
            where("status", "==", "waiting")
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { success: false, message: "Lobi bulunamadı veya dolu." };
        }

        const lobbyDoc = snapshot.docs[0];
        const lobby = lobbyDoc.data() as PrivateLobby;

        if (lobby.hostUid === guestUid) {
            return { success: false, message: "Kendi lobinize katılamazsınız." };
        }

        if (lobby.guestUid) {
            return { success: false, message: "Bu lobi dolu." };
        }

        // Join the lobby
        await setDoc(lobbyDoc.ref, {
            ...lobby,
            guestUid,
            guestName,
            status: "ready",
        });

        return { success: true, lobbyId: lobbyDoc.id };
    } catch (error) {
        console.error("Error joining lobby:", error);
        return { success: false, message: "Lobiye katılınamadı." };
    }
}

/**
 * Get public lobbies that are waiting for players
 */
export async function getPublicLobbies(): Promise<PrivateLobby[]> {
    try {
        const lobbiesRef = collection(db, "privateLobbies");
        const q = query(
            lobbiesRef,
            where("isPublic", "==", true),
            where("status", "==", "waiting")
        );
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as PrivateLobby[];
    } catch (error) {
        console.error("Error fetching public lobbies:", error);
        return [];
    }
}

/**
 * Get a lobby by ID
 */
export async function getLobby(lobbyId: string): Promise<PrivateLobby | null> {
    try {
        const lobbyRef = doc(db, "privateLobbies", lobbyId);
        const lobbySnap = await getDoc(lobbyRef);

        if (!lobbySnap.exists()) return null;

        return {
            id: lobbySnap.id,
            ...lobbySnap.data(),
        } as PrivateLobby;
    } catch (error) {
        console.error("Error fetching lobby:", error);
        return null;
    }
}

/**
 * Subscribe to lobby updates (polling-based to avoid Firebase SDK race conditions)
 */
export function subscribeLobby(
    lobbyId: string,
    callback: (lobby: PrivateLobby | null) => void
): () => void {
    let isActive = true;

    const fetchLobby = async () => {
        if (!isActive) return;

        try {
            const lobbyRef = doc(db, "privateLobbies", lobbyId);
            const snapshot = await getDoc(lobbyRef);

            if (!isActive) return;

            if (snapshot.exists()) {
                callback({
                    id: snapshot.id,
                    ...snapshot.data(),
                } as PrivateLobby);
            } else {
                callback(null);
            }
        } catch (error) {
            console.error("Error fetching lobby:", error);
        }
    };

    // Initial fetch
    fetchLobby();

    // Poll every 2 seconds for lobby updates (faster for real-time feel)
    const interval = setInterval(fetchLobby, 2000);

    // Return unsubscribe function
    return () => {
        isActive = false;
        clearInterval(interval);
    };
}

/**
 * Leave a lobby (for guest)
 */
export async function leaveLobby(lobbyId: string, isHost: boolean): Promise<boolean> {
    try {
        const lobbyRef = doc(db, "privateLobbies", lobbyId);

        if (isHost) {
            // Host leaves - delete the lobby
            await deleteDoc(lobbyRef);
        } else {
            // Guest leaves - reset to waiting
            const lobbySnap = await getDoc(lobbyRef);
            if (lobbySnap.exists()) {
                await setDoc(lobbyRef, {
                    ...lobbySnap.data(),
                    guestUid: null,
                    guestName: null,
                    status: "waiting",
                });
            }
        }

        return true;
    } catch (error) {
        console.error("Error leaving lobby:", error);
        return false;
    }
}

/**
 * Start the game from a lobby
 */
export async function startGameFromLobby(lobbyId: string): Promise<string | null> {
    try {
        const lobbyRef = doc(db, "privateLobbies", lobbyId);
        const lobbySnap = await getDoc(lobbyRef);

        if (!lobbySnap.exists()) return null;

        const lobby = lobbySnap.data() as PrivateLobby;

        if (lobby.status !== "ready" || !lobby.guestUid) {
            return null;
        }

        // Get word list
        const getWordList = (len: number): readonly string[] => {
            switch (len) {
                case 4: return TR_4;
                case 5: return TR_5;
                case 6: return TR_6;
                case 7: return TR_7;
                default: return TR_5;
            }
        };

        const wordList = getWordList(lobby.wordLength);
        const solution = wordList[Math.floor(Math.random() * wordList.length)];

        // Create game room in Realtime Database
        const roomId = `private_${lobbyId}`;
        const room = {
            id: roomId,
            players: {
                player1: {
                    uid: lobby.hostUid,
                    displayName: lobby.hostName,
                    email: "",
                    elo: 1200, // Default, will be overwritten
                },
                player2: {
                    uid: lobby.guestUid,
                    displayName: lobby.guestName,
                    email: "",
                    elo: 1200,
                },
            },
            solution,
            wordLength: lobby.wordLength,
            startTime: Date.now(),
            duration: 180, // 3 minutes
            status: "active",
            isPrivate: true,
        };

        await set(ref(database, `rooms/${roomId}`), room);

        // Notify both players
        await set(ref(database, `userGames/${lobby.hostUid}/currentRoom`), roomId);
        await set(ref(database, `userGames/${lobby.guestUid}/currentRoom`), roomId);

        // Update lobby status
        await setDoc(lobbyRef, {
            ...lobby,
            status: "playing",
            roomId,
        });

        return roomId;
    } catch (error) {
        console.error("Error starting game:", error);
        return null;
    }
}

/**
 * Invite a friend to lobby (creates notification)
 */
export async function inviteFriendToLobby(
    lobbyId: string,
    inviteCode: string,
    fromUid: string,
    fromName: string,
    toUid: string
): Promise<boolean> {
    try {
        const inviteRef = doc(collection(db, "users", toUid, "lobbyInvites"));
        await setDoc(inviteRef, {
            lobbyId,
            inviteCode,
            fromUid,
            fromName,
            sentAt: serverTimestamp(),
        });
        return true;
    } catch (error) {
        console.error("Error inviting friend:", error);
        return false;
    }
}

/**
 * Get lobby invites for a user
 */
export async function getLobbyInvites(uid: string): Promise<any[]> {
    try {
        const invitesRef = collection(db, "users", uid, "lobbyInvites");
        const snapshot = await getDocs(invitesRef);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error fetching lobby invites:", error);
        return [];
    }
}

/**
 * Delete a lobby invite
 */
export async function deleteLobbyInvite(uid: string, inviteId: string): Promise<boolean> {
    try {
        await deleteDoc(doc(db, "users", uid, "lobbyInvites", inviteId));
        return true;
    } catch (error) {
        console.error("Error deleting invite:", error);
        return false;
    }
}
