"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "tr" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (trText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => { },
    t: (trText, enText) => enText,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [mounted, setMounted] = useState(false);

    // Load language preference from localStorage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language | null;
        if (savedLang && (savedLang === "tr" || savedLang === "en")) {
            setLanguageState(savedLang);
        }
        setMounted(true);
    }, []);

    // Save language preference to localStorage
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    // Simple translation helper
    const t = (trText: string, enText: string) => {
        return language === "en" ? enText : trText;
    };

    // Prevent hydration mismatch by not rendering children until mounted
    if (!mounted) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}
