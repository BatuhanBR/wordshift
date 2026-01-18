import { getValidListByLength, getEnglishListByLength } from "@/lib/words";
import https from "https";

type Language = "tr" | "en";
type CacheEntry = { words: string[]; ts: number };

// Uzak kaynak artık kullanılmıyor, sadece yerel sözlük
const REMOTE_SOURCES: Record<number, string[]> = {
    4: [],
    5: [],
    6: [],
    7: [],
};

const TR_CACHE: Map<number, CacheEntry> = new Map();
const EN_CACHE: Map<number, CacheEntry> = new Map();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

function toLowerTr(s: string) {
    return s.toLocaleLowerCase("tr").normalize("NFC");
}

function isTrWord(s: string) {
    return /^[a-zçğıöşü]+$/u.test(s);
}

function isEnWord(s: string) {
    return /^[a-z]+$/u.test(s);
}

function splitLen(s: string) {
    return Array.from(s).length;
}

function fetchText(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                "user-agent": "turkce-wordle/1.0"
            }
        }, (res) => {
            if ((res.statusCode ?? 0) >= 400) {
                reject(new Error(`HTTP ${res.statusCode} ${url}`));
                return;
            }
            let data = "";
            res.setEncoding("utf8");
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
        });
        req.on("error", reject);
        req.end();
    });
}

async function fetchRemoteList(len: number): Promise<string[]> {
    const urls = REMOTE_SOURCES[len] || [];
    let corpus: string[] = [];
    for (const u of urls) {
        try {
            const txt = await fetchText(u);
            const items = txt
                .split(/\r?\n/)
                .map((x) => toLowerTr(x.trim()))
                .filter((x) => x.length > 0 && isTrWord(x) && splitLen(x) === len);
            corpus = corpus.concat(items);
        } catch { }
    }
    if (corpus.length === 0) return [];
    const uniq = Array.from(new Set(corpus));
    return uniq.sort((a, b) => a.localeCompare(b, "tr"));
}

/**
 * Get words for a specific length and language
 * @param len Word length (4, 5, 6, or 7)
 * @param lang Language ("tr" for Turkish, "en" for English)
 */
export async function getWordsForLength(len: number, lang: Language = "tr"): Promise<readonly string[]> {
    const now = Date.now();
    const cache = lang === "en" ? EN_CACHE : TR_CACHE;
    const c = cache.get(len);
    if (c && now - c.ts < TTL_MS) return c.words;

    let words: string[];

    if (lang === "en") {
        // English words - directly from local list
        words = [...getEnglishListByLength(len)];
    } else {
        // Turkish words - try remote first, then local fallback
        const remote = await fetchRemoteList(len);
        words = remote.length > 0 ? remote : [...getValidListByLength(len)];
    }

    cache.set(len, { words, ts: now });
    return words;
}
