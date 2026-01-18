import { ref, set, onValue, remove, get, push } from "firebase/database";
import { database } from "@/lib/firebase";
import type { MatchmakingRequest, GameRoom, Player } from "./types";
import { TR_4 } from "@/lib/words/tr-4";
import { TR_5 } from "@/lib/words/tr-5";
import { TR_6 } from "@/lib/words/tr-6";
import { TR_7 } from "@/lib/words/tr-7";
import { EN_4 } from "@/lib/words/en-4";
import { EN_5 } from "@/lib/words/en-5";
import { EN_6 } from "@/lib/words/en-6";
import { EN_7 } from "@/lib/words/en-7";

const ELO_RANGE = 200; // Match players within ±200 ELO
const MATCH_TIMEOUT = 30000; // 30 seconds

export type Language = "tr" | "en";

export async function joinMatchmaking(
  player: Player,
  wordLength: number,
  language: Language = "tr"
): Promise<string> {
  // Add to matchmaking queue with language prefix
  const queuePath = `matchmaking/${language}/${wordLength}`;
  const currentElo = language === "en" ? (player.elo_en || 1200) : (player.elo || 1200);
  const request: MatchmakingRequest = {
    uid: player.uid,
    elo: currentElo,
    timestamp: Date.now(),
    wordLength,
    language,
  };

  await set(ref(database, `${queuePath}/${player.uid}`), request);

  // Store player info
  await set(ref(database, `players/${player.uid}`), { ...player, language });

  // Try to find a match
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      // Remove from queue if no match found
      remove(ref(database, `${queuePath}/${player.uid}`));
      reject(new Error("Match timeout"));
    }, MATCH_TIMEOUT);

    // Listen for game room creation
    const unsubscribe = onValue(
      ref(database, `userGames/${player.uid}/currentRoom`),
      (snapshot) => {
        if (snapshot.exists()) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(snapshot.val());
        }
      }
    );

    // Try to match immediately
    tryMatch(player, wordLength, language).catch(console.error);
  });
}

async function tryMatch(player: Player, wordLength: number, language: Language) {
  const queuePath = `matchmaking/${language}/${wordLength}`;
  const queueSnapshot = await get(ref(database, queuePath));

  if (!queueSnapshot.exists()) return;

  const queue = queueSnapshot.val() as Record<string, MatchmakingRequest>;

  // Find best match
  let bestMatch: { uid: string; request: MatchmakingRequest } | null = null;
  let smallestEloDiff = Infinity;

  for (const [uid, request] of Object.entries(queue)) {
    if (uid === player.uid) continue;

    const eloDiff = Math.abs(request.elo - player.elo);

    if (eloDiff <= ELO_RANGE && eloDiff < smallestEloDiff) {
      bestMatch = { uid, request };
      smallestEloDiff = eloDiff;
    }
  }

  if (bestMatch) {
    // Get opponent info
    const opponentSnapshot = await get(ref(database, `players/${bestMatch.uid}`));
    if (!opponentSnapshot.exists()) return;

    const opponent = opponentSnapshot.val() as Player;

    // Create game room
    await createGameRoom(player, opponent, wordLength, language);
  }
}

async function createGameRoom(player1: Player, player2: Player, wordLength: number, language: Language) {
  // Get word list based on wordLength and language
  const getWordList = (len: number, lang: Language): readonly string[] => {
    if (lang === "en") {
      switch (len) {
        case 4: return EN_4;
        case 5: return EN_5;
        case 6: return EN_6;
        case 7: return EN_7;
        default: return EN_5;
      }
    } else {
      switch (len) {
        case 4: return TR_4;
        case 5: return TR_5;
        case 6: return TR_6;
        case 7: return TR_7;
        default: return TR_5;
      }
    }
  };

  // Random solution from the appropriate list
  const wordList = getWordList(wordLength, language);
  const solution = wordList[Math.floor(Math.random() * wordList.length)];

  const roomId = push(ref(database, "rooms")).key!;

  const room: GameRoom = {
    id: roomId,
    players: { player1, player2 },
    solution,
    wordLength,
    startTime: Date.now(),
    duration: 180, // 3 minutes
    status: "active",
    language, // Store language in room
  };

  // Create room
  await set(ref(database, `rooms/${roomId}`), room);

  // Notify players
  await set(ref(database, `userGames/${player1.uid}/currentRoom`), roomId);
  await set(ref(database, `userGames/${player2.uid}/currentRoom`), roomId);

  // Remove from matchmaking queue
  const queuePath = `matchmaking/${language}/${wordLength}`;
  await remove(ref(database, `${queuePath}/${player1.uid}`));
  await remove(ref(database, `${queuePath}/${player2.uid}`));

  return roomId;
}

export async function leaveMatchmaking(uid: string, wordLength: number, language: Language = "tr") {
  await remove(ref(database, `matchmaking/${language}/${wordLength}/${uid}`));
}

export async function getCurrentRoom(uid: string): Promise<string | null> {
  const snapshot = await get(ref(database, `userGames/${uid}/currentRoom`));
  if (!snapshot.exists()) return null;

  const roomId = snapshot.val();

  // Check if room is finished
  const roomSnapshot = await get(ref(database, `rooms/${roomId}`));
  if (roomSnapshot.exists()) {
    const room = roomSnapshot.val();
    if (room.status === "finished") {
      // Clear finished room
      await remove(ref(database, `userGames/${uid}/currentRoom`));
      return null;
    }
  }

  return roomId;
}

export async function clearCurrentRoom(uid: string) {
  await remove(ref(database, `userGames/${uid}/currentRoom`));
}
