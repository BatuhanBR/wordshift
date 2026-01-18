"use client";

import Link from "next/link";
import { Home, RotateCcw, Trophy, TrendingDown, TrendingUp, Zap, Clock, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export interface MultiplayerResultModalProps {
  open: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  won: boolean;
  opponentName: string;
  yourGuesses: number;
  opponentGuesses: number;
  timeUsed: string;
  oldElo: number;
  newElo: number;
  eloChange: number;
}

export function MultiplayerResultModal({
  open,
  onClose,
  onPlayAgain,
  won,
  opponentName,
  yourGuesses,
  opponentGuesses,
  timeUsed,
  oldElo,
  newElo,
  eloChange
}: MultiplayerResultModalProps) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-[#e8e0d5] text-[#4a4a4a] shadow-soft rounded-2xl overflow-hidden">
        <DialogHeader className="pt-6 pb-2">
          <DialogTitle className="flex flex-col items-center gap-2 text-center">
            {won ? (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-2 animate-in zoom-in spin-in-12 duration-500">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-400 bg-clip-text text-transparent">
                  {t("Harika Zafer!", "Great Victory!")}
                </span>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2 animate-in slide-in-from-top-4">😔</div>
                <span className="text-2xl font-bold text-[#9a9a9a]">
                  {t("Sonraki Sefere...", "Better Luck Next Time...")}
                </span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center text-[#9a9a9a] text-base">
            {won
              ? <span className="font-medium text-[#4a4a4a]">{opponentName}</span>
              : <span className="font-medium text-[#4a4a4a]">{opponentName}</span>
            }
            {won ? t(" karşısında kazandın!", " - you won!") : t(" bu sefer seni yendi.", " won this time.")}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Container */}
        <div className="px-6 py-4 space-y-4">

          {/* ELO Change Card */}
          <div className={`rounded-xl border p-4 shadow-sm transition-all duration-500 ${won
            ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-100"
            : "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
            }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${won ? "text-emerald-700" : "text-red-700"}`}>{t("ELO Değişimi", "ELO Change")}</span>
              <div className="flex items-center gap-2">
                {won ? (
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <span className="text-[#9a9a9a] font-medium">{oldElo}</span>
                <span className="text-[#c4c4c4]">→</span>
                <span className={`text-xl font-bold ${won ? "text-emerald-600" : "text-red-600"}`}>
                  {newElo}
                </span>
                <div className={`px-2 py-0.5 rounded-lg text-xs font-bold ${won ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                  {eloChange > 0 ? "+" : ""}{eloChange}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Your Stats */}
            <div className="bg-[#f5efe6] rounded-xl p-3 border border-[#e8e0d5]">
              <div className="text-xs text-[#9a9a9a] font-bold uppercase mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> {t("Senin", "You")}
              </div>
              <div className="text-2xl font-bold text-[#4a4a4a]">{yourGuesses} <span className="text-sm font-medium text-[#c4c4c4]">{t("Tahmin", "Guesses")}</span></div>
            </div>

            {/* Opponent Stats */}
            <div className="bg-white border border-[#e8e0d5] rounded-xl p-3 shadow-sm">
              <div className="text-xs text-[#9a9a9a] font-bold uppercase mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> {t("Rakip", "Opponent")}
              </div>
              <div className="text-2xl font-bold text-[#4a4a4a]">{opponentGuesses || "-"} <span className="text-sm font-medium text-[#c4c4c4]">{t("Tahmin", "Guesses")}</span></div>
            </div>
          </div>

          {/* Time */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-800 font-medium">
              <Clock className="w-4 h-4" />
              {t("Süre", "Time")}
            </div>
            <div className="text-xl font-bold text-blue-600 font-mono">{timeUsed}</div>
          </div>

        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 px-6 pb-6 pt-2">
          <Button variant="outline" asChild className="h-12 border-[#e8e0d5] text-[#9a9a9a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-xl">
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              {t("Ana Sayfa", "Home")}
            </Link>
          </Button>
          <Button onClick={onPlayAgain} className="h-12 bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white shadow-soft hover:shadow-lg hover:opacity-95 transition-all rounded-xl gap-2 border-0">
            <RotateCcw className="h-4 w-4" />
            {t("Tekrar Oyna", "Play Again")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
