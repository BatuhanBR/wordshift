"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Search, UserPlus, UserMinus, Check, X, Users, Info, Circle } from "lucide-react";
import {
    Friend,
    FriendRequest,
    getFriends,
    getPendingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUserByName,
    sendFriendRequest,
} from "@/lib/friends";
import { collection, query, where, onSnapshot, documentId, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FriendsListProps {
    onInviteFriend?: (friend: Friend) => void;
    showInviteButton?: boolean;
}

export function FriendsList({ onInviteFriend, showInviteButton = false }: FriendsListProps) {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState("");
    const [searchResult, setSearchResult] = useState<{ uid: string; displayName: string } | null>(null);
    const [searchError, setSearchError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"friends" | "requests" | "add">("friends");
    const [displayName, setDisplayName] = useState("");

    // Online status state: uid -> status info
    const [onlineStatuses, setOnlineStatuses] = useState<Record<string, { isOnline: boolean; lastSeen: Timestamp; level?: number }>>({});

    useEffect(() => {
        if (user) {
            loadData();
            loadDisplayName();
        }
    }, [user]);

    // Listen to friends' online status
    useEffect(() => {
        if (friends.length === 0) return;

        const friendUids = friends.map(f => f.uid);
        const chunks = [];
        for (let i = 0; i < friendUids.length; i += 10) {
            chunks.push(friendUids.slice(i, i + 10));
        }

        const unsubscribes = chunks.map(chunk => {
            const q = query(collection(db, "users"), where(documentId(), "in", chunk));
            return onSnapshot(q, (snapshot) => {
                const statuses: Record<string, { isOnline: boolean; lastSeen: Timestamp; level?: number }> = {};
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data) {
                        statuses[doc.id] = {
                            isOnline: data.isOnline,
                            lastSeen: data.lastSeen,
                            level: data.level
                        };
                    }
                });
                setOnlineStatuses(prev => ({ ...prev, ...statuses }));
            }, (error) => {
                console.error("Presence listen error:", error);
                if (error.code === 'permission-denied') {
                    setSearchError("Hata: Arkadaşların durumunu görmek için veritabanı okuma izni (Rules) gerekli.");
                }
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [friends]);

    const loadDisplayName = async () => {
        if (!user) return;
        try {
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setDisplayName(userSnap.data().displayName || "Oyuncu");
            }
        } catch (e) {
            console.error("Display name yüklenirken hata:", e);
        }
    };

    const loadData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [friendsList, requestsList] = await Promise.all([
                getFriends(user.uid),
                getPendingRequests(user.uid),
            ]);
            setFriends(friendsList);
            setRequests(requestsList);
        } catch (error) {
            console.error("Error loading friends data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchName.trim()) return;

        setSearchLoading(true);
        setSearchError("");
        setSuccessMessage("");
        setSearchResult(null);

        try {
            const result = await searchUserByName(searchName.trim());
            if (result) {
                if (result.uid === user?.uid) {
                    setSearchError("Kendinizi ekleyemezsiniz!");
                } else {
                    setSearchResult(result);
                }
            } else {
                setSearchError("Kullanıcı bulunamadı.");
            }
        } catch (error) {
            setSearchError("Arama sırasında bir hata oluştu.");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!user || !searchResult) return;

        const result = await sendFriendRequest(
            user.uid,
            displayName,
            searchResult.uid,
            searchResult.displayName
        );

        if (result.success) {
            setSearchResult(null);
            setSearchName("");
            setSuccessMessage(result.message);
            setTimeout(() => setSuccessMessage(""), 3000);
        } else {
            setSearchError(result.message);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        if (!user) return;
        const success = await acceptFriendRequest(user.uid, displayName, requestId);
        if (success) {
            setSuccessMessage("Arkadaşlık isteği kabul edildi!");
            setTimeout(() => setSuccessMessage(""), 3000);
            loadData();
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        if (!user) return;
        const success = await rejectFriendRequest(user.uid, requestId);
        if (success) loadData();
    };

    const handleRemoveFriend = async (friendUid: string) => {
        if (!user) return;
        if (confirm("Bu arkadaşı silmek istediğinizden emin misiniz?")) {
            const success = await removeFriend(user.uid, friendUid);
            if (success) loadData();
        }
    };

    const isUserOnline = (uid: string) => {
        const status = onlineStatuses[uid];
        // Eğer status yoksa veya isOnline false ise offline
        if (!status || !status.isOnline) return false;

        // Eğer isOnline true ise timestamp kontrolü yap (opsiyonel ama sağlıklı)
        // Timestamp null ise (local write) online kabul et
        if (!status.lastSeen) return true;

        const now = Date.now();
        // toMillis yoksa (bazen date objesi gelebilir) güvenli erişim
        const lastSeenMillis = typeof status.lastSeen.toMillis === 'function'
            ? status.lastSeen.toMillis()
            : (status.lastSeen as any).seconds ? (status.lastSeen as any).seconds * 1000
                : 0;

        if (lastSeenMillis === 0) return true; // Timestamp okunamadıysa online kabul et (isOnline true olduğu için)

        // 5 dakika buffer (heartbeat 1 dk ama gecikme olabilir)
        return now - lastSeenMillis < 5 * 60 * 1000;
    };

    if (!user) return null;

    return (
        <div className="bg-white rounded-2xl p-5 border border-[#e8e0d5] shadow-soft">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#a7c7e7]" />
                    <h3 className="font-semibold text-[#4a4a4a]">Arkadaşlar</h3>
                    {requests.length > 0 && (
                        <span className="bg-[#f5c6d6] text-[#d88080] text-xs px-2 py-0.5 rounded-full font-semibold">
                            {requests.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-[#f5efe6] p-1 rounded-xl">
                {[
                    { key: "friends", label: `Arkadaşlar (${friends.length})` },
                    { key: "requests", label: "İstekler", badge: requests.length },
                    { key: "add", label: "+ Ekle" },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTab(tab.key as any);
                            setSearchError("");
                            setSuccessMessage("");
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition relative ${activeTab === tab.key
                            ? "bg-white text-[#4a4a4a] shadow-sm"
                            : "text-[#9a9a9a] hover:text-[#6a6a6a]"
                            }`}
                    >
                        {tab.label}
                        {tab.badge && tab.badge > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#e8a0a0] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-[#9a9a9a] text-center py-8 text-sm">Yükleniyor...</div>
            ) : (
                <>
                    {/* Friends Tab */}
                    {activeTab === "friends" && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {successMessage && (
                                <div className="mb-2 p-2 bg-[#a8d5a2]/20 border border-[#a8d5a2] rounded-lg text-xs text-[#6a9a6a] text-center font-medium">
                                    {successMessage}
                                </div>
                            )}
                            {friends.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserPlus className="h-8 w-8 mx-auto text-[#d4d4d4] mb-2" />
                                    <p className="text-[#9a9a9a] text-sm">Henüz arkadaşınız yok</p>
                                    <button
                                        onClick={() => setActiveTab("add")}
                                        className="text-[#a7c7e7] hover:text-[#7ba7d1] text-sm mt-1 font-medium"
                                    >
                                        Arkadaş ekle →
                                    </button>
                                </div>
                            ) : (
                                friends.map((friend) => {
                                    const online = isUserOnline(friend.uid);
                                    const level = onlineStatuses[friend.uid]?.level || 1;
                                    return (
                                        <div
                                            key={friend.uid}
                                            className="flex items-center justify-between bg-[#f5efe6] rounded-xl p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a7c7e7] to-[#7ba7d1] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                        {friend.displayName.charAt(0).toUpperCase()}
                                                    </div>
                                                    {/* Online Status Indicator */}
                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#f5efe6] ${online ? "bg-[#a8d5a2]" : "bg-[#d4d4d4]"}`}
                                                        title={online ? "Çevrimiçi" : "Çevrimdışı"}
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[#4a4a4a] text-sm font-bold leading-tight flex items-center gap-1">
                                                        {friend.displayName}
                                                        <span className="text-[#f9c784] text-[10px] font-extrabold px-1.5 py-0.5 bg-[#f9c784]/20 rounded-md">
                                                            LVL {level}
                                                        </span>
                                                    </span>
                                                    <span className={`text-[10px] ${online ? "text-[#88b982] font-medium" : "text-[#b0b0b0]"}`}>
                                                        {online ? "Çevrimiçi" : "Çevrimdışı"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {showInviteButton && onInviteFriend && online && (
                                                    <button
                                                        onClick={() => onInviteFriend(friend)}
                                                        className="px-3 py-1 text-xs font-medium text-[#c4b5e0] hover:text-[#9d8bc7] hover:bg-[#c4b5e0]/10 rounded-lg transition"
                                                    >
                                                        Davet
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveFriend(friend.uid)}
                                                    className="p-1.5 rounded-lg hover:bg-[#fef0f0] text-[#c4c4c4] hover:text-[#e8a0a0] transition"
                                                >
                                                    <UserMinus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === "requests" && (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {requests.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-[#9a9a9a] text-sm">Bekleyen istek yok</p>
                                </div>
                            ) : (
                                requests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex items-center justify-between bg-[#f5efe6] rounded-xl p-3 text-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f9c784] to-[#e5a855] flex items-center justify-center text-white text-xs font-bold">
                                                {request.fromName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-[#4a4a4a] font-medium block">{request.fromName}</span>
                                                <span className="text-xs text-[#9a9a9a]">İstek gönderdi</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleAcceptRequest(request.id)}
                                                className="p-1.5 rounded-lg bg-[#a8d5a2]/20 hover:bg-[#a8d5a2]/30 text-[#6a9a6a] transition"
                                                title="Kabul Et"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(request.id)}
                                                className="p-1.5 rounded-lg bg-[#e8a0a0]/20 hover:bg-[#e8a0a0]/30 text-[#e8a0a0] transition"
                                                title="Reddet"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Add Friend Tab */}
                    {activeTab === "add" && (
                        <div className="space-y-3">
                            <div className="bg-[#a7c7e7]/10 p-3 rounded-xl flex items-start gap-2 border border-[#a7c7e7]/30">
                                <Info className="w-4 h-4 text-[#7ba7d1] shrink-0 mt-0.5" />
                                <p className="text-xs text-[#7ba7d1]">
                                    Kullanıcı adı büyük/küçük harf duyarlıdır. Tam adı doğru yazdığınızdan emin olun.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c4c4c4]" />
                                    <input
                                        type="text"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        placeholder="Kullanıcı adı ara..."
                                        className="w-full bg-[#f5efe6] border border-[#e8e0d5] rounded-xl pl-9 pr-3 py-2 text-sm text-[#4a4a4a] placeholder-[#c4c4c4] focus:outline-none focus:border-[#a7c7e7]"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    disabled={searchLoading || !searchName.trim()}
                                    className="px-4 py-2 bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white text-sm font-semibold rounded-xl shadow-soft disabled:opacity-50 hover:shadow-md transition-all"
                                >
                                    {searchLoading ? "..." : "Ara"}
                                </button>
                            </div>

                            {successMessage && (
                                <div className="p-3 bg-[#a8d5a2]/20 border border-[#a8d5a2] rounded-xl text-sm text-[#6a9a6a] text-center font-bold animate-in fade-in slide-in-from-top-2">
                                    🎉 {successMessage}
                                </div>
                            )}

                            {searchError && (
                                <p className="text-[#d88080] text-sm text-center font-medium animate-in fade-in">{searchError}</p>
                            )}

                            {searchResult && !successMessage && (
                                <div className="flex items-center justify-between bg-white border border-[#e8e0d5] rounded-xl p-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a7c7e7] to-[#7ba7d1] flex items-center justify-center text-white font-bold text-base shadow-sm">
                                            {searchResult.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[#4a4a4a] text-sm font-bold">{searchResult.displayName}</span>
                                    </div>
                                    <button
                                        onClick={handleSendRequest}
                                        className="px-4 py-2 bg-gradient-to-r from-[#c4b5e0] to-[#9d8bc7] text-white text-xs font-bold rounded-lg shadow-soft hover:shadow-md transition-all active:scale-95"
                                    >
                                        İstek Gönder
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
