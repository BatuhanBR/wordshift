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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-300">👤 {opponentName}</h3>
        {progress?.finished && (
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            progress.won 
              ? "bg-green-500/20 text-green-400 border border-green-500/30" 
              : "bg-red-500/20 text-red-400 border border-red-500/30"
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
                    "w-10 h-10 border-2 flex items-center justify-center text-lg font-bold uppercase rounded-md transition-all",
                    state === "correct" && "bg-gradient-to-br from-emerald-500/30 to-green-600/30 border-green-500/50",
                    state === "present" && "bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border-yellow-500/50",
                    state === "absent" && "bg-white/5 border-white/20 text-neutral-500",
                    state === "empty" && "border-white/20 bg-white/5"
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
