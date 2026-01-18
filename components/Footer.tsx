"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart, Mail, Github, Twitter, Coffee } from "lucide-react";

export function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="relative z-10 mt-auto border-t border-[#e8e0d5] bg-white/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-6 py-10">
                {/* Main Footer Content */}
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] rounded-xl flex items-center justify-center shadow-soft">
                                <span className="text-xl">🎯</span>
                            </div>
                            <span className="text-xl font-bold text-[#4a4a4a]">
                                {t("Günlük Kelime", "Daily Word")}
                            </span>
                        </div>
                        <p className="text-sm text-[#7a7a7a] leading-relaxed max-w-sm mb-4">
                            {t(
                                "Her gün yeni kelimeler keşfet, arkadaşlarınla yarış ve kelime hazineni geliştir. Türkçe ve İngilizce destekli günlük kelime oyunu.",
                                "Discover new words every day, compete with friends and expand your vocabulary. Daily word game with Turkish and English support."
                            )}
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                className="w-9 h-9 bg-[#f5efe6] hover:bg-[#e8e0d5] rounded-lg flex items-center justify-center transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4 text-[#6a6a6a]" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 bg-[#f5efe6] hover:bg-[#e8e0d5] rounded-lg flex items-center justify-center transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4 text-[#6a6a6a]" />
                            </a>
                            <a
                                href="mailto:info@gunlukkelime.com"
                                className="w-9 h-9 bg-[#f5efe6] hover:bg-[#e8e0d5] rounded-lg flex items-center justify-center transition-colors"
                                aria-label="Email"
                            >
                                <Mail className="w-4 h-4 text-[#6a6a6a]" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-[#4a4a4a] mb-4">{t("Oyun", "Game")}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/oyna?len=5" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    {t("Günlük Bulmaca", "Daily Puzzle")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/oyna/pratik" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    {t("Sınırsız Mod", "Unlimited Mode")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/multiplayer" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    Multiplayer
                                </Link>
                            </li>
                            <li>
                                <Link href="/leaderboard" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    {t("Sıralama", "Leaderboard")}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-bold text-[#4a4a4a] mb-4">{t("Yasal", "Legal")}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/gizlilik" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    {t("Gizlilik & KVKK", "Privacy & GDPR")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/cerez-politikasi" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    {t("Çerez Politikası", "Cookie Policy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/lisanslar" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    {t("Lisanslar", "Licenses")}
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:info@gunlukkelime.com" className="text-sm text-[#7a7a7a] hover:text-[#8fbc8f] transition-colors">
                                    {t("İletişim", "Contact")}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-[#e8e0d5] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[#9a9a9a]">
                        © {new Date().getFullYear()} {t("Günlük Kelime", "Daily Word")}. {t("Tüm hakları saklıdır.", "All rights reserved.")}
                    </p>
                    <p className="text-sm text-[#9a9a9a] flex items-center gap-1">
                        {t("Sevgiyle yapıldı", "Made with")} <Heart className="w-4 h-4 text-[#e8a0a0] fill-current" /> {t("Türkiye'de", "in Turkey")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
