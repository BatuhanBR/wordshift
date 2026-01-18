import { VALID_WORDS as VALID5 } from "@/lib/words/valid-list";

// Turkish word lists
let TR4: readonly string[] | undefined;
let TR5: readonly string[] | undefined;
let TR6: readonly string[] | undefined;
let TR7: readonly string[] | undefined;

try { TR4 = require("@/lib/words/tr-4").TR_4; } catch { }
try { TR5 = require("@/lib/words/tr-5").TR_5; } catch { }
try { TR6 = require("@/lib/words/tr-6").TR_6; } catch { }
try { TR7 = require("@/lib/words/tr-7").TR_7; } catch { }

// English word lists
let EN4: readonly string[] | undefined;
let EN5: readonly string[] | undefined;
let EN6: readonly string[] | undefined;
let EN7: readonly string[] | undefined;

try { EN4 = require("@/lib/words/en-4").EN_4; } catch { }
try { EN5 = require("@/lib/words/en-5").EN_5; } catch { }
try { EN6 = require("@/lib/words/en-6").EN_6; } catch { }
try { EN7 = require("@/lib/words/en-7").EN_7; } catch { }

// Fallback küçük örnekler; 5 harf listesi mevcut valid-list
export const VALID_TR_4: readonly string[] = (TR4 && TR4.length ? TR4 : ["açık", "kuzu", "şaka", "gibi", "yurt"]);
export const VALID_TR_5: readonly string[] = (TR5 && TR5.length ? TR5 : VALID5);
export const VALID_TR_6: readonly string[] = (TR6 && TR6.length ? TR6 : ["bahçem", "göster", "köprüc", "ışılda"]);
export const VALID_TR_7: readonly string[] = (TR7 && TR7.length ? TR7 : ["şehirli", "özgürlü"]);

// English word lists with fallbacks
export const VALID_EN_4: readonly string[] = (EN4 && EN4.length ? EN4 : ["word", "game", "play", "test"]);
export const VALID_EN_5: readonly string[] = (EN5 && EN5.length ? EN5 : ["words", "games", "plays", "tests"]);
export const VALID_EN_6: readonly string[] = (EN6 && EN6.length ? EN6 : ["player", "winner", "loser"]);
export const VALID_EN_7: readonly string[] = (EN7 && EN7.length ? EN7 : ["players", "winners"]);

export function getValidListByLength(len: number): readonly string[] {
    switch (len) {
        case 4: return VALID_TR_4;
        case 5: return VALID_TR_5;
        case 6: return VALID_TR_6;
        case 7: return VALID_TR_7;
        default: return VALID_TR_5;
    }
}

export function getEnglishListByLength(len: number): readonly string[] {
    switch (len) {
        case 4: return VALID_EN_4;
        case 5: return VALID_EN_5;
        case 6: return VALID_EN_6;
        case 7: return VALID_EN_7;
        default: return VALID_EN_5;
    }
}
