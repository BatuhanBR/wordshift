"use client";

import type { PlayerProgress } from "@/lib/multiplayer/types";
import { cn } from "@/lib/utils";

interface OpponentBoardProps {
  progress: PlayerProgress | null;
  wordLength: number;
  opponentName: string;
}

const ATTEMPTS = 6;

export function OpponentBoard({ progress, wordLength, opponentName }: OpponentBoardProps) {
  const rows = progress?.guesses || Array.from({ length: ATTEMPTS }, () => []);
  const states = progress?.states || Array.from({ length: ATTEMPTS }, () =>
    Array.from({ length: wordLength }, () => "empty" as const)
  );

  return (
    <div className="space-y-3">
      {/* Opponent Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#e8e0d5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4b5e0] to-[#9d8bc7] shadow-soft flex items-center justify-center">
            <span className="text-white text-lg">👤</span>
          </div>
          <div>
            <h3 className="font-bold text-[#4a4a4a]">{opponentName}</h3>
            <p className="text-xs text-[#7a7a7a]">Tahmin: {progress?.currentRow || 0}/6</p>
          </div>
        </div>
        {progress?.finished && (
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            progress.won
              ? "bg-[#8fbc8f]/20 text-[#6a9a6a] border border-[#8fbc8f]"
              : "bg-red-100 text-red-600 border border-red-200"
          )}>
            {progress.won ? "✓ Buldu" : "✕ Bulamadı"}
          </span>
        )}
      </div>

      <div className="grid gap-2">
        {rows.map((letters, rowIdx) => (
          <div key={rowIdx} className="flex gap-2 justify-center">
            {Array.from({ length: wordLength }).map((_, colIdx) => {
              const letter = letters[colIdx] || "";
              const state = states[rowIdx]?.[colIdx] || "empty";

              return (
                <div
                  key={colIdx}
                  className={cn(
                    "w-10 h-10 border-2 flex items-center justify-center text-lg font-bold uppercase rounded-xl transition-all shadow-sm",
                    state === "correct" && "bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] border-[#6a9a6a] text-white",
                    state === "present" && "bg-gradient-to-br from-[#f9c784] to-[#e5a855] border-[#e5a855] text-white",
                    state === "absent" && "bg-[#e8e0d5] border-[#d5cdc2] text-[#9a9a9a]",
                    state === "empty" && "border-[#e8e0d5] bg-white"
                  )}
                >
                  {letter ? "●" : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
