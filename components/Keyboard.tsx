"use client";

import React from "react";
import type { LetterState } from "@/lib/game/engine";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// Turkish keyboard layout
const TR_ROWS = [
    ["e", "r", "t", "y", "u", "ı", "o", "p", "ğ", "ü"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ş", "i"],
    ["enter", "z", "c", "v", "b", "n", "m", "ö", "ç", "back"],
];

// English QWERTY keyboard layout
const EN_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["enter", "z", "x", "c", "v", "b", "n", "m", "back"],
];

interface KeyboardProps {
    onKey: (key: string) => void;
    letterHints?: Record<string, LetterState>;
    disabledLetters?: string[];
}

export function Keyboard({ onKey, letterHints = {}, disabledLetters = [] }: KeyboardProps) {
    const { language } = useLanguage();
    const ROWS = language === "en" ? EN_ROWS : TR_ROWS;

    return (
        <div className="mt-8 select-none">
            {ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-1.5 mb-2">
                    {row.map((k) => {
                        const state = letterHints[k];
                        const isDisabled = disabledLetters.includes(k);

                        const cls = cn(
                            "h-14 px-3 rounded-xl text-sm font-bold uppercase flex items-center justify-center transition-all duration-200 shadow-sm",
                            isDisabled && "opacity-20 pointer-events-none bg-neutral-200 shadow-none border border-transparent",
                            !isDisabled && state === "correct" && "bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] text-white shadow-soft hover:opacity-90",
                            !isDisabled && state === "present" && "bg-gradient-to-br from-[#f9c784] to-[#e5a855] text-white shadow-soft hover:opacity-90",
                            !isDisabled && state === "absent" && "bg-[#e0e0e0] text-[#888] border border-[#d4d4d4]",
                            !isDisabled && !state && "bg-white text-[#4a4a4a] border border-[#e8e0d5] hover:bg-[#f5efe6] hover:scale-105 active:scale-95"
                        );
                        const label = k === "back" ? "⌫" : k;
                        const grow = k === "enter" || k === "back" ? "flex-[1.5]" : "flex-1";
                        return (
                            <button
                                key={k}
                                className={cn(cls, grow)}
                                onClick={() => onKey(k)}
                                disabled={isDisabled}
                                type="button"
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
