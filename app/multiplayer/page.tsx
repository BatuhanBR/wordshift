"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { MultiplayerLobby } from "@/components/multiplayer/MultiplayerLobby";
import { MultiplayerBoard } from "@/components/multiplayer/MultiplayerBoard";
import { MultiplayerResultModal } from "@/components/multiplayer/MultiplayerResultModal";
import { PrivateLobbyComponent } from "@/components/multiplayer/PrivateLobby";
import { getCurrentRoom, clearCurrentRoom } from "@/lib/multiplayer/matchmaking";
import { Swords } from "lucide-react";

export default function MultiplayerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [autoStartSearch, setAutoStartSearch] = useState(false);
  const [showPrivateLobby, setShowPrivateLobby] = useState(false);
  const [privateWordLength, setPrivateWordLength] = useState(5);
  const [gameResult, setGameResult] = useState<{
    won: boolean;
    yourGuesses: number;
    opponentGuesses: number;
    timeUsed: string;
    oldElo: number;
    newElo: number;
    eloChange: number;
    opponentName: string;
    solution: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/giris");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      getCurrentRoom(user.uid).then((roomId) => {
        if (roomId) {
          setCurrentRoomId(roomId);
        }
      });
    }
  }, [user]);

  const handleMatchFound = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  const handleGameEnd = (result: {
    won: boolean;
    yourGuesses: number;
    opponentGuesses: number;
    timeUsed: string;
    oldElo: number;
    newElo: number;
    eloChange: number;
    opponentName: string;
    solution: string;
  }) => {
    setGameResult(result);
    setGameEnded(true);
  };

  const handleCloseResult = async () => {
    if (user) {
      await clearCurrentRoom(user.uid);
    }
    setGameEnded(false);
    setCurrentRoomId(null);
    setGameResult(null);
  };

  const handlePlayAgain = async () => {
    if (user) {
      await clearCurrentRoom(user.uid);
    }
    setGameEnded(false);
    setCurrentRoomId(null);
    setGameResult(null);
    setAutoStartSearch(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-[#7a7a7a]">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-[#4a4a4a] relative overflow-hidden cozy-pattern">
      {/* Decorative Blobs - Soft pastel */}


      <Navbar />

      <main className="relative z-10 flex min-h-[calc(100vh-80px)] w-full max-w-7xl mx-auto flex-col items-center justify-center py-12 px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] shadow-soft flex items-center justify-center">
            <Swords className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#4a4a4a]">
            Multiplayer
          </h1>
        </div>

        {!currentRoomId ? (
          showPrivateLobby ? (
            <PrivateLobbyComponent
              onGameStart={(roomId, wordLength) => {
                setPrivateWordLength(wordLength);
                setCurrentRoomId(roomId);
                setShowPrivateLobby(false);
              }}
              onBack={() => setShowPrivateLobby(false)}
            />
          ) : (
            <MultiplayerLobby
              onMatchFound={handleMatchFound}
              onPrivateLobby={() => setShowPrivateLobby(true)}
              autoStart={autoStartSearch}
              onAutoStartConsumed={() => setAutoStartSearch(false)}
            />
          )
        ) : user ? (
          <MultiplayerBoard
            roomId={currentRoomId}
            playerId={user.uid}
            onGameEnd={handleGameEnd}
          />
        ) : null}
      </main>

      {/* Result Modal */}
      {gameResult && (
        <MultiplayerResultModal
          open={gameEnded}
          onClose={handleCloseResult}
          onPlayAgain={handlePlayAgain}
          won={gameResult.won}
          opponentName={gameResult.opponentName}
          yourGuesses={gameResult.yourGuesses}
          opponentGuesses={gameResult.opponentGuesses}
          timeUsed={gameResult.timeUsed}
          oldElo={gameResult.oldElo}
          newElo={gameResult.newElo}
          eloChange={gameResult.eloChange}
          solution={gameResult.solution}
        />
      )}
    </div>
  );
}
