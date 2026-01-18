export function getUtcDayIndex(date = new Date()): number {
    // Days since Unix epoch in UTC
    return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
}

export function pickByDay<T>(list: readonly T[], dayIndex: number): T {
    if (list.length === 0) throw new Error("List is empty");
    const idx = ((dayIndex % list.length) + list.length) % list.length;
    return list[idx];
}


