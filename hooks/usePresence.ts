"use client";

import { useEffect } from "react";
import { User } from "firebase/auth"; // Import User type
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function usePresence(user: User | null) {
    // useAuth yerine user prop'unu kullanıyoruz çünkü bu hook AuthProvider içinde çağrılıyor
    // ve AuthProvider kendi context'ini tüketemez.

    useEffect(() => {
        if (!user) return;

        const userRef = doc(db, "users", user.uid);

        // Set status to online safely
        const setOnline = async () => {
            // CRITICAL FIX: Asla setDoc({ merge: true }) kullanma. 
            // setDoc, doküman yoksa YENİ (boş) doküman oluşturur ve bu da AuthContext'in verileri sıfırlamasına neden olur.
            // Sadece updateDoc kullanacağız. Eğer doküman yoksa (henüz oluşturulmadıysa) hata verir ve hiçbir şey yapmaz (ki bu istediğimiz şey).
            try {
                await updateDoc(userRef, {
                    isOnline: true,
                    lastSeen: serverTimestamp(),
                });
            } catch (error: any) {
                // Eğer hata "Not Found" ise, AuthContext henüz profili oluşturmamış demektir.
                // Bu normal, bir sonraki interval'da güncelleriz.
                if (error.code !== "not-found") {
                    console.error("Error updating presence:", error);
                }
            }
        };

        // İlk açılışta biraz bekle (AuthContext'in profili oluşturmasına izin ver)
        const initialTimer = setTimeout(() => {
            setOnline();
        }, 2000);

        // Send heartbeat every minute
        const interval = setInterval(setOnline, 60000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, [user]);
}
