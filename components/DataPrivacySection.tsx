"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Download, Trash2, AlertTriangle, Loader2, Shield } from "lucide-react";

export function DataPrivacySection() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleExportData = async () => {
        if (!user) return;

        setIsExporting(true);
        setError(null);

        try {
            const token = await user.getIdToken();
            const response = await fetch("/api/user/data", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to export data");
            }

            const data = await response.json();

            // Download as JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `gunluk-kelime-verilerim-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export error:", err);
            setError(t("Veriler dışa aktarılamadı. Lütfen tekrar deneyin.", "Failed to export data. Please try again."));
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!user || deleteConfirmText !== t("SİL", "DELETE")) return;

        setIsDeleting(true);
        setError(null);

        try {
            const token = await user.getIdToken();
            const response = await fetch("/api/user/data", {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete account");
            }

            // Logout and redirect
            await logout();
            router.push("/");
        } catch (err) {
            console.error("Delete error:", err);
            setError(t("Hesap silinemedi. Lütfen tekrar deneyin.", "Failed to delete account. Please try again."));
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#c4b5e0]/20 rounded-lg">
                    <Shield className="w-5 h-5 text-[#9d8bc7]" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#4a4a4a]">
                        {t("Veri Gizliliği", "Data Privacy")}
                    </h3>
                    <p className="text-sm text-[#9a9a9a]">
                        {t("KVKK kapsamındaki haklarınız", "Your rights under data protection laws")}
                    </p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-[#fef0f0] border border-[#e8a0a0] rounded-lg text-[#d88080] text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Export Data */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#f5efe6] rounded-xl">
                    <div>
                        <h4 className="font-semibold text-[#4a4a4a] flex items-center gap-2">
                            <Download className="w-4 h-4 text-[#7ba7d1]" />
                            {t("Verilerimi İndir", "Download My Data")}
                        </h4>
                        <p className="text-sm text-[#9a9a9a]">
                            {t(
                                "Tüm kişisel verilerinizi JSON formatında indirin",
                                "Download all your personal data in JSON format"
                            )}
                        </p>
                    </div>
                    <button
                        onClick={handleExportData}
                        disabled={isExporting}
                        className="px-4 py-2 bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white font-semibold rounded-xl shadow-soft hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("İndiriliyor...", "Downloading...")}
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                {t("İndir", "Download")}
                            </>
                        )}
                    </button>
                </div>

                {/* Delete Account */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#fef8f8] rounded-xl border border-[#e8d0d0]">
                    <div>
                        <h4 className="font-semibold text-[#d88080] flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            {t("Hesabımı Sil", "Delete My Account")}
                        </h4>
                        <p className="text-sm text-[#9a9a9a]">
                            {t(
                                "Hesabınız ve tüm verileriniz kalıcı olarak silinecek",
                                "Your account and all data will be permanently deleted"
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-white border-2 border-[#e8a0a0] text-[#d88080] font-semibold rounded-xl hover:bg-[#fef0f0] transition flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        {t("Hesabı Sil", "Delete Account")}
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-[#fef0f0] rounded-full">
                                <AlertTriangle className="w-6 h-6 text-[#d88080]" />
                            </div>
                            <h3 className="text-xl font-bold text-[#4a4a4a]">
                                {t("Hesabı Silmek İstediğinize Emin Misiniz?", "Are You Sure You Want to Delete Your Account?")}
                            </h3>
                        </div>

                        <div className="mb-6 text-[#6a6a6a] space-y-2">
                            <p>
                                {t(
                                    "Bu işlem geri alınamaz. Aşağıdaki veriler kalıcı olarak silinecek:",
                                    "This action cannot be undone. The following data will be permanently deleted:"
                                )}
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                                <li>{t("Hesap bilgileriniz", "Your account information")}</li>
                                <li>{t("Oyun geçmişiniz", "Your game history")}</li>
                                <li>{t("İstatistikleriniz", "Your statistics")}</li>
                                <li>{t("Başarımlarınız", "Your achievements")}</li>
                                <li>{t("Coin ve XP'leriniz", "Your coins and XP")}</li>
                                <li>{t("Arkadaş listeniz", "Your friend list")}</li>
                            </ul>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#6a6a6a] mb-2">
                                {t(
                                    `Onaylamak için "${t("SİL", "DELETE")}" yazın:`,
                                    `Type "${t("SİL", "DELETE")}" to confirm:`
                                )}
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-[#e8e0d5] rounded-xl focus:border-[#e8a0a0] focus:outline-none"
                                placeholder={t("SİL", "DELETE")}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText("");
                                }}
                                className="flex-1 px-4 py-3 bg-[#f5efe6] text-[#6a6a6a] font-semibold rounded-xl hover:bg-[#e8e0d5] transition"
                            >
                                {t("İptal", "Cancel")}
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || deleteConfirmText !== t("SİL", "DELETE")}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#e8a0a0] to-[#d88080] text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t("Siliniyor...", "Deleting...")}
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        {t("Kalıcı Olarak Sil", "Permanently Delete")}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
