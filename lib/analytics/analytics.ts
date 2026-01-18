// Analytics System
// Cookie consent'e saygılı analitik sistemi

import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import type { AnalyticsEvent, DeviceInfo, CookieConsentData, UTMParams } from "@/lib/types/database";

// ============================================
// COOKIE CONSENT HELPERS
// ============================================

export function getCookieConsent(): CookieConsentData | null {
    if (typeof window === "undefined") return null;

    try {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) return null;
        return JSON.parse(consent) as CookieConsentData;
    } catch {
        return null;
    }
}

export function hasAnalyticsConsent(): boolean {
    const consent = getCookieConsent();
    return consent?.analytics === true;
}

export function hasMarketingConsent(): boolean {
    const consent = getCookieConsent();
    return consent?.marketing === true;
}

// ============================================
// DEVICE INFO
// ============================================

export function getDeviceInfo(): DeviceInfo {
    if (typeof window === "undefined") {
        return {
            userAgent: "",
            browser: "unknown",
            browserVersion: "",
            os: "unknown",
            osVersion: "",
            deviceType: "desktop",
            screenWidth: 0,
            screenHeight: 0,
            language: "tr",
            timezone: "Europe/Istanbul",
            cookieEnabled: false,
        };
    }

    const ua = navigator.userAgent;

    // Browser detection
    let browser = "unknown";
    let browserVersion = "";

    if (ua.includes("Firefox/")) {
        browser = "Firefox";
        browserVersion = ua.split("Firefox/")[1]?.split(" ")[0] || "";
    } else if (ua.includes("Chrome/") && !ua.includes("Edg/")) {
        browser = "Chrome";
        browserVersion = ua.split("Chrome/")[1]?.split(" ")[0] || "";
    } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
        browser = "Safari";
        browserVersion = ua.split("Version/")[1]?.split(" ")[0] || "";
    } else if (ua.includes("Edg/")) {
        browser = "Edge";
        browserVersion = ua.split("Edg/")[1]?.split(" ")[0] || "";
    }

    // OS detection
    let os = "unknown";
    let osVersion = "";

    if (ua.includes("Windows")) {
        os = "Windows";
        const match = ua.match(/Windows NT (\d+\.\d+)/);
        osVersion = match?.[1] || "";
    } else if (ua.includes("Mac OS")) {
        os = "macOS";
        const match = ua.match(/Mac OS X (\d+[._]\d+)/);
        osVersion = match?.[1]?.replace("_", ".") || "";
    } else if (ua.includes("Android")) {
        os = "Android";
        const match = ua.match(/Android (\d+\.?\d*)/);
        osVersion = match?.[1] || "";
    } else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) {
        os = "iOS";
        const match = ua.match(/OS (\d+[._]\d+)/);
        osVersion = match?.[1]?.replace("_", ".") || "";
    } else if (ua.includes("Linux")) {
        os = "Linux";
    }

    // Device type
    let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
    if (/Mobi|Android/i.test(ua)) {
        deviceType = "mobile";
    } else if (/Tablet|iPad/i.test(ua)) {
        deviceType = "tablet";
    }

    return {
        userAgent: ua,
        browser,
        browserVersion,
        os,
        osVersion,
        deviceType,
        screenWidth: window.screen?.width || 0,
        screenHeight: window.screen?.height || 0,
        language: navigator.language || "tr",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul",
        cookieEnabled: navigator.cookieEnabled,
    };
}

// ============================================
// UTM PARAMETERS
// ============================================

export function getUTMParams(): UTMParams | null {
    if (typeof window === "undefined") return null;

    const urlParams = new URLSearchParams(window.location.search);

    const source = urlParams.get("utm_source");
    const medium = urlParams.get("utm_medium");
    const campaign = urlParams.get("utm_campaign");
    const term = urlParams.get("utm_term");
    const content = urlParams.get("utm_content");

    if (!source && !medium && !campaign) return null;

    return { source, medium, campaign, term, content };
}

// ============================================
// SESSION MANAGEMENT
// ============================================

let currentSessionId: string | null = null;
let sessionStartTime: number | null = null;

