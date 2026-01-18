"use client";
import { Board } from "@/components/Board";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Practice7() {
  const { isPremium, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  /* Premium check removed
  useEffect(() => {
    if (!loading && !isPremium) router.replace("/premium");
  }, [loading, isPremium, router]);
  */

  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-[#4a4a4a]">

      <Navbar />
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] w-full max-w-3xl mx-auto flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-6 text-[#6b5b8a]">🔥 {t("Sınırsız Mod (7 Harf)", "Unlimited Mode (7 Letters)")}</h1>
        <Board initialLen={7} modeType="practice" />
      </main>
    </div>
  );
}
