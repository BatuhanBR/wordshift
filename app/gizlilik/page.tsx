"use client";

import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, FileText, User, Database, Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    const { t, language } = useLanguage();

    const lastUpdated = "17 Ocak 2026";

    return (
        <div className="min-h-screen relative overflow-hidden text-[#4a4a4a] cozy-pattern">
            <Navbar />

            <main className="relative z-10 max-w-4xl mx-auto py-12 px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] rounded-2xl shadow-soft mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#4a4a4a] mb-2">
                        {t("Gizlilik Politikası ve KVKK", "Privacy Policy & GDPR")}
                    </h1>
                    <p className="text-[#9a9a9a]">
                        {t(`Son güncelleme: ${lastUpdated}`, `Last updated: January 17, 2026`)}
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                    {/* Section 1 */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#c4b5e0]/20 rounded-lg">
                                <User className="w-5 h-5 text-[#9d8bc7]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">
                                {t("1. Veri Sorumlusu", "1. Data Controller")}
                            </h2>
                        </div>
                        <p className="text-[#6a6a6a] leading-relaxed">
                            {t(
                                "Günlük Kelime (bundan sonra \"Biz\" veya \"Platform\" olarak anılacaktır) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz.",
                                "Daily Word (hereinafter referred to as \"We\" or \"Platform\") processes your personal data as a data controller under applicable data protection laws including GDPR."
                            )}
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#a7c7e7]/20 rounded-lg">
                                <Database className="w-5 h-5 text-[#7ba7d1]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">
                                {t("2. Toplanan Veriler", "2. Data We Collect")}
                            </h2>
                        </div>
                        <div className="space-y-4 text-[#6a6a6a]">
                            <p className="font-medium text-[#4a4a4a]">{t("Aşağıdaki kişisel verilerinizi topluyoruz:", "We collect the following personal data:")}</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li><strong>{t("Kimlik Bilgileri:", "Identity Information:")}</strong> {t("Kullanıcı adı, e-posta adresi", "Username, email address")}</li>
                                <li><strong>{t("İletişim Bilgileri:", "Contact Information:")}</strong> {t("E-posta adresi", "Email address")}</li>
                                <li><strong>{t("Oyun Verileri:", "Game Data:")}</strong> {t("Oyun skorları, istatistikler, başarılar, ELO puanı", "Game scores, statistics, achievements, ELO rating")}</li>
                                <li><strong>{t("Teknik Veriler:", "Technical Data:")}</strong> {t("IP adresi, cihaz bilgileri, tarayıcı türü, oturum bilgileri", "IP address, device info, browser type, session data")}</li>
                                <li><strong>{t("Kullanım Verileri:", "Usage Data:")}</strong> {t("Site kullanım süresi, tıklama verileri, tercihler", "Time spent on site, click data, preferences")}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#f9c784]/20 rounded-lg">
                                <FileText className="w-5 h-5 text-[#e5a855]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">
                                {t("3. Veri İşleme Amaçları", "3. Purposes of Data Processing")}
                            </h2>
                        </div>
                        <div className="space-y-4 text-[#6a6a6a]">
                            <p>{t("Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:", "Your personal data is processed for the following purposes:")}</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>{t("Üyelik işlemlerinin gerçekleştirilmesi ve hesap yönetimi", "Account registration and management")}</li>
                                <li>{t("Oyun hizmetlerinin sunulması ve deneyimin kişiselleştirilmesi", "Providing game services and personalizing experience")}</li>
                                <li>{t("Liderlik tablosu ve rekabet özelliklerinin işletilmesi", "Operating leaderboards and competitive features")}</li>
                                <li>{t("İstatistik ve analiz çalışmaları yapılması", "Conducting statistical and analytical studies")}</li>
                                <li>{t("Yasal yükümlülüklerin yerine getirilmesi", "Fulfilling legal obligations")}</li>
                                <li>{t("Platform güvenliğinin sağlanması", "Ensuring platform security")}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 - KVKK Rights */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#8fbc8f]/20 rounded-lg">
                                <Lock className="w-5 h-5 text-[#6a9a6a]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">
                                {t("4. KVKK Kapsamındaki Haklarınız", "4. Your Rights")}
                            </h2>
                        </div>
                        <div className="space-y-4 text-[#6a6a6a]">
                            <p>{t("KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:", "Under data protection laws, you have the following rights:")}</p>
                            <ul className="list-disc list-inside space-y-2 ml-2">
                                <li>{t("Kişisel verilerinizin işlenip işlenmediğini öğrenme", "To learn whether your personal data is being processed")}</li>
                                <li>{t("İşlenmişse bilgi talep etme", "To request information if processed")}</li>
                                <li>{t("İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme", "To learn the purpose of processing")}</li>
                                <li>{t("Yurt içinde/dışında aktarıldığı üçüncü kişileri öğrenme", "To know third parties to whom data is transferred")}</li>
                                <li>{t("Eksik/yanlış işlenmişse düzeltilmesini isteme", "To request correction of incomplete/inaccurate data")}</li>
                                <li>{t("Silinmesini veya yok edilmesini isteme", "To request deletion or destruction")}</li>
                                <li>{t("Düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme", "To request notification of corrections to third parties")}</li>
                                <li>{t("İşlenen verilerin analiz edilmesi sonucu aleyhinize bir sonucun çıkmasına itiraz etme", "To object to automated decision-making")}</li>
                                <li>{t("Kanuna aykırı işlenmesinden kaynaklanan zararın giderilmesini isteme", "To claim compensation for damages due to unlawful processing")}</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 5 - Data Retention */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#e8a0a0]/20 rounded-lg">
                                <Database className="w-5 h-5 text-[#d88080]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">
                                {t("5. Veri Saklama Süresi", "5. Data Retention")}
                            </h2>
                        </div>
                        <p className="text-[#6a6a6a] leading-relaxed">
                            {t(
                                "Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca ve yasal saklama yükümlülüklerimiz kapsamında saklanmaktadır. Hesabınızı sildiğinizde, kişisel verileriniz yasal yükümlülükler saklı kalmak kaydıyla 30 gün içinde silinecektir.",
                                "Your personal data is retained for as long as necessary for the purposes of processing and in accordance with our legal retention obligations. When you delete your account, your personal data will be deleted within 30 days, subject to legal obligations."
                            )}
                        </p>
                    </section>

                    {/* Section 6 - Contact */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[#c4b5e0]/20 rounded-lg">
                                <Mail className="w-5 h-5 text-[#9d8bc7]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">
                                {t("6. İletişim", "6. Contact")}
                            </h2>
                        </div>
                        <p className="text-[#6a6a6a] leading-relaxed">
                            {t(
                                "KVKK kapsamındaki taleplerinizi ve sorularınızı aşağıdaki e-posta adresine iletebilirsiniz:",
                                "You can send your requests and questions regarding data protection to the following email address:"
                            )}
                        </p>
                        <p className="mt-2">
                            <a href="mailto:privacy@gunlukkelime.com" className="text-[#8fbc8f] font-semibold hover:underline">
                                privacy@gunlukkelime.com
                            </a>
                        </p>
                    </section>

                    {/* Link to Cookie Policy */}
                    <div className="text-center pt-4">
                        <Link href="/cerez-politikasi" className="inline-flex items-center gap-2 text-[#8fbc8f] hover:underline font-medium">
                            {t("Çerez Politikamızı da inceleyebilirsiniz →", "You can also view our Cookie Policy →")}
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
