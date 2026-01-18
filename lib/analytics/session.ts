// Session Management System
// Oturum takibi ve sayfa görüntüleme yönetimi

import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { getDeviceInfo, getSessionId, getUTMParams, hasAnalyticsConsent } from "./analytics";
import type { SessionDocument, PageView } from "@/lib/types/database";

let currentSession: SessionDocument | null = null;
let pageEntryTime: number | null = null;
let currentPagePath: string | null = null;

// ============================================
// SESSION LIFECYCLE
// ============================================

export async function startSession(userId: string | null = null): Promise<string | null> {
    if (!hasAnalyticsConsent()) {
        console.log("[Session] Skipped: no analytics consent");
        return null;
    }

    if (typeof window === "undefined") return null;

    const sessionId = getSessionId();

    // Check if session already exists
    if (currentSession?.sessionId === sessionId) {
        // Just update userId if it changed
        if (userId && currentSession.userId !== userId) {
            currentSession.userId = userId;
            await updateSessionInFirestore();
        }
        return sessionId;
    }

    currentSession = {
        sessionId,
        userId,
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
        deviceInfo: getDeviceInfo(),
        pages: [],
        eventsCount: 0,
        referrer: document.referrer || null,
        utmParams: getUTMParams(),
    };

    try {
        await setDoc(doc(db, "sessions", sessionId), currentSession);
        console.log("[Session] Started:", sessionId);

        // Track initial page
        trackPageEntry(window.location.pathname, document.title);

        // Setup beforeunload to end session
        window.addEventListener("beforeunload", handlePageExit);

        return sessionId;
    } catch (error) {
        console.error("[Session] Error starting session:", error);
        return null;
    }
}

export async function endSession(): Promise<void> {
    if (!currentSession || !hasAnalyticsConsent()) return;

    try {
        // Track final page exit
        if (currentPagePath) {
            await trackPageExit();
        }

        const endTime = new Date().toISOString();
        const duration = Math.floor(
            (new Date(endTime).getTime() - new Date(currentSession.startTime).getTime()) / 1000
        );

        await updateDoc(doc(db, "sessions", currentSession.sessionId), {
            endTime,
            duration,
            pages: currentSession.pages,
            eventsCount: currentSession.eventsCount,
        });

        console.log("[Session] Ended:", currentSession.sessionId, `Duration: ${duration}s`);
        currentSession = null;
    } catch (error) {
        console.error("[Session] Error ending session:", error);
    }
}

async function updateSessionInFirestore(): Promise<void> {
    if (!currentSession) return;

    try {
        await updateDoc(doc(db, "sessions", currentSession.sessionId), {
            userId: currentSession.userId,
            pages: currentSession.pages,
            eventsCount: currentSession.eventsCount,
        });
    } catch (error) {
        console.error("[Session] Error updating session:", error);
    }
}

// ============================================
// PAGE TRACKING
// ============================================

export function trackPageEntry(path: string, title: string): void {
    if (!hasAnalyticsConsent() || !currentSession) return;

    // End previous page tracking
    if (currentPagePath && pageEntryTime) {
        const duration = Math.floor((Date.now() - pageEntryTime) / 1000);
        const lastPage = currentSession.pages[currentSession.pages.length - 1];
        if (lastPage && lastPage.path === currentPagePath) {
            lastPage.duration = duration;
        }
    }

    // Start new page tracking
    pageEntryTime = Date.now();
    currentPagePath = path;

    const pageView: PageView = {
        path,
        title,
        enteredAt: new Date().toISOString(),
        duration: null,
    };

    currentSession.pages.push(pageView);

    // Debounce Firestore update
    debouncedSessionUpdate();
}

async function trackPageExit(): Promise<void> {
    if (!currentSession || !currentPagePath || !pageEntryTime) return;

    const duration = Math.floor((Date.now() - pageEntryTime) / 1000);
    const lastPage = currentSession.pages[currentSession.pages.length - 1];

    if (lastPage && lastPage.path === currentPagePath) {
        lastPage.duration = duration;
    }

    pageEntryTime = null;
    currentPagePath = null;
}

function handlePageExit(): void {
    // Use sendBeacon for reliable data sending on page close
    if (!currentSession || !hasAnalyticsConsent()) return;

    trackPageExit();

    // Try to update session - may not complete if page is closing
    updateSessionInFirestore().catch(() => { });
}

// ============================================
// SESSION HELPERS
// ============================================

let updateTimeout: NodeJS.Timeout | null = null;

function debouncedSessionUpdate(): void {
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(() => {
        updateSessionInFirestore();
    }, 5000); // Update every 5 seconds max
}

export function incrementEventCount(): void {
    if (currentSession) {
        currentSession.eventsCount++;
    }
}

export function updateSessionUserId(userId: string): void {
    if (currentSession && !currentSession.userId) {
        currentSession.userId = userId;
        debouncedSessionUpdate();
    }
}

export function getCurrentSession(): SessionDocument | null {
    return currentSession;
}

// ============================================
// NAVIGATION TRACKING (for SPAs)
// ============================================

export function setupNavigationTracking(): void {
    if (typeof window === "undefined") return;

    // Track browser back/forward
    window.addEventListener("popstate", () => {
        trackPageEntry(window.location.pathname, document.title);
    });

    // For Next.js App Router - use MutationObserver to detect URL changes
    let lastUrl = window.location.href;

    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            trackPageEntry(window.location.pathname, document.title);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}
