import { NextResponse } from "next/server";
import { sanitizeGuess, splitGraphemes } from "@/lib/utils/tr-normalize";
import { getWordsForLength } from "@/lib/words/provider";

export async function POST(request: Request) {
    try {
        const { word, len, lang = "tr" } = await request.json();
        const w = sanitizeGuess(String(word ?? ""));
        const L = Number(len) || splitGraphemes(w).length;
        const language = (lang as string).toLowerCase() === "en" ? "en" : "tr";

        // Language-specific character validation
        if (language === "tr") {
            const isTurkish = /^[a-zçğıöşü]+$/u.test(w);
            if (!isTurkish) return NextResponse.json({ ok: false, reason: "non_turkish" }, { status: 200 });
        } else {
            const isEnglish = /^[a-z]+$/u.test(w);
            if (!isEnglish) return NextResponse.json({ ok: false, reason: "non_english" }, { status: 200 });
        }

        const list = await getWordsForLength(L, language);
        if (list.length === 0) {
            // Dictionary not ready
            return NextResponse.json({ ok: false, reason: "list_unavailable" }, { status: 200 });
        }
        const ok = list.includes(w);
        return NextResponse.json({ ok, reason: ok ? undefined : "not_in_dict" });
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }
}
