// Theme system implementation
// Maps theme IDs to CSS color schemes

export interface ThemeColors {
    background: string;
    boardBg: string;
    tileEmpty: string;
    tileAbsent: string;
    tilePresent: string;
    tileCorrect: string;
    tileBorder: string;
    tileText: string;
    keyboardBg: string;
    keyText: string;
}

export const THEME_CONFIGS: Record<string, ThemeColors> = {
    default: {
        background: "#fdf8f3",
        boardBg: "rgba(255, 255, 255, 0.9)",
        tileEmpty: "#ffffff",
        tileAbsent: "#d3d6da",
        tilePresent: "#f9c784",
        tileCorrect: "#7fd1ae",
        tileBorder: "#e8e0d5",
        tileText: "#4a4a4a",
        keyboardBg: "#f5efe6",
        keyText: "#4a4a4a",
    },
    dark: {
        background: "#1a1a2e",
        boardBg: "rgba(30, 30, 46, 0.9)",
        tileEmpty: "#2a2a3e",
        tileAbsent: "#3a3a4e",
        tilePresent: "#d4a574",
        tileCorrect: "#5fa88e",
        tileBorder: "#4a4a5e",
        tileText: "#e0e0e0",
        keyboardBg: "#2a2a3e",
        keyText: "#e0e0e0",
    },
    ocean: {
        background: "#e0f2fe",
        boardBg: "rgba(240, 249, 255, 0.9)",
        tileEmpty: "#f0f9ff",
        tileAbsent: "#bae6fd",
        tilePresent: "#7dd3fc",
        tileCorrect: "#0ea5e9",
        tileBorder: "#7dd3fc",
        tileText: "#0c4a6e",
        keyboardBg: "#bae6fd",
        keyText: "#0c4a6e",
    },
    forest: {
        background: "#ecfdf5",
        boardBg: "rgba(240, 253, 244, 0.9)",
        tileEmpty: "#f0fdf4",
        tileAbsent: "#bbf7d0",
        tilePresent: "#86efac",
        tileCorrect: "#22c55e",
        tileBorder: "#86efac",
        tileText: "#14532d",
        keyboardBg: "#bbf7d0",
        keyText: "#14532d",
    },
    sunset: {
        background: "#fff1f2",
        boardBg: "rgba(255, 241, 242, 0.9)",
        tileEmpty: "#fff1f2",
        tileAbsent: "#fecdd3",
        tilePresent: "#fda4af",
        tileCorrect: "#fb7185",
        tileBorder: "#fda4af",
        tileText: "#881337",
        keyboardBg: "#fecdd3",
        keyText: "#881337",
    },
    galaxy: {
        background: "#1e1b4b",
        boardBg: "rgba(46, 43, 91, 0.9)",
        tileEmpty: "#312e81",
        tileAbsent: "#4338ca",
        tilePresent: "#7c3aed",
        tileCorrect: "#a855f7",
        tileBorder: "#6366f1",
        tileText: "#e0e7ff",
        keyboardBg: "#312e81",
        keyText: "#e0e7ff",
    },
};

// Get theme colors, fallback to default
export function getThemeColors(themeId: string): ThemeColors {
    return THEME_CONFIGS[themeId] || THEME_CONFIGS.default;
}
