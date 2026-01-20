import { NextResponse } from "next/server";
import { getWordsForLength } from "@/lib/words/provider";
import { getUtcDayIndex, pickByDay } from "@/lib/game/seed";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const len = Number(url.searchParams.get("len")) || 5;
    const mode = (url.searchParams.get("mode") || "daily").toLowerCase();
    const lang = (url.searchParams.get("lang") || "tr").toLowerCase() as "tr" | "en";
    const day = getUtcDayIndex();

    // Get words for the specified length and language
    const base = await getWordsForLength(len, lang);

    if (mode === "practice") {
        const idx = Math.floor(Math.random() * base.length);
        const word = base[idx];
        return NextResponse.json({ word, index: idx, len, mode, lang });
    }

    // Use seeded random picker
    const word = pickByDay(base, day);
    // Reverse find index just for info (optional)
    const idx = base.indexOf(word);

    return NextResponse.json({ word, index: idx, day, len, mode: "daily", lang });
}
