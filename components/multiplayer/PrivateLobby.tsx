"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Globe, Lock, Plus, Search, UserPlus, Users, Play, Check } from "lucide-react";
import {
    PrivateLobby,
    createLobby,
    joinLobbyByCode,
    getPublicLobbies,
    subscribeLobby,
    leaveLobby,
    startGameFromLobby,
    inviteFriendToLobby,
} from "@/lib/privateLobby";
import { Friend, getFriends } from "@/lib/friends";

interface PrivateLobbyComponentProps {
    onGameStart: (roomId: string, wordLength: number) => void;
    onBack: () => void;
}

export function PrivateLobbyComponent({ onGameStart, onBack }: PrivateLobbyComponentProps) {
    const { user } = useAuth();
    const [mode, setMode] = useState<"menu" | "create" | "join" | "lobby" | "browse">("menu");
    const [wordLength, setWordLength] = useState<4 | 5 | 6 | 7>(5);
    const [isPublic, setIsPublic] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [lobby, setLobby] = useState<PrivateLobby | null>(null);
    const [publicLobbies, setPublicLobbies] = useState<PrivateLobby[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showInviteList, setShowInviteList] = useState(false);
    const [copied, setCopied] = useState(false);

    const modeColors: Record<number, string> = {
        4: "from-[#a8d5a2] to-[#7bc275]",
        5: "from-[#f9c784] to-[#e5a855]",
        6: "from-[#c4b5e0] to-[#9d8bc7]",
        7: "from-[#a7c7e7] to-[#7ba7d1]",
    };

    useEffect(() => {
        if (user) {
            loadDisplayName();
            loadFriends();
        }
    }, [user]);

    const loadDisplayName = async () => {
        if (!user) return;
        const { doc, getDoc } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            setDisplayName(userSnap.data().displayName || "Oyuncu");
        }
    };

    const loadFriends = async () => {
        if (!user) return;
        const friendsList = await getFriends(user.uid);
        setFriends(friendsList);
    };

    const handleCreateLobby = async () => {
        if (!user) return;
        setLoading(true);
        setError("");

        const result = await createLobby(user.uid, displayName, wordLength, isPublic);

        if (result.success && result.lobbyId && result.inviteCode) {
            setInviteCode(result.inviteCode);
            subscribeLobby(result.lobbyId, (updatedLobby) => {
                if (updatedLobby) {
                    setLobby(updatedLobby);
                    if (updatedLobby.status === "playing" && updatedLobby.roomId) {
                        onGameStart(updatedLobby.roomId, updatedLobby.wordLength);
                    }
                }
            });
            setMode("lobby");
        } else {
            setError(result.message || "Lobi oluşturulamadı.");
        }
        setLoading(false);
    };

    const handleJoinByCode = async () => {
        if (!user || !joinCode.trim()) return;
        setLoading(true);
        setError("");

        const result = await joinLobbyByCode(joinCode.trim(), user.uid, displayName);

        if (result.success && result.lobbyId) {
            subscribeLobby(result.lobbyId, (updatedLobby) => {
                if (updatedLobby) {
                    setLobby(updatedLobby);
                    if (updatedLobby.status === "playing" && updatedLobby.roomId) {
                        onGameStart(updatedLobby.roomId, updatedLobby.wordLength);
                    }
                }
            });
            setMode("lobby");
        } else {
            setError(result.message || "Lobiye katılınamadı.");
        }
        setLoading(false);
    };

    const handleBrowseLobbies = async () => {
        setLoading(true);
        const lobbies = await getPublicLobbies();
        setPublicLobbies(lobbies);
        setMode("browse");
        setLoading(false);
    };

    const handleLeaveLobby = async () => {
        if (!lobby || !user) return;
        const isHost = lobby.hostUid === user.uid;
        await leaveLobby(lobby.id, isHost);
        setLobby(null);
        setMode("menu");
    };

    const handleStartGame = async () => {
        if (!lobby) return;
        setLoading(true);
        const roomId = await startGameFromLobby(lobby.id);
        if (roomId) {
            onGameStart(roomId, lobby.wordLength);
        } else {
            setError("Oyun başlatılamadı.");
        }
        setLoading(false);
    };

    const handleInviteFriend = async (friend: Friend) => {
        if (!lobby || !user) return;
        await inviteFriendToLobby(lobby.id, inviteCode, user.uid, displayName, friend.uid);
        setShowInviteList(false);
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(inviteCode || lobby?.inviteCode || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!user) return null;

    // MENU SCREEN
    if (mode === "menu") {
        return (
            <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={onBack} className="p-2 rounded-xl hover:bg-[#f5efe6] text-[#9a9a9a] hover:text-[#4a4a4a] transition">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-[#4a4a4a]">Özel Lobi</h2>
                </div>

                <button
                    onClick={() => setMode("create")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-[#a8d5a2]/30 hover:border-[#a8d5a2] shadow-soft transition group"
                >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#a8d5a2] to-[#7bc275]">
                        <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-[#4a4a4a] group-hover:text-[#6a9a6a] transition">Lobi Oluştur</div>
                        <div className="text-sm text-[#9a9a9a]">Arkadaşlarını davet et</div>
                    </div>
                </button>

                <button
                    onClick={() => setMode("join")}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#e8e0d5] hover:border-[#a7c7e7] shadow-soft transition group"
                >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1]">
                        <Search className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-[#4a4a4a] group-hover:text-[#7ba7d1] transition">Kod ile Katıl</div>
                        <div className="text-sm text-[#9a9a9a]">Davet kodu gir</div>
                    </div>
                </button>

                <button
                    onClick={handleBrowseLobbies}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#e8e0d5] hover:border-[#f9c784] shadow-soft transition group"
                >
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#f9c784] to-[#e5a855]">
                        <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                        <div className="font-semibold text-[#4a4a4a] group-hover:text-[#e5a855] transition">Açık Lobiler</div>
                        <div className="text-sm text-[#9a9a9a]">Herkese açık lobileri gör</div>
                    </div>
                </button>
            </div>
        );
    }

    // CREATE LOBBY SCREEN
    if (mode === "create") {
        return (
            <div className="w-full max-w-md mx-auto space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => setMode("menu")} className="p-2 rounded-xl hover:bg-[#f5efe6] text-[#9a9a9a] hover:text-[#4a4a4a] transition">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-[#4a4a4a]">Lobi Oluştur</h2>
                </div>

                {/* Word Length */}
                <div className="bg-white rounded-2xl p-5 border border-[#e8e0d5] shadow-soft">
                    <label className="text-sm font-semibold text-[#7a7a7a] mb-3 block">Kelime Uzunluğu</label>
                    <div className="grid grid-cols-4 gap-2">
                        {[4, 5, 6, 7].map((len) => (
                            <button
                                key={len}
                                onClick={() => setWordLength(len as 4 | 5 | 6 | 7)}
                                className={`py-3 rounded-xl font-semibold transition ${wordLength === len
                                        ? `bg-gradient-to-r ${modeColors[len]} text-white shadow-soft`
                                        : "bg-[#f5efe6] text-[#6a6a6a] hover:bg-[#ebe4da]"
                                    }`}
                            >
                                {len}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Lobby Type */}
                <div className="bg-white rounded-2xl p-5 border border-[#e8e0d5] shadow-soft">
                    <label className="text-sm font-semibold text-[#7a7a7a] mb-3 block">Lobi Tipi</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setIsPublic(false)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${!isPublic
                                    ? "bg-gradient-to-r from-[#c4b5e0] to-[#9d8bc7] text-white shadow-soft"
                                    : "bg-[#f5efe6] text-[#6a6a6a] hover:bg-[#ebe4da]"
                                }`}
                        >
                            <Lock className="h-4 w-4" />
                            Özel
                        </button>
                        <button
                            onClick={() => setIsPublic(true)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition ${isPublic
                                    ? "bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white shadow-soft"
                                    : "bg-[#f5efe6] text-[#6a6a6a] hover:bg-[#ebe4da]"
                                }`}
                        >
                            <Globe className="h-4 w-4" />
                            Herkese Açık
                        </button>
                    </div>
                    <p className="text-xs text-[#9a9a9a] mt-2 text-center">
                        {isPublic ? "Herkes görebilir ve katılabilir" : "Sadece davet koduyla katılınabilir"}
                    </p>
                </div>

                {error && <div className="text-[#d88080] text-sm text-center">{error}</div>}

                <button
                    onClick={handleCreateLobby}
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white font-semibold rounded-2xl shadow-soft hover:opacity-90 transition disabled:opacity-50"
                >
                    {loading ? "Oluşturuluyor..." : "Lobi Oluştur"}
                </button>
            </div>
        );
    }

    // JOIN BY CODE SCREEN
    if (mode === "join") {
        return (
            <div className="w-full max-w-md mx-auto space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => setMode("menu")} className="p-2 rounded-xl hover:bg-[#f5efe6] text-[#9a9a9a] hover:text-[#4a4a4a] transition">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-[#4a4a4a]">Lobiye Katıl</h2>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e8e0d5] shadow-soft">
                    <label className="text-sm font-semibold text-[#7a7a7a] mb-3 block text-center">Davet Kodunu Gir</label>
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="ABCD12"
                        maxLength={6}
                        className="w-full bg-[#f5efe6] border border-[#e8e0d5] rounded-xl px-4 py-4 text-[#4a4a4a] text-center text-2xl tracking-[0.3em] font-mono placeholder-[#c4c4c4] focus:outline-none focus:border-[#a7c7e7] transition"
                    />
                </div>

                {error && <div className="text-[#d88080] text-sm text-center">{error}</div>}

                <button
                    onClick={handleJoinByCode}
                    disabled={loading || joinCode.length !== 6}
                    className="w-full h-12 bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white font-semibold rounded-2xl shadow-soft hover:opacity-90 transition disabled:opacity-50"
                >
                    {loading ? "Katılınıyor..." : "Katıl"}
                </button>
            </div>
        );
    }

    // BROWSE PUBLIC LOBBIES
    if (mode === "browse") {
        return (
            <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMode("menu")} className="p-2 rounded-xl hover:bg-[#f5efe6] text-[#9a9a9a] hover:text-[#4a4a4a] transition">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-xl font-bold text-[#4a4a4a]">Açık Lobiler</h2>
                    </div>
                    <button onClick={handleBrowseLobbies} className="text-sm text-[#a7c7e7] hover:text-[#7ba7d1] font-medium">
                        ↻ Yenile
                    </button>
                </div>

                {loading ? (
                    <div className="text-[#9a9a9a] text-center py-12">Yükleniyor...</div>
                ) : publicLobbies.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-[#e8e0d5] shadow-soft">
                        <Globe className="h-12 w-12 mx-auto text-[#d4d4d4] mb-3" />
                        <p className="text-[#9a9a9a]">Şu anda açık lobi yok</p>
                        <button onClick={() => setMode("create")} className="text-[#8fbc8f] hover:text-[#6a9a6a] mt-2 text-sm font-medium">
                            Kendin oluştur →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {publicLobbies.map((l) => (
                            <div key={l.id} className="flex items-center justify-between bg-white rounded-2xl p-4 border border-[#e8e0d5] shadow-soft">
                                <div>
                                    <div className="font-semibold text-[#4a4a4a]">{l.hostName}</div>
                                    <div className="text-sm text-[#9a9a9a]">{l.wordLength} Harf</div>
                                </div>
                                <button
                                    onClick={() => {
                                        setJoinCode(l.inviteCode);
                                        handleJoinByCode();
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white text-sm font-semibold rounded-xl shadow-soft"
                                >
                                    Katıl
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // LOBBY WAITING ROOM
    if (mode === "lobby" && lobby) {
        const isHost = lobby.hostUid === user.uid;

        return (
            <div className="w-full max-w-md mx-auto space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#4a4a4a]">{lobby.wordLength} Harfli Lobi</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${lobby.isPublic ? "bg-[#a8d5a2]/20 text-[#6a9a6a]" : "bg-[#c4b5e0]/20 text-[#9d8bc7]"}`}>
                        {lobby.isPublic ? "Herkese Açık" : "Özel"}
                    </span>
                </div>

                {/* Invite Code */}
                <div className="bg-white rounded-2xl p-4 border border-[#e8e0d5] shadow-soft">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-[#9a9a9a] mb-1">Davet Kodu</div>
                            <div className="text-2xl font-mono font-bold text-[#4a4a4a] tracking-widest">
                                {inviteCode || lobby.inviteCode}
                            </div>
                        </div>
                        <button
                            onClick={copyInviteCode}
                            className={`p-3 rounded-xl transition ${copied ? "bg-[#a8d5a2]/20 text-[#6a9a6a]" : "bg-[#f5efe6] text-[#9a9a9a] hover:text-[#4a4a4a]"}`}
                        >
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Players */}
                <div className="space-y-2">
                    <div className="text-sm font-semibold text-[#7a7a7a]">Oyuncular</div>

                    {/* Host */}
                    <div className="flex items-center gap-3 bg-gradient-to-r from-[#c4b5e0]/10 to-[#c4b5e0]/5 rounded-2xl p-3 border border-[#c4b5e0]/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c4b5e0] to-[#9d8bc7] flex items-center justify-center text-white font-bold">
                            {lobby.hostName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <span className="font-semibold text-[#4a4a4a]">{lobby.hostName}</span>
                            <span className="ml-2 text-xs text-[#9d8bc7] font-medium">Host</span>
                        </div>
                        <span className="text-[#8fbc8f] text-sm">✓ Ready</span>
                    </div>

                    {/* Guest */}
                    {lobby.guestUid ? (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-[#a7c7e7]/10 to-[#a7c7e7]/5 rounded-2xl p-3 border border-[#a7c7e7]/30">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a7c7e7] to-[#7ba7d1] flex items-center justify-center text-white font-bold">
                                {lobby.guestName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <span className="font-semibold text-[#4a4a4a]">{lobby.guestName}</span>
                            </div>
                            <span className="text-[#8fbc8f] text-sm">✓ Ready</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 bg-[#f5efe6] rounded-2xl p-3 border-2 border-dashed border-[#e8e0d5]">
                            <div className="w-10 h-10 rounded-full bg-[#e8e0d5] flex items-center justify-center text-[#c4c4c4]">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-[#9a9a9a]">Oyuncu bekleniyor...</span>
                        </div>
                    )}
                </div>

                {/* Invite Friends */}
                {isHost && friends.length > 0 && (
                    <>
                        <button
                            onClick={() => setShowInviteList(!showInviteList)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[#c4b5e0] hover:text-[#9d8bc7] font-medium"
                        >
                            <UserPlus className="h-4 w-4" />
                            Arkadaş Davet Et
                        </button>

                        {showInviteList && (
                            <div className="space-y-1 max-h-32 overflow-y-auto bg-white rounded-2xl p-2 border border-[#e8e0d5]">
                                {friends.map((friend) => (
                                    <button
                                        key={friend.uid}
                                        onClick={() => handleInviteFriend(friend)}
                                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#f5efe6] transition"
                                    >
                                        <span className="text-[#4a4a4a] text-sm">{friend.displayName}</span>
                                        <span className="text-xs text-[#a7c7e7] font-medium">Davet Et</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {error && <div className="text-[#d88080] text-sm text-center">{error}</div>}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleLeaveLobby}
                        className="flex-1 py-3 text-[#e8a0a0] hover:text-[#d88080] font-medium rounded-xl hover:bg-[#fef0f0] transition"
                    >
                        {isHost ? "Lobiyi Kapat" : "Ayrıl"}
                    </button>

                    {isHost && (
                        <button
                            onClick={handleStartGame}
                            disabled={!lobby.guestUid || loading}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white font-semibold rounded-xl shadow-soft disabled:opacity-50"
                        >
                            <Play className="h-4 w-4" />
                            {loading ? "..." : "Başlat"}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
