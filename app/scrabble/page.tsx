import { Navbar } from "@/components/Navbar";
import { ScrabbleBoard } from "@/components/scrabble/ScrabbleBoard";

export default function ScrabbleOfflinePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-neutral-950 text-neutral-100">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_30%,#0000,black)]">
        <div className="absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-[40rem] w-[40rem] rounded-full bg-gradient-to-tr from-purple-500/20 via-pink-400/10 to-blue-500/20 blur-3xl" />
      </div>
      <Navbar />
      <main className="relative z-10 max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Scrabble • Offline</h1>
        <ScrabbleBoard />
      </main>
    </div>
  );
}


