"use client";

import { useEffect, useMemo, useState } from "react";

type Cell = { letter: string | null };

const BOARD_SIZE = 15;
const TR_TILES = "aaaaabbccçddddeeeeefgğghhııiijklllmmnnnnnooooppqrrrssştttuuuuüvyz".split("");

function generateBag(): string[] {
  // basit bir çanta: harfler rastgele karıştırılır
  const bag = [...TR_TILES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function ScrabbleBoard() {
  const [board, setBoard] = useState<Cell[][]>(
    Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => ({ letter: null })))
  );
  const [bag, setBag] = useState<string[]>([]);
  const [rack, setRack] = useState<string[]>([]);
  const [selectedRack, setSelectedRack] = useState<number | null>(null);
  const CELL_PX = 28; // daha küçük grid (28x28px)
  const [placed, setPlaced] = useState<{ i: number; j: number; letter: string }[]>([]);
  const [turnScore, setTurnScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    const b = generateBag();
    setBag(b);
    setRack(b.slice(0, 7));
    setBag(b.slice(7));
    setSelectedRack(0); // ilk taşı seçili getir
  }, []);

  const drawOne = (currentRack: string[], currentBag: string[]) => {
    const next = currentBag[0];
    return { rack: next ? currentRack.concat([next]) : currentRack, bag: currentBag.slice(next ? 1 : 0) };
  };

  const drawN = (n: number, currentRack: string[], currentBag: string[]) => {
    let r = [...currentRack];
    let b = [...currentBag];
    for (let k = 0; k < n && b.length > 0; k++) {
      const d = drawOne(r, b);
      r = d.rack; b = d.bag;
    }
    return { rack: r, bag: b };
  };

  // Basit TR harf puanları (yaklaşık)
  const LETTER_POINTS: Record<string, number> = {
    A:1, B:3, C:4, Ç:4, D:3, E:1, F:7, G:5, Ğ:8, H:5, I:2, İ:1, J:10,
    K:1, L:1, M:2, N:1, O:2, Ö:3, P:5, Q:10, R:1, S:2, Ş:4, T:1, U:2, Ü:3, V:7, Y:2, Z:4
  };

  const handleCellClick = (i: number, j: number) => {
    if (selectedRack === null) return;
    if (board[i][j].letter) return;
    const ch = rack[selectedRack];
    if (!ch) return;

    // tahtaya yaz
    setBoard((prev) => {
      const copy = prev.map((r) => r.map((c) => ({ ...c })));
      copy[i][j].letter = ch.toUpperCase();
      return copy;
    });

    setPlaced((p) => [...p, { i, j, letter: ch.toUpperCase() }]);

    // raftan düşür + bir tane çek
    setRack((r) => {
      const nextRack = [...r.slice(0, selectedRack), ...r.slice(selectedRack + 1)];
      const drawn = drawOne(nextRack, bag);
      setBag(drawn.bag);
      // bir sonraki taşı otomatik seç
      setSelectedRack(drawn.rack.length > 0 ? 0 : null);
      return drawn.rack;
    });
  };

  const grid = useMemo(
    () => (
      <div className="grid" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_PX}px)`, gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_PX}px)` }}>
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              onClick={() => handleCellClick(i, j)}
              className="border border-white/10 bg-white/5 flex items-center justify-center text-white text-sm hover:bg-white/10 cursor-pointer select-none"
              style={{ width: CELL_PX, height: CELL_PX }}
            >
              {cell.letter}
            </div>
          ))
        )}
      </div>
    ),
    [board]
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-neutral-300 text-sm">Scrabble (beta) • Offline</div>
        <div className="text-neutral-500 text-xs">Raf’tan harf seç → tahtada kareye tıkla</div>
      </div>
      <div className="rounded-2xl border border-white/10 p-3 bg-neutral-900/60 inline-block">
        {grid}
      </div>
      {/* Skor ve tur kontrolü */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-neutral-300">
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Tur: {turnScore}</div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Toplam: {totalScore}</div>
          <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">Çanta: {bag.length}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // tur puanı hesapla (yalnızca yerleştirilen taşlar)
              const s = placed.reduce((acc, t) => acc + (LETTER_POINTS[t.letter] || 1), 0);
              setTurnScore(s);
              setTotalScore((x) => x + s);
              // yerleştirilen taşları kilitlemek için sadece placed temizle
              setPlaced([]);
              // rafı 7’ye tamamla
              setRack((r) => {
                const d = drawN(7 - r.length, r, bag);
                setBag(d.bag);
                return d.rack;
              });
            }}
            className="rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 text-white px-4 py-2 text-sm hover:from-emerald-700 hover:to-cyan-700"
          >Onayla</button>
          <button
            onClick={() => {
              // bu tur yerleştirilenleri geri al, harfleri rafa iade et
              setBoard((prev) => {
                const copy = prev.map((r) => r.map((c) => ({ ...c })));
                placed.forEach(({ i, j }) => { copy[i][j].letter = null; });
                return copy;
              });
              setRack((r) => {
                // iade edilen harfleri rafa ekle (başına)
                const restored = placed.map((p) => p.letter.toLowerCase());
                return restored.concat(r);
              });
              setPlaced([]);
              setTurnScore(0);
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >Geri Al</button>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-neutral-400 text-sm mb-2">Raf</div>
        <div className="flex gap-2">
          {rack.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedRack(idx)}
              className={`h-10 w-10 rounded-md border flex items-center justify-center text-white font-semibold select-none ${
                selectedRack === idx ? "bg-emerald-600 border-emerald-500" : "bg-white/10 border-white/10 hover:bg-white/15"
              }`}
            >
              {ch.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


