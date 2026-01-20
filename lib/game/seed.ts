// Basit ve hızlı bir Pseudo-Random Number Generator (Mulberry32)
function mulberry32(a: number) {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export function getUtcDayIndex(date = new Date()): number {
    // Days since Unix epoch in UTC
    return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
}

export function pickByDay<T>(list: readonly T[], dayIndex: number): T {
    if (list.length === 0) throw new Error("List is empty");

    // Seed olarak günün indeksini kullanıyoruz + sabit bir salt
    const seed = dayIndex + 12345;
    const random = mulberry32(seed);

    // 0 ile 1 arasında deterministik bir sayı üretip liste uzunluğuyla çarpıyoruz
    const idx = Math.floor(random() * list.length);

    return list[idx];
}


