"use client";

import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Cookie, CheckCircle, BarChart2, Megaphone, Settings } from "lucide-react";
import Link from "next/link";

export default function CookiePolicyPage() {
    const { t } = useLanguage();

    const handleResetCookieConsent = () => {
        localStorage.removeItem("cookieConsent");
        window.location.reload();
    };

    return (
        <div className="min-h-screen relative overflow-hidden text-[#4a4a4a] cozy-pattern">
            <Navbar />

            <main className="relative z-10 max-w-4xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#f9c784] to-[#e5a855] rounded-2xl shadow-soft mb-4">
                        <Cookie className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#4a4a4a] mb-2">
                        {t("Çerez Politikası", "Cookie Policy")}
                    </h1>
                    <p className="text-[#9a9a9a]">
                        {t("Çerezleri nasıl kullandığımız hakkında bilgi", "Information about how we use cookies")}
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {/* What are cookies */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <h2 className="text-xl font-bold text-[#4a4a4a] mb-4">
                            {t("Çerez Nedir?", "What Are Cookies?")}
                        </h2>
                        <p className="text-[#6a6a6a] leading-relaxed">
                            {t(
                                "Çerezler, web siteleri tarafından cihazınıza yerleştirilen küçük metin dosyalarıdır. Siteyi ziyaret ettiğinizde, çerezler tarayıcınız tarafından saklanır ve bir sonraki ziyaretinizde sizi tanımamıza yardımcı olur.",
                                "Cookies are small text files placed on your device by websites. When you visit the site, cookies are stored by your browser and help us recognize you on your next visit."
                            )}
                        </p>
                    </section>

                    {/* Cookie Types */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <h2 className="text-xl font-bold text-[#4a4a4a] mb-6">
                            {t("Kullandığımız Çerez Türleri", "Types of Cookies We Use")}
                        </h2>

                        <div className="space-y-6">
                            {/* Necessary Cookies */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 p-3 bg-[#8fbc8f]/20 rounded-xl h-fit">
                                    <CheckCircle className="w-6 h-6 text-[#6a9a6a]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#4a4a4a] mb-1">
                                        {t("Zorunlu Çerezler", "Necessary Cookies")}
                                    </h3>
                                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                                        {t(
                                            "Sitenin düzgün çalışması için gerekli olan çerezlerdir. Oturum bilgilerinizi, dil tercihinizi ve güvenlik ayarlarınızı saklar. Bu çerezler devre dışı bırakılamaz.",
                                            "These cookies are essential for the website to function properly. They store your session information, language preference, and security settings. These cookies cannot be disabled."
                                        )}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-[#f5efe6] text-xs rounded-lg text-[#6a6a6a]">cookieConsent</span>
                                        <span className="px-2 py-1 bg-[#f5efe6] text-xs rounded-lg text-[#6a6a6a]">firebaseAuth</span>
                                        <span className="px-2 py-1 bg-[#f5efe6] text-xs rounded-lg text-[#6a6a6a]">language</span>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 p-3 bg-[#a7c7e7]/20 rounded-xl h-fit">
                                    <BarChart2 className="w-6 h-6 text-[#7ba7d1]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#4a4a4a] mb-1">
                                        {t("Analitik Çerezler", "Analytics Cookies")}
                                    </h3>
                                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                                        {t(
                                            "Sitemizi nasıl kullandığınızı anlamamıza yardımcı olan çerezlerdir. Ziyaretçi sayısı, sayfa görüntüleme, trafik kaynakları gibi istatistiksel verileri toplar. Bu veriler anonimleştirilmiştir.",
                                            "These cookies help us understand how you use our site. They collect statistical data such as visitor numbers, page views, and traffic sources. This data is anonymized."
                                        )}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-[#f5efe6] text-xs rounded-lg text-[#6a6a6a]">_ga (Google Analytics)</span>
                                        <span className="px-2 py-1 bg-[#f5efe6] text-xs rounded-lg text-[#6a6a6a]">_gid</span>
                                    </div>
                                </div>
                            </div>

                            {/* Marketing Cookies */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 p-3 bg-[#f9c784]/20 rounded-xl h-fit">
                                    <Megaphone className="w-6 h-6 text-[#e5a855]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#4a4a4a] mb-1">
                                        {t("Pazarlama Çerezleri", "Marketing Cookies")}
                                    </h3>
                                    <p className="text-sm text-[#6a6a6a] leading-relaxed">
                                        {t(
                                            "Size ilgi alanlarınıza göre kişiselleştirilmiş reklamlar göstermek için kullanılan çerezlerdir. Üçüncü taraf reklam ağları tarafından yerleştirilir.",
                                            "These cookies are used to show you personalized ads based on your interests. They are placed by third-party advertising networks."
                                        )}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-[#f5efe6] text-xs rounded-lg text-[#6a6a6a]">_fbp (Facebook)</span>
                                        <span className="px-2 py-1 bg-[#f5efe6] text-xs rounded-lg text-[#6a6a6a]">ads_prefs</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Managing Cookies */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#c4b5e0]/20 rounded-lg">
                                <Settings className="w-5 h-5 text-[#9d8bc7]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">
                                {t("Çerez Tercihlerinizi Yönetin", "Manage Your Cookie Preferences")}
                            </h2>
                        </div>
                        <p className="text-[#6a6a6a] leading-relaxed mb-4">
                            {t(
                                "Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Aşağıdaki butona tıklayarak çerez ayarları penceresini tekrar açabilirsiniz.",
                                "You can change your cookie preferences at any time. Click the button below to reopen the cookie settings window."
                            )}
                        </p>
                        <button
                            onClick={handleResetCookieConsent}
                            className="px-6 py-3 bg-gradient-to-r from-[#c4b5e0] to-[#9d8bc7] text-white font-semibold rounded-xl shadow-soft hover:opacity-90 transition"
                        >
                            {t("Çerez Ayarlarını Aç", "Open Cookie Settings")}
                        </button>
                    </section>

                    {/* Browser Settings */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <h2 className="text-xl font-bold text-[#4a4a4a] mb-4">
                            {t("Tarayıcı Ayarları", "Browser Settings")}
                        </h2>
                        <p className="text-[#6a6a6a] leading-relaxed">
                            {t(
                                "Çoğu web tarayıcısı, çerezleri kabul etme veya reddetme seçeneği sunar. Tarayıcınızın ayarlarından çerezleri yönetebilir, silebilir veya engelleyebilirsiniz. Ancak, çerezleri tamamen devre dışı bırakmanız durumunda bazı site özellikleri düzgün çalışmayabilir.",
                                "Most web browsers offer the option to accept or reject cookies. You can manage, delete, or block cookies through your browser settings. However, if you completely disable cookies, some site features may not work properly."
                            )}
                        </p>
                    </section>

                    {/* Link to Privacy Policy */}
                    <div className="text-center pt-4">
                        <Link href="/gizlilik" className="inline-flex items-center gap-2 text-[#8fbc8f] hover:underline font-medium">
                            {t("Gizlilik Politikamızı da inceleyebilirsiniz →", "You can also view our Privacy Policy →")}
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
