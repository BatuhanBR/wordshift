// Database Type Definitions
// Merkezi tip tanımları - tüm Firestore collection'ları için

// ============================================
// USER DOCUMENT
// ============================================
export interface UserDocument {
    // Kimlik
    uid?: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    createdAt: string;

    // Hesap
    plan: "free" | "premium";
    isPremium: boolean;

    // İlerleme
    xp: number;
    level: number;
    coins: number;

    // ELO (Türkçe)
    elo4: number;
    elo5: number;
    elo6: number;
    elo7: number;

    // ELO (İngilizce)
    elo4_en?: number;
    elo5_en?: number;
    elo6_en?: number;
    elo7_en?: number;
    elo_en?: number;

    // Kazanımlar
    wins4: number;
    wins5: number;
    wins6: number;
    wins7: number;
    losses4: number;
    losses5: number;
    losses6: number;
    losses7: number;

    // Multiplayer
    multiplayerWins?: number;
    multiplayerLosses?: number;
    multiplayerWins_en?: number;
    multiplayerLosses_en?: number;

    // Günlük
    dailyStreak?: number;
    lastDailyWin?: string;
    dailyHistory?: DailyHistory;
    dailyQuests?: UserQuests;

    // Başarımlar
    achievements?: Record<string, AchievementRecord>;

    // Envanter
    inventory?: UserInventory;
    equipped?: UserEquipped;

    // Mod İstatistikleri
    modeStats?: Record<string, ModeStatsRecord>;
}

export interface DailyHistory {
    date?: string;
    modes?: Record<number, boolean>;
    stats?: Record<number, DailyGameStats>;
}

export interface DailyGameStats {
    guesses: number;
    durationMs: number;
    solution: string;
    won?: boolean;
    lastGuess?: string;
}

export interface UserQuests {
    date: string;
    daily?: Quest[];
    practice?: Quest[];
}

export interface Quest {
    id: string;
    type: string;
    target: number;
    progress: number;
    reward: { xp: number; coins: number };
    completed: boolean;
    claimed: boolean;
}

export interface AchievementRecord {
    unlockedAt: string;
    isClaimed: boolean;
}

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

export interface ModeStatsRecord {
    elo: number;
    wins: number;
    losses: number;
    winStreak: number;
    lossStreak: number;
}

// ============================================
// GAME DOCUMENT
// ============================================
export interface GameDocument {
    userId: string;
    dayIndex: number | null;
    modeLen: 4 | 5 | 6 | 7;
    modeType: "daily" | "practice";
    language: "tr" | "en";
    guesses: number;
    won: boolean;
    durationMs: number | null;
    grid: string;
    createdAt: string;
}

// ============================================
// STATS DOCUMENT
// ============================================
export interface StatsDocument {
    userId: string;
    modeLen: number;
    modeType: "daily" | "practice";
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    guessDistribution: Record<number, number>;
    totalGuesses: number;
    bestTimeMs: number | null;
    lastPlayedDay: number | null;
    updatedAt: string;
}

// ============================================
// ANALYTICS EVENT
// ============================================
export interface AnalyticsEvent {
    userId: string | null;
    sessionId: string;
    eventName: string;
    properties: Record<string, any>;
    deviceInfo: DeviceInfo;
    page: string;
    referrer: string | null;
    timestamp: string;
}

export interface DeviceInfo {
    userAgent: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    deviceType: "mobile" | "tablet" | "desktop";
    screenWidth: number;
    screenHeight: number;
    language: string;
    timezone: string;
    cookieEnabled: boolean;
}

// ============================================
// SESSION DOCUMENT
// ============================================
export interface SessionDocument {
    sessionId: string;
    userId: string | null;
    startTime: string;
    endTime: string | null;
    duration: number | null;
    deviceInfo: DeviceInfo;
    pages: PageView[];
    eventsCount: number;
    referrer: string | null;
    utmParams: UTMParams | null;
}

export interface PageView {
    path: string;
    title: string;
    enteredAt: string;
    duration: number | null;
}

export interface UTMParams {
    source: string | null;
    medium: string | null;
    campaign: string | null;
    term: string | null;
    content: string | null;
}

// ============================================
// MATCH HISTORY
// ============================================
export interface MatchHistoryItem {
    id: string;
    roomId: string;
    opponentUid: string;
    opponentName: string;
    won: boolean;
    eloChange: number;
    oldElo: number;
    newElo: number;
    wordLength: number;
    solution: string;
    timestamp: any;
    guessCount?: number;
    durationMs?: number;
    performanceBonus?: number;
    streakBonus?: number;
    isDraw?: boolean;
    language?: "tr" | "en";
}

// ============================================
// COOKIE CONSENT
// ============================================
export interface CookieConsentData {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
}
