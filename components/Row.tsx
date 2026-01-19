"use client";

import React, { useMemo } from "react";
import { Cell } from "@/components/Cell";
import type { LetterState } from "@/lib/game/engine";

interface RowProps {
    letters: string[];
    states?: (LetterState | "empty")[];
    wordLength: number;
}

export const Row = React.memo(function Row({ letters, states = [], wordLength }: RowProps) {
    const hasReveal = useMemo(() => states.some((s) => s !== "empty"), [states]);

    return (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))`, perspective: "1000px" }}>
            {Array.from({ length: wordLength }).map((_, i) => (
                <Cell
                    key={`${i}-${letters[i]}-${states[i]}`}
                    letter={letters[i] ?? ""}
                    state={states[i] ?? "empty"}
                    revealDelayMs={hasReveal ? i * 220 : 0}
                />
            ))}
        </div>
    );
});
