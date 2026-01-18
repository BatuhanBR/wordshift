"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Achievement } from "@/lib/achievements/types";
import { Home, RotateCcw, BarChart3, Trophy, Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  win: boolean;
  modeLen: number;
  guesses: number;
  durationMs?: number;
  grid: string;
  solution?: string;
  lastGuess?: string;
  xp?: number;
  coins?: number;
  modeType?: "daily" | "practice";
  unlockedAchievements?: Achievement[];
}

export function ResultModal({ open, onClose, win, modeLen, guesses, durationMs, grid, solution, lastGuess, xp, coins, modeType = "daily", unlockedAchievements = [] }: ResultModalProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const seconds = durationMs ? (durationMs / 1000).toFixed(1) : null;

  const isEn = language === "en";
  const lettersText = t("harfli", "letters");
  const wonText = isEn ? "Won" : "Kazandım";
  const lostText = isEn ? "Lost" : "Kaybettim";

  const shareText = `🎯 WordShift ${modeLen} ${lettersText} • ${win ? wonText : lostText} • ${guesses}/6${seconds ? ` • ${seconds}s` : ""}\n\n${grid}\n\n#wordshift #kelimeoyunu\nhttps://playwordshift.com`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-[#e8e0d5] text-[#4a4a4a] shadow-soft rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-[#4a4a4a] text-xl font-bold">
            {win ? t("🎉 Tebrikler!", "🎉 Congratulations!") : t("😅 Sonraki sefere", "😅 Next time!")}
          </DialogTitle>
          <DialogDescription className="text-[#9a9a9a]">
            {modeLen} {lettersText} • {isEn ? `Guessed in ${guesses}` : `${guesses}. tahminde`} {win ? t("kazandın", "won") : t("bilemedin", "failed")}
            {seconds ? ` • ${seconds}s` : ""}
          </DialogDescription>
        </DialogHeader>

        {/* Rewards (XP and Coin) */}
        {(xp !== undefined || coins !== undefined) && win && (
          <div className="flex items-center justify-center gap-4 py-2 animate-in zoom-in spin-in-3 duration-500">
            {xp !== undefined && xp > 0 && (
              <div className="flex flex-col items-center">
                <div className="font-extrabold text-lg text-[#a7c7e7] drop-shadow-sm">+{xp} XP</div>
              </div>
            )}
            {coins !== undefined && coins > 0 && (
              <div className="flex flex-col items-center">
                <div className="font-extrabold text-lg text-[#f9c784] drop-shadow-sm">+{coins} Coin</div>
              </div>
            )}
          </div>
        )}

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="space-y-2 mb-2 animate-in slide-in-from-bottom-5 duration-700 delay-300">
            <h4 className="text-center text-sm font-bold text-[#f9c784] uppercase tracking-wider flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4" />
              {t("Başarım Açıldı!", "Achievement Unlocked!")}
            </h4>
            {unlockedAchievements.map(ach => (
              <div key={ach.id} className="bg-gradient-to-r from-[#f9c784]/20 to-[#e5a855]/20 border border-[#f9c784] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                <div className="text-2xl">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#e5a855] text-sm">{ach.title}</div>
                  <div className="text-xs text-[#9a9a9a] truncate">{ach.description}</div>
                </div>
                <div className="text-xs font-bold text-[#e5a855] bg-white/50 px-2 py-1 rounded-lg">
                  +{ach.reward.coins} 💰
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Correct Word and Last Guess */}
        {solution && (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-[#a8d5a2]/20 border border-[#a8d5a2] px-4 py-3">
              <span className="text-sm font-semibold text-[#6a9a6a]">
                {t("Doğru Kelime:", "Correct Word:")}
              </span>
              <span className="text-lg font-bold text-[#6a9a6a] uppercase tracking-wider">
                {solution}
              </span>
            </div>
            {!win && lastGuess && (
              <div className="flex items-center justify-between rounded-xl bg-[#f5c6d6]/20 border border-[#f5c6d6] px-4 py-3">
                <span className="text-sm font-semibold text-[#d88080]">
                  {t("Son Tahmin:", "Last Guess:")}
                </span>
                <span className="text-lg font-bold text-[#d88080] uppercase tracking-wider">
                  {lastGuess}
                </span>
              </div>
            )}
          </div>
        )}

        <pre className="whitespace-pre-wrap rounded-xl bg-[#f5efe6] p-4 text-lg leading-6 border border-[#e8e0d5] text-[#4a4a4a] text-center">{grid}</pre>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleShare} className="gap-2 bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white shadow-soft border-0 hover:opacity-90">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t("Kopyalandı!", "Copied!") : t("Sonucu Kopyala", "Copy Result")}
          </Button>
          <Button variant="outline" asChild className="border-[#e8e0d5] text-[#9a9a9a] hover:text-[#4a4a4a] hover:bg-[#f5efe6]">
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              {t("Ana Sayfa", "Home")}
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {modeType === "practice" ? (
            <Button variant="secondary" asChild className="bg-[#f9c784]/20 text-[#e5a855] hover:bg-[#f9c784]/30">
              <Link href={modeLen === 5 ? "/oyna/pratik" : `/oyna/pratik/${modeLen}`} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                {t("Tekrar Oyna", "Play Again")}
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" disabled className="bg-[#f5efe6] text-[#c4c4c4] cursor-not-allowed">
              <span className="gap-2 flex items-center">
                🔒 {t("Yarın Gel", "Tomorrow")}
              </span>
            </Button>
          )}
          <Button variant="secondary" asChild className="bg-[#c4b5e0]/20 text-[#9d8bc7] hover:bg-[#c4b5e0]/30">
            <Link href="/profil" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {t("İstatistikler", "Statistics")}
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

