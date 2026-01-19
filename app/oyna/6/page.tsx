"use client";
import { Board } from "@/components/Board";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Play6() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen font-sans text-[#4a4a4a] relative overflow-hidden cozy-pattern">

      <Navbar />
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] w-full max-w-3xl mx-auto flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-6 text-[#4a4a4a] drop-shadow-sm">{t("6 Harfli Mod", "6 Letter Mode")}</h1>
        <Board initialLen={6} />
      </main>
    </div>
  );
}
