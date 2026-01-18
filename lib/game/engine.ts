import { normalizeForComparison, splitGraphemes } from "@/lib/utils/tr-normalize";

export type LetterState = "correct" | "present" | "absent";

export interface EvaluationResult {
    letters: string[]; // original user input graphemes (NFC)
    states: LetterState[]; // per-position result
}

export function evaluateGuess(guessRaw: string, solutionRaw: string): EvaluationResult {
    const guess = normalizeForComparison(guessRaw);
    const solution = normalizeForComparison(solutionRaw);

    const g = splitGraphemes(guess);
    const s = splitGraphemes(solution);

    const result: LetterState[] = new Array(g.length).fill("absent");

    // First pass: mark correct positions and build frequency map for remaining solution letters
    const freq: Record<string, number> = {};
    for (let i = 0; i < g.length; i++) {
        if (g[i] === s[i]) {
            result[i] = "correct";
        } else {
            freq[s[i]] = (freq[s[i]] ?? 0) + 1;
        }
    }

    // Second pass: mark present using remaining frequencies
    for (let i = 0; i < g.length; i++) {
        if (result[i] === "correct") continue;
        const ch = g[i];
        const left = freq[ch] ?? 0;
        if (left > 0) {
            result[i] = "present";
            freq[ch] = left - 1;
        }
    }

    return { letters: splitGraphemes(guessRaw.normalize("NFC")), states: result };
}

export function isWin(result: EvaluationResult): boolean {
    return result.states.every((s) => s === "correct");
}


