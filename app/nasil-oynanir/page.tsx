"use client";

import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Gamepad2, Swords, Trophy, Zap, Target, Clock, Star, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HowToPlayPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen relative overflow-hidden text-[#4a4a4a] cozy-pattern">
            {/* Decorative Blobs */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#a7c7e7]/20 to-[#a7c7e7]/5 blur-3xl" />
                <div className="absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#c4b5e0]/20 to-[#c4b5e0]/5 blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#a8d5a2]/20 to-[#a8d5a2]/5 blur-3xl" />
                <div className="absolute top-2/3 right-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#f9c784]/15 to-[#f9c784]/5 blur-3xl" />
            </div>

            <Navbar />

            <div className="relative z-10 max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 rounded-xl hover:bg-[#f5efe6] text-[#9a9a9a] hover:text-[#4a4a4a] transition">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#a7c7e7] to-[#7ba7d1] shadow-soft flex items-center justify-center">
                            <Gamepad2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[#4a4a4a]">
                                📖 {t("Nasıl Oynanır?", "How to Play?")}
                            </h1>
                            <p className="text-sm text-[#9a9a9a]">{t("Oyun rehberi ve kurallar", "Game guide and rules")}</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    {/* Basic Rules */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8fbc8f] to-[#6a9a6a] shadow-soft flex items-center justify-center">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">{t("Temel Kurallar", "Basic Rules")}</h2>
                        </div>
                        <div className="space-y-4 text-[#6a6a6a]">
                            <p>{t(
                                "Günlük Kelime, gizli bir kelimeyi tahmin etmeye çalıştığınız bir kelime bulmaca oyunudur.",
                                "Daily Word is a word puzzle game where you try to guess a hidden word."
                            )}</p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="text-xl">🎯</span>
                                    <span>{t("Gizli kelimeyi bulmak için 6 hakkınız var", "You have 6 attempts to find the hidden word")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-xl">🟩</span>
                                    <span>{t("Yeşil: Harf doğru yerde", "Green: Letter is in the correct position")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-xl">🟨</span>
                                    <span>{t("Sarı: Harf kelimede var ama yanlış yerde", "Yellow: Letter is in the word but in wrong position")}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-xl">⬜</span>
                                    <span>{t("Gri: Harf kelimede yok", "Gray: Letter is not in the word")}</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* Game Modes */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#f9c784] to-[#e5a855] shadow-soft flex items-center justify-center">
                                <Gamepad2 className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">{t("Oyun Modları", "Game Modes")}</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Daily Mode */}
                            <div className="bg-[#f5efe6] rounded-xl p-5 border border-[#e8e0d5]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="h-5 w-5 text-[#f9c784]" />
                                    <h3 className="font-bold text-[#4a4a4a]">{t("Günlük Mod", "Daily Mode")}</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-[#6a6a6a]">
                                    <li>• {t("Her gün yeni bir kelime", "New word every day")}</li>
                                    <li>• {t("Herkes aynı kelimeyi çözer", "Everyone solves the same word")}</li>
                                    <li>• {t("Günde sadece 1 kez oynanır", "Can only play once per day")}</li>
                                    <li>• {t("4, 5, 6 veya 7 harfli modlar", "4, 5, 6 or 7 letter modes")}</li>
                                </ul>
                            </div>

                            {/* Unlimited Mode */}
                            <div className="bg-[#f0f8f0] rounded-xl p-5 border border-[#d5e8d5]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="h-5 w-5 text-[#8fbc8f]" />
                                    <h3 className="font-bold text-[#4a4a4a]">{t("Sınırsız Mod", "Unlimited Mode")}</h3>
                                    <span className="text-xs bg-[#8fbc8f] text-white px-2 py-0.5 rounded-full">{t("Kayıtlı", "Members")}</span>
                                </div>
                                <ul className="space-y-2 text-sm text-[#6a6a6a]">
                                    <li>• {t("Sınırsız pratik yapın", "Unlimited practice")}</li>
                                    <li>• {t("Her oyun rastgele kelime", "Random word each game")}</li>
                                    <li>• {t("İstediğiniz kadar oynayın", "Play as much as you want")}</li>
                                    <li>• {t("Becerilerinizi geliştirin", "Improve your skills")}</li>
                                </ul>
                            </div>

                            {/* Multiplayer */}
                            <div className="bg-[#f5f0f8] rounded-xl p-5 border border-[#e0d5e8]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Swords className="h-5 w-5 text-[#c4b5e0]" />
                                    <h3 className="font-bold text-[#4a4a4a]">Multiplayer</h3>
                                    <span className="text-xs bg-[#c4b5e0] text-white px-2 py-0.5 rounded-full">{t("Kayıtlı", "Members")}</span>
                                </div>
                                <ul className="space-y-2 text-sm text-[#6a6a6a]">
                                    <li>• {t("Gerçek oyuncularla yarış", "Compete with real players")}</li>
                                    <li>• {t("Aynı kelimeyi kim önce bulur?", "Who finds the word first?")}</li>
                                    <li>• {t("ELO puanı kazan veya kaybet", "Win or lose ELO points")}</li>
                                    <li>• {t("Sıralamada yüksel", "Climb the leaderboard")}</li>
                                </ul>
                            </div>

                            {/* Private Lobby */}
                            <div className="bg-[#f0f5f8] rounded-xl p-5 border border-[#d5e0e8]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="h-5 w-5 text-[#a7c7e7]" />
                                    <h3 className="font-bold text-[#4a4a4a]">{t("Özel Lobi", "Private Lobby")}</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-[#6a6a6a]">
                                    <li>• {t("Arkadaşlarınızla oynayın", "Play with friends")}</li>
                                    <li>• {t("Oda kodu ile davet edin", "Invite with room code")}</li>
                                    <li>• {t("ELO değişmez", "ELO doesn't change")}</li>
                                    <li>• {t("Eğlence için rekabet", "Compete for fun")}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* ELO System */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#c4b5e0] to-[#9d8bc7] shadow-soft flex items-center justify-center">
                                <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">{t("ELO Sistemi", "ELO System")}</h2>
                        </div>
                        <div className="space-y-4 text-[#6a6a6a]">
                            <p>{t(
                                "ELO, multiplayer maçlarındaki performansınızı gösteren bir puanlama sistemidir. Satranç'tan esinlenmiştir.",
                                "ELO is a rating system that shows your performance in multiplayer matches. It's inspired by Chess."
                            )}</p>

                            <div className="bg-[#f5efe6] rounded-xl p-4">
                                <h4 className="font-bold text-[#4a4a4a] mb-3">{t("Nasıl Çalışır?", "How Does It Work?")}</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#8fbc8f]">✓</span>
                                        <span>{t("Kazandığınızda ELO artar", "When you win, ELO increases")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#e8a0a0]">✗</span>
                                        <span>{t("Kaybettiğinizde ELO azalır", "When you lose, ELO decreases")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#f9c784]">⚡</span>
                                        <span>{t("Daha az tahminde bulursanız bonus puan", "Bonus points for fewer guesses")}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#c4b5e0]">🔥</span>
                                        <span>{t("Galibiyet serisi ekstra puan verir", "Win streaks give extra points")}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-[#f5efe6] rounded-xl p-4">
                                <h4 className="font-bold text-[#4a4a4a] mb-3">{t("Rütbeler", "Ranks")}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🌱</span>
                                        <div>
                                            <div className="font-semibold text-[#4a4a4a]">{t("Acemi", "Novice")}</div>
                                            <div className="text-xs text-[#9a9a9a]">0-800</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📚</span>
                                        <div>
                                            <div className="font-semibold text-[#4a4a4a]">{t("Çırak", "Apprentice")}</div>
                                            <div className="text-xs text-[#9a9a9a]">801-1200</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🥈</span>
                                        <div>
                                            <div className="font-semibold text-[#4a4a4a]">{t("Gümüş", "Silver")}</div>
                                            <div className="text-xs text-[#9a9a9a]">1201-1600</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">🥇</span>
                                        <div>
                                            <div className="font-semibold text-[#4a4a4a]">{t("Altın", "Gold")}</div>
                                            <div className="text-xs text-[#9a9a9a]">1601-2000</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">💎</span>
                                        <div>
                                            <div className="font-semibold text-[#4a4a4a]">{t("Platin", "Platinum")}</div>
                                            <div className="text-xs text-[#9a9a9a]">2001-2400</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">👑</span>
                                        <div>
                                            <div className="font-semibold text-[#4a4a4a]">{t("Üstat", "Grandmaster")}</div>
                                            <div className="text-xs text-[#9a9a9a]">2401-2800</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <span className="text-xl">🏆</span>
                                        <div>
                                            <div className="font-semibold text-[#4a4a4a]">{t("Kelime Efendisi", "Lexicographer")}</div>
                                            <div className="text-xs text-[#9a9a9a]">2801+</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tips */}
                    <section className="bg-white rounded-2xl shadow-soft border border-[#e8e0d5] p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#a7c7e7] to-[#7ba7d1] shadow-soft flex items-center justify-center">
                                <Star className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-[#4a4a4a]">{t("İpuçları", "Tips")}</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <div>
                                    <h4 className="font-semibold text-[#4a4a4a]">{t("Sesli harflerle başla", "Start with vowels")}</h4>
                                    <p className="text-sm text-[#6a6a6a]">{t("İlk tahminlerinizde A, E, I gibi sesli harfleri deneyin", "Try vowels like A, E, I in your first guesses")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🔤</span>
                                <div>
                                    <h4 className="font-semibold text-[#4a4a4a]">{t("Sık kullanılan harfler", "Common letters")}</h4>
                                    <p className="text-sm text-[#6a6a6a]">{t("R, N, L, S gibi sık kullanılan harfleri deneyin", "Try common letters like R, N, L, S")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🧠</span>
                                <div>
                                    <h4 className="font-semibold text-[#4a4a4a]">{t("Eleme yapın", "Eliminate options")}</h4>
                                    <p className="text-sm text-[#6a6a6a]">{t("Gri harfleri bir daha kullanmayın", "Don't use gray letters again")}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⏱️</span>
                                <div>
                                    <h4 className="font-semibold text-[#4a4a4a]">{t("Hızlı düşünün", "Think fast")}</h4>
                                    <p className="text-sm text-[#6a6a6a]">{t("Multiplayer'da hız önemli!", "Speed matters in multiplayer!")}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <div className="text-center py-6">
                        <Link
                            href="/oyna?len=5"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] text-white font-bold text-lg rounded-2xl shadow-soft hover:opacity-90 transition"
                        >
                            🎮 {t("Hemen Oyna", "Play Now")}
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
