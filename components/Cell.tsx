"use client";

import React, { useEffect, useState, useRef } from "react";
import type { LetterState } from "@/lib/game/engine";

interface CellProps {
    letter?: string;
    state?: LetterState | "empty";
    revealDelayMs?: number;
}

export const Cell = React.memo(function Cell({ letter = "", state = "empty", revealDelayMs = 0 }: CellProps) {
    const [revealed, setRevealed] = useState(false);
    const prevStateRef = useRef<LetterState | "empty">(state);

    useEffect(() => {
        // Only reset if state actually changed
        if (prevStateRef.current !== state) {
            setRevealed(false);
            prevStateRef.current = state;
        }
    }, [state]);

    const base = "cell w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold uppercase select-none rounded-2xl transition-all duration-300";

    // Pastel colors
    const finalCls =
        state === "correct"
            ? "bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] border-[#8fbc8f] text-white shadow-soft"
            : state === "present"
                ? "bg-gradient-to-br from-[#f9c784] to-[#e5a855] border-[#f9c784] text-white shadow-soft"
                : state === "absent"
                    ? "bg-[#e0e0e0] border-[#d4d4d4] text-[#888]"
                    : "border-[#e8e0d5] text-[#4a4a4a] bg-white shadow-sm"; // Empty/Initial state

    // Filled but not revealed (Initial typing)
    const filledCls = "border-[#c4b5e0] text-[#4a4a4a] bg-white shadow-sm scale-105";

    const anim = !revealed && state !== "empty"
        ? state === "correct"
            ? "cell-anim-correct"
            : state === "present"
                ? "cell-anim-present"
                : "cell-anim-absent"
        : "";

    // Determine current class to render
    let currentCls = "border-[#e8e0d5] text-[#4a4a4a] bg-white/80"; // Default empty

    if (revealed) {
        currentCls = finalCls;
    } else if (letter && state === "empty") {
        currentCls = filledCls;
    }

    return (
        <div
            className={`${base} ${currentCls} ${anim} ${letter && !revealed ? "cell-pop" : ""}`}
            style={{ animationDelay: `${revealDelayMs}ms` }}
            onAnimationEnd={() => setRevealed(true)}
        >
            {letter}
        </div>
    );
});
