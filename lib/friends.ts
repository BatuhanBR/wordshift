"use client";

import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Friend {
    uid: string;
    displayName: string;
    addedAt: Timestamp;
}

export interface FriendRequest {
    id: string;
    fromUid: string;
    fromName: string;
    toUid: string;
    toName: string;
    status: "pending" | "accepted" | "rejected";
    sentAt: Timestamp;
}

/**
 * Search for a user by display name
 */
export async function searchUserByName(displayName: string): Promise<{ uid: string; displayName: string } | null> {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", displayName));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return null;
        }

        const userDoc = snapshot.docs[0];
        return {
            uid: userDoc.id,
            displayName: userDoc.data().displayName,
        };
    } catch (error) {
        console.error("Error searching user:", error);
        return null;
    }
}

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(
    fromUid: string,
    fromName: string,
    toUid: string,
    toName: string
): Promise<{ success: boolean; message: string }> {
    try {
        // Check if already friends
        const friendRef = doc(db, "users", fromUid, "friends", toUid);
        const friendSnap = await getDoc(friendRef);
        if (friendSnap.exists()) {
            return { success: false, message: "Zaten arkadaşsınız!" };
        }

        // Check if request already exists
        const requestsRef = collection(db, "users", toUid, "friendRequests");
        const existingQuery = query(requestsRef, where("fromUid", "==", fromUid), where("status", "==", "pending"));
        const existingSnap = await getDocs(existingQuery);
        if (!existingSnap.empty) {
            return { success: false, message: "Zaten bir istek gönderdiniz!" };
        }

        // Create friend request
        const requestRef = doc(collection(db, "users", toUid, "friendRequests"));
        await setDoc(requestRef, {
            fromUid,
            fromName,
            toUid,
            toName,
            status: "pending",
            sentAt: serverTimestamp(),
        });

        return { success: true, message: "Arkadaşlık isteği gönderildi!" };
    } catch (error) {
        console.error("Error sending friend request:", error);
        return { success: false, message: "Bir hata oluştu." };
    }
}

/**
 * Get pending friend requests for a user
 */
export async function getPendingRequests(uid: string): Promise<FriendRequest[]> {
    try {
        const requestsRef = collection(db, "users", uid, "friendRequests");
        const q = query(requestsRef, where("status", "==", "pending"), orderBy("sentAt", "desc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as FriendRequest[];
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        return [];
    }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(
    myUid: string,
    myName: string,
    requestId: string
): Promise<boolean> {
    try {
        const requestRef = doc(db, "users", myUid, "friendRequests", requestId);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) return false;

        const request = requestSnap.data() as FriendRequest;

        // Add to my friends list
        await setDoc(doc(db, "users", myUid, "friends", request.fromUid), {
            displayName: request.fromName,
            addedAt: serverTimestamp(),
        });

        // Add me to their friends list
        await setDoc(doc(db, "users", request.fromUid, "friends", myUid), {
            displayName: myName,
            addedAt: serverTimestamp(),
        });

        // Update request status
        await setDoc(requestRef, { ...request, status: "accepted" }, { merge: true });

        return true;
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return false;
    }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(uid: string, requestId: string): Promise<boolean> {
    try {
        const requestRef = doc(db, "users", uid, "friendRequests", requestId);
        await setDoc(requestRef, { status: "rejected" }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        return false;
    }
}

/**
 * Get all friends for a user
 */
export async function getFriends(uid: string): Promise<Friend[]> {
    try {
        const friendsRef = collection(db, "users", uid, "friends");
        const snapshot = await getDocs(friendsRef);

        return snapshot.docs.map((doc) => ({
            uid: doc.id,
            displayName: doc.data().displayName,
            addedAt: doc.data().addedAt,
        })) as Friend[];
    } catch (error) {
        console.error("Error fetching friends:", error);
        return [];
    }
}

/**
 * Remove a friend
 */
export async function removeFriend(myUid: string, friendUid: string): Promise<boolean> {
    try {
        // Remove from my list
        await deleteDoc(doc(db, "users", myUid, "friends", friendUid));
        // Remove me from their list
        await deleteDoc(doc(db, "users", friendUid, "friends", myUid));
        return true;
    } catch (error) {
        console.error("Error removing friend:", error);
        return false;
    }
}
