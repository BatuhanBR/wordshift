/*
  Apache-2.0 uyumlu TR kelime listesi toplayıcı
  - Kaynak URL’leri buraya eklenecek (Apache-2.0 lisanslı)
  - Filtreler: sadece Türkçe harfler, küçük harf, NFC, 4-7 harf arası
  - Çıktılar: lib/words/tr-4.ts, tr-5.ts, tr-6.ts, tr-7.ts
*/

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "lib", "words");

// Kelimetre.com sitesinden farklı uzunluktaki kelimeleri çekeceğiz
const KELIMETRE_URLS: Record<number, string> = {
  4: "https://www.kelimetre.com/4-harfli-kelimeler",
  5: "https://www.kelimetre.com/5-harfli-kelimeler", 
  6: "https://www.kelimetre.com/6-harfli-kelimeler",
  7: "https://www.kelimetre.com/7-harfli-kelimeler"
};

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

function toLowerTr(s: string) {
  return s.toLocaleLowerCase("tr").normalize("NFC");
}

function isTurkishWord(s: string) {
  // Türkçe harfler: a-z + ç,ğ,ı,ö,ş,ü (büyük-küçük)
  return /^[a-zçğıöşüA-ZÇĞIİÖŞÜ]+$/u.test(s);
}

function splitLen(s: string) {
  return Array.from(s).length;
}

async function fetchKelimetreWords(len: number): Promise<string[]> {
  const indexUrl = KELIMETRE_URLS[len];
  if (!indexUrl) return [];

  try {
    console.log(`fetching index ${indexUrl}`);
    const html = await fetchText(indexUrl);
    const $ = cheerio.load(html);

    // 1) Index sayfasından doğrudan görünen kelimeleri topla (olursa)
    const initialWords = extractWordsFromHtml(len, $);

    // 2) Harf bazlı alt sayfaları üret
    const letters = [
      "a","b","c","ç","d","e","f","g","ğ","h","ı","i","j","k","l","m","n","o","ö","p","r","s","ş","t","u","ü","v","y","z"
    ];
    const base = `https://www.kelimetre.com/${len}-harfli-`;
    const suffix = "-ile-baslayan-kelimeler";
    const pages = letters.map((ch) => `${base}${encodeURIComponent(ch)}${suffix}`);

    console.log(`crawl ${pages.length} letter pages for len=${len}`);

    // 3) Alt sayfaları paralel çek
    const chunks: string[][] = await Promise.all(
      pages.map(async (p) => {
        try {
          const h = await fetchText(p);
          const pw = extractWordsFromHtml(len, cheerio.load(h));
          return pw;
        } catch (e) {
          console.warn(`warn page ${p}: ${String(e)}`);
          return [];
        }
      })
    );

    const all = new Set<string>();
    initialWords.forEach((w) => all.add(w));
    chunks.flat().forEach((w) => all.add(w));

    const words = Array.from(all).sort((a, b) => a.localeCompare(b, "tr"));
    console.log(`collected ${words.length} words for len=${len}`);
    return words;
  } catch (e) {
    console.warn(`warn: ${String(e)}`);
    return [];
  }
}

async function detectTamSozlukPages(baseUrl: string): Promise<number> {
  try {
    const html = await fetchText(baseUrl);
    const $ = cheerio.load(html);
    // Sayfa bilgisini metinden yakala: "1 / 284" benzeri
    const bodyText = $.text();
    const m = bodyText.match(/\b(\d+)\s*\/\s*(\d+)\b/);
    if (m) {
      const total = parseInt(m[2], 10);
      if (!Number.isNaN(total) && total > 1) return total;
    }
    // Yedek: pagination linklerinden en büyük sayıyı bul
    let max = 1;
    $('a[href*="page="]').each((_, el) => {
      const href = String($(el).attr('href') || '');
      const mm = href.match(/page=(\d+)/);
      if (mm) {
        const n = parseInt(mm[1], 10);
        if (!Number.isNaN(n)) max = Math.max(max, n);
      }
    });
    return Math.max(max, 1);
  } catch {
    return 1;
  }
}

