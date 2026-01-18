"use client";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

export default function ScrabbleOnlineLanding() {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <Navbar />
      <main className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Scrabble • Online (beta)</h1>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-6">
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Oda Oluştur</h2>
            <p className="text-neutral-400 text-sm mb-3">Arkadaşınla oynamak için bir oda oluştur ve linki paylaş.</p>
            <a href="#" className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2 font-semibold hover:from-emerald-700 hover:to-cyan-700">Oda Oluştur (yakında)</a>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Odaya Katıl</h2>
            <div className="flex gap-2">
              <input value={roomId} onChange={(e)=>setRoomId(e.target.value)} placeholder="Oda Kodu" className="flex-1 rounded-lg bg-neutral-800 border border-white/10 px-3 py-2 outline-none text-white" />
              <a href="#" className="rounded-lg border border-white/10 bg-white/5 px-5 py-2 font-semibold hover:bg-white/10">Katıl (yakında)</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


