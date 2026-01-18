"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cookie, X, Settings } from "lucide-react";

export function CookieConsent() {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState({
        necessary: true, // Always true, can't be disabled
        analytics: true,
        marketing: false,
    });

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        const consentData = {
            necessary: true,
            analytics: true,
            marketing: true,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem("cookieConsent", JSON.stringify(consentData));
        setIsVisible(false);
    };

    const handleAcceptSelected = () => {
        const consentData = {
            ...preferences,
            necessary: true,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem("cookieConsent", JSON.stringify(consentData));
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        const consentData = {
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem("cookieConsent", JSON.stringify(consentData));
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom-5 duration-500">
            <div className="mx-auto max-w-4xl">
                <div className="bg-white rounded-2xl shadow-2xl border border-[#e8e0d5] overflow-hidden">
                    {/* Main Banner */}
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#f9c784] to-[#e5a855] rounded-xl">
                                <Cookie className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-[#4a4a4a] mb-2">
                                    {t("🍪 Çerez Kullanımı", "🍪 Cookie Usage")}
                                </h3>
                                <p className="text-sm text-[#7a7a7a] leading-relaxed">
                                    {t(
                                        "Size daha iyi bir deneyim sunmak için çerezleri kullanıyoruz. Çerezler, siteyi nasıl kullandığınızı anlamamıza ve hizmetlerimizi geliştirmemize yardımcı olur.",
                                        "We use cookies to provide you with a better experience. Cookies help us understand how you use the site and improve our services."
                                    )}
                                    {" "}
                                    <Link href="/gizlilik" className="text-[#8fbc8f] hover:underline font-medium">
                                        {t("Gizlilik Politikası", "Privacy Policy")}
                                    </Link>
                                    {" "}ve{" "}
                                    <Link href="/cerez-politikasi" className="text-[#8fbc8f] hover:underline font-medium">
                                        {t("Çerez Politikası", "Cookie Policy")}
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        {showSettings && (
                            <div className="mt-6 p-4 bg-[#f5efe6] rounded-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-[#4a4a4a]">{t("Zorunlu Çerezler", "Necessary Cookies")}</span>
                                        <p className="text-xs text-[#9a9a9a]">{t("Site işlevselliği için gerekli", "Required for site functionality")}</p>
                                    </div>
                                    <div className="w-12 h-6 bg-[#8fbc8f] rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-[#4a4a4a]">{t("Analitik Çerezler", "Analytics Cookies")}</span>
                                        <p className="text-xs text-[#9a9a9a]">{t("Site kullanımını analiz etmek için", "To analyze site usage")}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${preferences.analytics ? "bg-[#8fbc8f] justify-end" : "bg-[#d4d4d4] justify-start"}`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-[#4a4a4a]">{t("Pazarlama Çerezleri", "Marketing Cookies")}</span>
                                        <p className="text-xs text-[#9a9a9a]">{t("Kişiselleştirilmiş reklamlar için", "For personalized ads")}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${preferences.marketing ? "bg-[#8fbc8f] justify-end" : "bg-[#d4d4d4] justify-start"}`}
                                    >
                                        <div className="w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                            <button
                                onClick={handleAcceptAll}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white font-semibold rounded-xl shadow-soft hover:opacity-90 transition"
                            >
                                {t("Tümünü Kabul Et", "Accept All")}
                            </button>
                            {showSettings ? (
                                <button
                                    onClick={handleAcceptSelected}
                                    className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-[#e8e0d5] text-[#6a6a6a] font-semibold rounded-xl hover:bg-[#f5efe6] transition"
                                >
                                    {t("Seçilenleri Kaydet", "Save Selected")}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-[#e8e0d5] text-[#6a6a6a] font-semibold rounded-xl hover:bg-[#f5efe6] transition flex items-center justify-center gap-2"
                                >
                                    <Settings className="w-4 h-4" />
                                    {t("Ayarlar", "Settings")}
                                </button>
                            )}
                            <button
                                onClick={handleRejectAll}
                                className="w-full sm:w-auto px-6 py-3 text-[#9a9a9a] hover:text-[#6a6a6a] font-medium transition"
                            >
                                {t("Sadece Zorunlu", "Only Necessary")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
