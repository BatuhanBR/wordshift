"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import {
    trackEvent,
    trackPageView,
    trackGameStart,
    trackGameComplete,
    trackGuessSubmit,
    trackPowerupUse,
    trackButtonClick,
    trackModalOpen,
    trackLanguageChange,
    hasAnalyticsConsent,
    getCookieConsent,
} from "@/lib/analytics/analytics";
import {
    startSession,
    endSession,
    trackPageEntry,
    updateSessionUserId,
    setupNavigationTracking,
} from "@/lib/analytics/session";

// ============================================
// ANALYTICS CONTEXT
// ============================================

interface AnalyticsContextType {
    // Consent
    isAnalyticsEnabled: boolean;
    refreshConsent: () => void;

    // Events
    trackEvent: (eventName: string, properties?: Record<string, any>) => void;
    trackPageView: (pagePath: string, pageTitle: string) => void;

    // Game events
    trackGameStart: (mode: "daily" | "practice" | "multiplayer", wordLength: number, language: "tr" | "en") => void;
    trackGameComplete: (mode: "daily" | "practice" | "multiplayer", wordLength: number, won: boolean, guesses: number, durationMs: number, language: "tr" | "en") => void;
    trackGuessSubmit: (guessNumber: number, isCorrect: boolean, timeSpentMs: number) => void;
    trackPowerupUse: (powerupType: "hint" | "eliminate", gameMode: "daily" | "practice") => void;

    // UI events
    trackButtonClick: (buttonName: string) => void;
    trackModalOpen: (modalName: string) => void;
    trackLanguageChange: (fromLang: string, toLang: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    isAnalyticsEnabled: false,
    refreshConsent: () => { },
    trackEvent: () => { },
    trackPageView: () => { },
    trackGameStart: () => { },
    trackGameComplete: () => { },
    trackGuessSubmit: () => { },
    trackPowerupUse: () => { },
    trackButtonClick: () => { },
    trackModalOpen: () => { },
    trackLanguageChange: () => { },
});

export const useAnalytics = () => useContext(AnalyticsContext);

// ============================================
// ANALYTICS PROVIDER
// ============================================

export function AnalyticsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Check consent
    const refreshConsent = useCallback(() => {
        const enabled = hasAnalyticsConsent();
        setIsAnalyticsEnabled(enabled);
        return enabled;
    }, []);

    // Initialize analytics
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Wait a bit for cookie consent to be loaded
        const initTimer = setTimeout(() => {
            const enabled = refreshConsent();

            if (enabled) {
                startSession(user?.uid || null);
                setupNavigationTracking();
            }

            setIsInitialized(true);
        }, 500);

        // Cleanup on unmount
        return () => {
            clearTimeout(initTimer);
            endSession();
        };
    }, []);

    // Listen for consent changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "cookieConsent") {
                const wasEnabled = isAnalyticsEnabled;
                const nowEnabled = refreshConsent();

                // If consent was just granted, start session
                if (!wasEnabled && nowEnabled) {
                    startSession(user?.uid || null);
                    setupNavigationTracking();
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // Also check periodically (for same-tab changes)
        const checkInterval = setInterval(refreshConsent, 2000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(checkInterval);
        };
    }, [isAnalyticsEnabled, refreshConsent, user]);

    // Update session when user logs in
    useEffect(() => {
        if (user?.uid && isAnalyticsEnabled) {
            updateSessionUserId(user.uid);
        }
    }, [user?.uid, isAnalyticsEnabled]);

    // Track page views
    useEffect(() => {
        if (!isInitialized || !isAnalyticsEnabled || !pathname) return;

        trackPageEntry(pathname, document.title);
        trackPageView(pathname, document.title, user?.uid || null);
    }, [pathname, isInitialized, isAnalyticsEnabled, user?.uid]);

    // ============================================
    // CONTEXT METHODS
    // ============================================

    const userId = user?.uid || null;

    const contextValue: AnalyticsContextType = {
        isAnalyticsEnabled,
        refreshConsent,

        trackEvent: useCallback(
            (eventName: string, properties?: Record<string, any>) => {
                if (isAnalyticsEnabled) {
                    trackEvent(eventName, properties || {}, userId);
                }
            },
            [isAnalyticsEnabled, userId]
        ),

        trackPageView: useCallback(
            (pagePath: string, pageTitle: string) => {
                if (isAnalyticsEnabled) {
                    trackPageView(pagePath, pageTitle, userId);
                }
            },
            [isAnalyticsEnabled, userId]
        ),

        trackGameStart: useCallback(
            (mode, wordLength, language) => {
                if (isAnalyticsEnabled) {
                    trackGameStart(userId, mode, wordLength, language);
                }
            },
            [isAnalyticsEnabled, userId]
        ),

        trackGameComplete: useCallback(
            (mode, wordLength, won, guesses, durationMs, language) => {
                if (isAnalyticsEnabled) {
                    trackGameComplete(userId, mode, wordLength, won, guesses, durationMs, language);
                }
            },
            [isAnalyticsEnabled, userId]
        ),

        trackGuessSubmit: useCallback(
            (guessNumber, isCorrect, timeSpentMs) => {
                if (isAnalyticsEnabled) {
                    trackGuessSubmit(userId, guessNumber, isCorrect, timeSpentMs);
                }
            },
            [isAnalyticsEnabled, userId]
        ),

        trackPowerupUse: useCallback(
            (powerupType, gameMode) => {
                if (isAnalyticsEnabled && userId) {
                    trackPowerupUse(userId, powerupType, gameMode);
                }
            },
            [isAnalyticsEnabled, userId]
        ),

        trackButtonClick: useCallback(
            (buttonName: string) => {
                if (isAnalyticsEnabled) {
                    trackButtonClick(buttonName, pathname || "", userId);
                }
            },
            [isAnalyticsEnabled, userId, pathname]
        ),

        trackModalOpen: useCallback(
            (modalName: string) => {
                if (isAnalyticsEnabled) {
                    trackModalOpen(modalName, userId);
                }
            },
            [isAnalyticsEnabled, userId]
        ),

        trackLanguageChange: useCallback(
            (fromLang: string, toLang: string) => {
                if (isAnalyticsEnabled) {
                    trackLanguageChange(fromLang, toLang, userId);
                }
            },
            [isAnalyticsEnabled, userId]
        ),
    };

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {children}
        </AnalyticsContext.Provider>
    );
}
