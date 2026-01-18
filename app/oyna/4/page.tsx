"use client";
import { Board } from "@/components/Board";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Play4() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fdf8f3] font-sans text-[#4a4a4a] relative overflow-hidden cozy-pattern">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#c4b5e0]/20 to-[#c4b5e0]/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#f5c6d6]/20 to-[#f5c6d6]/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#a7c7e7]/20 to-[#a7c7e7]/5 blur-3xl" />
      </div>

      <Navbar />
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] w-full max-w-3xl mx-auto flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl font-bold mb-6 text-[#4a4a4a] drop-shadow-sm">{t("4 Harfli Mod", "4 Letter Mode")}</h1>
        <Board initialLen={4} />
      </main>
    </div>
  );
}
