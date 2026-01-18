"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { HomeLeaderboard } from "@/components/HomeLeaderboard";
import { DailyModesSection } from "@/components/DailyModesSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Globe, Smartphone, Swords } from "lucide-react";

export default function HomeClient() {
    const { t, language } = useLanguage();

    const features = language === "en" ? [
        {
            t: "English Support",
            d: "Full English word lists with QWERTY keyboard.",
            icon: <Globe className="h-6 w-6 text-white" />,
            gradient: "from-[#8fbc8f] to-[#6a9a6a]"
        },
        {
            t: "Smooth Animations",
            d: "Flip, reveal animations and smooth transitions.",
            icon: <Sparkles className="h-6 w-6 text-white" />,
            gradient: "from-[#f9c784] to-[#e5a855]"
        },
        {
            t: "PWA Ready",
            d: "Add to home screen, offline play, fast loading (soon).",
            icon: <Smartphone className="h-6 w-6 text-white" />,
            gradient: "from-[#a7c7e7] to-[#7ba7d1]"
        }
    ] : [
        {
            t: "Türkçe Desteği",
            d: "ç, ğ, ı, İ, ö, ş, ü harfleri ve TR klavye uyumu.",
            icon: <Globe className="h-6 w-6 text-white" />,
            gradient: "from-[#8fbc8f] to-[#6a9a6a]"
        },
        {
            t: "Akıcı Animasyonlar",
            d: "Flip, sırayla açılma ve yakında paylaşım karosu animasyonları.",
            icon: <Sparkles className="h-6 w-6 text-white" />,
            gradient: "from-[#f9c784] to-[#e5a855]"
        },
        {
            t: "PWA Hazırlığı",
            d: "Ana ekrana ekle, offline çalışma ve hızlı açılış (yakında).",
            icon: <Smartphone className="h-6 w-6 text-white" />,
            gradient: "from-[#a7c7e7] to-[#7ba7d1]"
        }
    ];

    return (
        <div className="relative min-h-screen overflow-hidden text-[#4a4a4a] cozy-pattern">

            <Navbar />

            <main className="relative z-10 mx-auto w-full max-w-6xl px-6">
                {/* Hero */}
                <section className="flex flex-col items-center gap-8 py-16 text-center md:py-24">
                    <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl text-[#4a4a4a]">
                        {language === "en" ? (
                            <>English Wordle experience, <span className="text-[#8fbc8f]">modern</span> and <span className="text-[#c4b5e0]">smooth</span> animations</>
                        ) : (
                            <>Türkçe Wordle deneyimi, <span className="text-[#8fbc8f]">modern</span> ve <span className="text-[#c4b5e0]">pürüzsüz</span> animasyonlarla</>
                        )}
                    </h1>
                    <p className="max-w-2xl text-lg text-[#7a7a7a] md:text-xl">
                        {t("Her gün yeni bir kelime. Rakiplerle yarış, ELO kazan!", "A new word every day. Compete with rivals, earn ELO!")}
                    </p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row">
                        <Link href="/oyna?len=5">
                            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white font-semibold shadow-soft hover:opacity-90 transition">
                                🎮 {t("Tek Kişilik", "Single Player")}
                            </button>
                        </Link>
                        <Link href="/multiplayer">
                            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#f9c784] to-[#e5a855] text-white font-semibold shadow-soft hover:opacity-90 transition flex items-center gap-2">
                                <Swords className="h-4 w-4" />
                                Multiplayer
                            </button>
                        </Link>
                        <a href="#modlar">
                            <button className="px-6 py-3 rounded-full bg-white border-2 border-[#e8e0d5] text-[#6a6a6a] font-semibold shadow-soft hover:bg-[#f5efe6] transition">
                                {t("Modları Gör", "View Modes")}
                            </button>
                        </a>
                    </div>
                </section>

                {/* Modlar */}
                <DailyModesSection />

                {/* Leaderboard */}
                <section className="py-8">
                    <HomeLeaderboard />
                </section>

                {/* Özellikler */}
                <section id="ozellikler" className="grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f, i) => (
                        <div key={i} className="rounded-2xl bg-white border border-[#e8e0d5] p-6 shadow-soft hover:shadow-soft-lg transition-all duration-300">
                            <div className={`mb-4 h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} shadow-soft flex items-center justify-center`}>
                                {f.icon}
                            </div>
                            <div className={`mb-2 text-lg font-bold text-[#4a4a4a]`}>{f.t}</div>
                            <div className="text-[#7a7a7a] text-sm leading-relaxed">{f.d}</div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