async function fetchTamSozlukLen(len: number): Promise<string[]> {
  const base = `https://tamsozluk.com/k/T%C3%BCrk%C3%A7edeki-${len}-Harfli-Kelimeler`;
  const pages = await detectTamSozlukPages(base);
  const all = new Set<string>();

  for (let p = 1; p <= pages; p++) {
    const url = p === 1 ? base : `${base}?page=${p}`;
    try {
      const html = await fetchText(url);
      const $ = cheerio.load(html);
      // Kelimeler tırnak içinde listelenmiş
      const quoted = html.match(/"([A-Za-zÇĞIİÖŞÜçğıöşü]+)"/gu) || [];
      quoted
        .map((m) => m.replace(/"/g, ""))
        .map((w) => toLowerTr(w.trim()))
        .filter((w) => isTurkishWord(w) && splitLen(w) === len)
        .forEach((w) => all.add(w));

      // Ek: metin bloklarından ayrıştır
      const text = toLowerTr($("body").text());
      text
        .split(/[^a-zçğıöşüA-ZÇĞIİÖŞÜ]+/u)
        .map((w) => w.trim())
        .filter((w) => w.length > 0 && isTurkishWord(w) && splitLen(w) === len)
        .forEach((w) => all.add(w));

      console.log(`tamsozluk len=${len} page ${p}/${pages} -> total ${all.size}`);
    } catch (e) {
      console.warn(`warn tamsozluk len=${len} page ${p}: ${String(e)}`);
    }
  }

  const words = Array.from(all).sort((a, b) => a.localeCompare(b, "tr"));
  console.log(`tamsozluk collected ${words.length} words for len=${len}`);
  return words;
}

function extractWordsFromHtml(len: number, $: cheerio.CheerioAPI): string[] {
  const out = new Set<string>();

  // 1) strong içindeki bloklar
  $('strong').each((_, el) => {
    const t = toLowerTr($(el).text().trim());
    if (isTurkishWord(t) && splitLen(t) === len) out.add(t);
  });

  // 2) list item'lar
  $('li').each((_, el) => {
    const t = toLowerTr($(el).text().trim());
    if (isTurkishWord(t) && splitLen(t) === len) out.add(t);
  });

  // 3) tablo/hücre olasılığı
  $('td, .entry-content p, .entry-content div').each((_, el) => {
    const raw = toLowerTr($(el).text());
    raw
      .split(/[^a-zçğıöşüA-ZÇĞIİÖŞÜ]+/u)
      .map((x) => x.trim())
      .filter((x) => x.length > 0 && isTurkishWord(x) && splitLen(x) === len)
      .forEach((x) => out.add(x));
  });

  return Array.from(out);
}

function emitModule(name: string, words: string[]) {
  const file = path.join(OUT_DIR, name);
  const unique = Array.from(new Set(words)).sort((a, b) => a.localeCompare(b, "tr"));
  const constName = path
    .basename(name, ".ts")
    .toUpperCase()
    .replace(/-/g, "_"); // e.g., tr-5 -> TR_5 (geçerli TS değişkeni)
  const content = `export const ${constName}: readonly string[] = [\n${unique
    .map((w) => `  "${w}"`)
    .join(",\n")}\n];\n`;
  fs.writeFileSync(file, content, "utf8");
  console.log(`wrote ${file} (${unique.length} words)`);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  // 4/5/6/7: TamSözlük
  const w4 = await fetchTamSozlukLen(4);
  const w5 = await fetchTamSozlukLen(5);
  const w6 = await fetchTamSozlukLen(6);
  const w7 = await fetchTamSozlukLen(7);

  emitModule("tr-4.ts", w4);
  emitModule("tr-5.ts", w5);
  emitModule("tr-6.ts", w6);
  emitModule("tr-7.ts", w7);

  console.log("done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


