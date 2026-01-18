export function toLowerTr(input: string): string {
    return input.toLocaleLowerCase("tr");
}

export function toUpperTr(input: string): string {
    return input.toLocaleUpperCase("tr");
}

export function normalizeForComparison(input: string): string {
    // Turkish-specific case folding. Do NOT strip diacritics; they are distinct letters in Turkish.
    return toLowerTr(input).normalize("NFC");
}

export function splitGraphemes(word: string): string[] {
    // Keep it simple: Turkish letters are single code points; NFC normalization suffices.
    return Array.from(word.normalize("NFC"));
}

export function isFiveLetterTr(word: string): boolean {
    return splitGraphemes(word).length === 5;
}

export function sanitizeGuess(raw: string): string {
    return normalizeForComparison(raw.trim());
}


