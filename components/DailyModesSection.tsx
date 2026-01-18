"use client";

import { useEffect, useState, useCallback } from "react";
import { DailyModeCard } from "./DailyModeCard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MODES = [
    { len: 4, gradient: "from-[#a8d5a2] to-[#7bc275]" },
    { len: 5, gradient: "from-[#f9c784] to-[#e5a855]" },
    { len: 6, gradient: "from-[#c4b5e0] to-[#9d8bc7]" },
    { len: 7, gradient: "from-[#a7c7e7] to-[#7ba7d1]" },
];

export function DailyModesSection() {
    const [solvedCounts, setSolvedCounts] = useState<Record<number, number>>({});

    const fetchStats = useCallback(async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const statsRef = doc(db, "stats", "daily");
            const statsSnap = await getDoc(statsRef);

            if (statsSnap.exists()) {
                const data = statsSnap.data();
                const counts: Record<number, number> = {};
                MODES.forEach(({ len }) => {
                    counts[len] = data[`${todayStr}_${len}`] || 0;
                });
                setSolvedCounts(counts);
            }
        } catch (error) {
            console.error("Error fetching daily stats:", error);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchStats();

        // Poll every 30 seconds for updates
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, [fetchStats]);

    return (
        <section id="modlar" className="grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {MODES.map(({ len, gradient }) => (
                <DailyModeCard
                    key={len}
                    len={len}
                    gradient={gradient}
                    totalSolved={solvedCounts[len] || 0}
                />
            ))}
        </section>
    );
}
