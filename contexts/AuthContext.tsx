"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { usePresence } from "@/hooks/usePresence";
import { UserQuests } from "@/lib/quests/types";
import { generateDailyQuests, generatePracticeQuests } from "@/lib/quests/manager";

export interface UserData {
  displayName: string;
  email: string;
  photoURL: string | null;
  xp: number;
  level: number;
  coins: number;
  isPremium: boolean;
  plan: string;
  dailyQuests?: UserQuests;
  inventory?: {
    avatars: string[];
    frames: string[];
    themes: string[];
    powerups?: Record<string, number>;
  };
  equipped?: {
    avatar: string;
    frame: string;
    theme: string;
  };
  dailyStreak?: number;
  lastDailyWin?: string;
  dailyHistory?: {
    date?: string;
    modes?: Record<number, boolean>;
    stats?: Record<number, { guesses: number; durationMs: number; solution: string }>;
  };
  achievements?: {
    [id: string]: {
      unlockedAt: string;
      isClaimed: boolean;
    }
  };
  totalDailyQuestsCompleted?: number;
  totalUnlimitedQuestsCompleted?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isPremium: boolean;
  refreshUserData: () => Promise<void>;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, displayName?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isPremium: false,
  refreshUserData: async () => { },
  login: async () => { throw new Error("AuthContext not initialized"); },
  register: async () => { throw new Error("AuthContext not initialized"); },
  logout: async () => { throw new Error("AuthContext not initialized"); },
  loginWithGoogle: async () => { throw new Error("AuthContext not initialized"); },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const isMountedRef = useRef(true);

  // Activate presence system
  usePresence(user);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // Fetch user data (one-time, no real-time listener)
  const fetchUserData = useCallback(async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);

      if (!isMountedRef.current) return;

      if (snap.exists()) {
        const data = snap.data() as UserData;
        setUserData(data);
        setIsPremium(Boolean(data.isPremium) || data.plan === "premium");

        // Daily Quest Check
        const today = new Date().toISOString().split('T')[0];
        const currentQuests = data.dailyQuests;

        if (!currentQuests || currentQuests.date !== today || !currentQuests.practice) {
          console.log("New day detected or missing quests. Generating...");

          const validDaily = (currentQuests && currentQuests.date === today && currentQuests.daily)
            ? currentQuests.daily
            : ((currentQuests as any)?.quests || generateDailyQuests());

          const validPractice = (currentQuests && currentQuests.date === today && currentQuests.practice)
            ? currentQuests.practice
            : generatePracticeQuests();

          await updateDoc(userRef, {
            dailyQuests: {
              date: today,
              daily: validDaily,
              practice: validPractice
            }
          }).catch(err => console.error("Error generating daily quests:", err));

          // Re-fetch after update
          const updatedSnap = await getDoc(userRef);
          if (updatedSnap.exists() && isMountedRef.current) {
            setUserData(updatedSnap.data() as UserData);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }, []);

  // Manual refresh function exposed to components
  const refreshUserData = useCallback(async () => {
    if (user?.uid) {
      await fetchUserData(user.uid);
    }
  }, [user, fetchUserData]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMountedRef.current) return;

      setUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        try {
          // Check if user document exists
          const snap = await getDoc(userRef);

          if (!isMountedRef.current) return;

          if (!snap.exists()) {
            // Create new user profile
            const initialData = {
              email: currentUser.email,
              displayName: currentUser.displayName || "Oyuncu",
              createdAt: new Date().toISOString(),
              photoURL: currentUser.photoURL || null,
              plan: "free",
              isPremium: false,
              elo4: 1200, elo5: 1200, elo6: 1200, elo7: 1200,
              wins4: 0, wins5: 0, wins6: 0, wins7: 0,
              losses4: 0, losses5: 0, losses6: 0, losses7: 0,
              xp: 0, level: 1, coins: 100,
              inventory: { avatars: ["default"], frames: ["none"], themes: ["default"] },
              equipped: { avatar: "default", frame: "none", theme: "default" }
            };
            await setDoc(userRef, initialData);
          } else {
            // Migration check
            const data = snap.data();
            if (data.level === undefined || data.xp === undefined || data.coins === undefined) {
              await setDoc(userRef, {
                xp: data.xp || 0,
                level: data.level || 1,
                coins: (data.coins !== undefined) ? data.coins : 100
              }, { merge: true });
            }
          }

          // Fetch user data (one-time)
          await fetchUserData(currentUser.uid);
        } catch (error) {
          console.error("Auth state change error:", error);
        }

        if (isMountedRef.current) {
          setLoading(false);
        }
      } else {
        // User logged out
        setUserData(null);
        setIsPremium(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [fetchUserData]);

  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);

  const register = async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      displayName: displayName || "Oyuncu",
      createdAt: new Date().toISOString(),
      photoURL: null,
      plan: "free",
      isPremium: false,
      elo4: 1200, elo5: 1200, elo6: 1200, elo7: 1200,
      xp: 0, level: 1, coins: 100
    }, { merge: true });
    // Sign out after registration so user must log in manually
    await signOut(auth);
    return cred;
  };

  const logout = () => signOut(auth);

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, new GoogleAuthProvider());
    return res;
  };

  const value = {
    user,
    userData,
    loading,
    isPremium,
    refreshUserData,
    login,
    register,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