export function generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function getSessionId(): string {
    if (typeof window === "undefined") return "";

    if (!currentSessionId) {
        // Check for existing session in sessionStorage
        let sessionId = sessionStorage.getItem("analyticsSessionId");

        if (!sessionId) {
            sessionId = generateSessionId();
            sessionStorage.setItem("analyticsSessionId", sessionId);
            sessionStartTime = Date.now();
            sessionStorage.setItem("analyticsSessionStart", sessionStartTime.toString());
        } else {
            sessionStartTime = parseInt(sessionStorage.getItem("analyticsSessionStart") || Date.now().toString());
        }

        currentSessionId = sessionId;
    }

    return currentSessionId;
}

export function getSessionDuration(): number {
    if (!sessionStartTime) {
        sessionStartTime = parseInt(sessionStorage.getItem("analyticsSessionStart") || Date.now().toString());
    }
    return Math.floor((Date.now() - sessionStartTime) / 1000);
}

// ============================================
// EVENT TRACKING
// ============================================

export async function trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    userId: string | null = null
): Promise<void> {
    // Check analytics consent
    if (!hasAnalyticsConsent()) {
        console.log(`[Analytics] Skipped: ${eventName} (no consent)`);
        return;
    }

    try {
        const event: AnalyticsEvent = {
            userId,
            sessionId: getSessionId(),
            eventName,
            properties,
            deviceInfo: getDeviceInfo(),
            page: typeof window !== "undefined" ? window.location.pathname : "",
            referrer: typeof document !== "undefined" ? document.referrer || null : null,
            timestamp: new Date().toISOString(),
        };

        await addDoc(collection(db, "analytics_events"), event);
        console.log(`[Analytics] Tracked: ${eventName}`, properties);
    } catch (error) {
        console.error("[Analytics] Error tracking event:", error);
    }
}

// ============================================
// PAGE VIEW TRACKING
// ============================================

export async function trackPageView(
    pagePath: string,
    pageTitle: string,
    userId: string | null = null
): Promise<void> {
    await trackEvent("page_view", {
        page_path: pagePath,
        page_title: pageTitle,
        session_duration: getSessionDuration(),
    }, userId);
}

// ============================================
// PREDEFINED EVENTS
// ============================================

// Auth events
export const trackLogin = (userId: string, method: "email" | "google") =>
    trackEvent("login", { method }, userId);

export const trackSignup = (userId: string, method: "email" | "google") =>
    trackEvent("signup", { method }, userId);

export const trackLogout = (userId: string) =>
    trackEvent("logout", {}, userId);

// Game events
export const trackGameStart = (
    userId: string | null,
    mode: "daily" | "practice" | "multiplayer",
    wordLength: number,
    language: "tr" | "en"
) => trackEvent("game_start", { mode, wordLength, language }, userId);

export const trackGuessSubmit = (
    userId: string | null,
    guessNumber: number,
    isCorrect: boolean,
    timeSpentMs: number
) => trackEvent("guess_submit", { guessNumber, isCorrect, timeSpentMs }, userId);

export const trackGameComplete = (
    userId: string | null,
    mode: "daily" | "practice" | "multiplayer",
    wordLength: number,
    won: boolean,
    guesses: number,
    durationMs: number,
    language: "tr" | "en"
) => trackEvent("game_complete", { mode, wordLength, won, guesses, durationMs, language }, userId);

export const trackPowerupUse = (
    userId: string,
    powerupType: "hint" | "eliminate",
    gameMode: "daily" | "practice"
) => trackEvent("powerup_use", { powerupType, gameMode }, userId);

// Shop events
export const trackPurchase = (
    userId: string,
    itemId: string,
    itemType: string,
    price: number
) => trackEvent("purchase", { itemId, itemType, price }, userId);

// Social events
export const trackFriendAdd = (userId: string) =>
    trackEvent("friend_add", {}, userId);

export const trackShare = (userId: string | null, platform: string) =>
    trackEvent("share", { platform }, userId);

// UI events
export const trackButtonClick = (
    buttonName: string,
    pagePath: string,
    userId: string | null = null
) => trackEvent("button_click", { buttonName, pagePath }, userId);

export const trackModalOpen = (
    modalName: string,
    userId: string | null = null
) => trackEvent("modal_open", { modalName }, userId);

export const trackLanguageChange = (
    fromLang: string,
    toLang: string,
    userId: string | null = null
) => trackEvent("language_change", { fromLang, toLang }, userId);
