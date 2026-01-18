"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AVATARS } from "@/lib/shop/shop-items";
import { ChevronDown, User, BarChart3, LogOut, Swords, Trophy, Users, ClipboardList, ShoppingBag, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DailyQuestsModal } from "@/components/quests/DailyQuestsModal";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, userData, logout, isPremium } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const [questsOpen, setQuestsOpen] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleRestrictedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault();
      setShowLoginToast(true);
    }
  };

  return (
    <>
      <DailyQuestsModal isOpen={questsOpen} onClose={() => setQuestsOpen(false)} />
      <header className="relative z-[2000] mx-auto flex w-full max-w-[1600px] items-center justify-between px-10 py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#c4b5e0] to-[#9d8bc7] shadow-soft flex items-center justify-center text-white font-bold text-3xl group-hover:scale-105 transition-transform">
            {language === "en" ? "W" : "K"}
          </div>
          <span className="text-2xl font-bold text-[#6b5b8a] hidden sm:inline">{t("Günlük Kelime", "Daily Word")}</span>
        </Link>

        {/* Main Nav */}
        <nav className="hidden lg:flex gap-2 items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-soft border border-[#e8e0d5]">
          {/* Oyna Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full group transition-all duration-200">
                <Gamepad2 className="mr-2 h-5 w-5 text-[#8fbc8f] group-hover:scale-110 transition-transform" />
                <span className="font-semibold">{t("Günlük Oyna", "Daily Play")}</span>
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-white border-[#e8e0d5] shadow-soft-lg rounded-xl p-2">
              {[{ tr: "4 Harf", en: "4 Letters", href: "/oyna/4" }, { tr: "5 Harf", en: "5 Letters", href: "/oyna?len=5" }, { tr: "6 Harf", en: "6 Letters", href: "/oyna/6" }, { tr: "7 Harf", en: "7 Letters", href: "/oyna/7" }].map((m) => (
                <DropdownMenuItem key={m.tr} asChild>
                  <Link href={m.href} className="cursor-pointer text-base py-2 text-[#4a4a4a] hover:bg-[#e8ddd0] hover:text-[#3a3a3a] rounded-lg transition-colors">
                    {t(m.tr, m.en)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Multiplayer */}
          <Link href="/multiplayer" onClick={(e) => handleRestrictedClick(e, "/multiplayer")}>
            <Button variant="ghost" className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full">
              <Swords className="mr-2 h-5 w-5 text-[#c4b5e0]" />
              Multiplayer
            </Button>
          </Link>

          {/* Leaderboard */}
          <Link href="/leaderboard" onClick={(e) => handleRestrictedClick(e, "/leaderboard")}>
            <Button variant="ghost" className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full">
              <Trophy className="mr-2 h-5 w-5 text-[#f9c784]" />
              {t("Sıralama", "Leaderboard")}
            </Button>
          </Link>

          {/* Daily Quests */}
          {user && (
            <Button
              variant="ghost"
              onClick={() => setQuestsOpen(true)}
              className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full"
            >
              <ClipboardList className="mr-2 h-5 w-5 text-[#7fd1ae]" />
              {t("Görevler", "Quests")}
            </Button>
          )}

          {/* Shop */}
          {user && (
            <Link href="/shop">
              <Button variant="ghost" className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full">
                <ShoppingBag className="mr-2 h-5 w-5 text-[#f9c784]" />
                {t("Mağaza", "Shop")}
              </Button>
            </Link>
          )}

          {/* Nasıl Oynanır - Always visible */}
          <Link href="/nasil-oynanir">
            <Button variant="ghost" className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full">
              📖 {t("Nasıl Oynanır?", "How to Play?")}
            </Button>
          </Link>

          {/* Sınırsız Mod - Always visible, but requires login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full">
                  ✨ {t("Sınırsız", "Unlimited")}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white border-[#e8e0d5] shadow-soft-lg rounded-xl p-2">
                {[{ tr: "4 Harf", en: "4 Letters", href: "/oyna/pratik/4" }, { tr: "5 Harf", en: "5 Letters", href: "/oyna/pratik" }, { tr: "6 Harf", en: "6 Letters", href: "/oyna/pratik/6" }, { tr: "7 Harf", en: "7 Letters", href: "/oyna/pratik/7" }].map((m) => (
                  <DropdownMenuItem key={m.tr} asChild>
                    <Link href={m.href} className="cursor-pointer text-base py-2 text-[#4a4a4a] hover:bg-[#e8ddd0] hover:text-[#3a3a3a] rounded-lg transition-colors">
                      {t(m.tr, m.en)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              className="h-11 px-5 text-base text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full"
              onClick={() => setShowLoginToast(true)}
            >
              ✨ {t("Sınırsız", "Unlimited")}
            </Button>
          )}
        </nav>

        {/* Language Toggle */}
        <button
          onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
          className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#e8e0d5] shadow-soft hover:bg-[#f5efe6] transition-all"
          title={language === "tr" ? "Switch to English" : "Türkçe'ye geç"}
        >
          <span className={`text-lg ${language === "tr" ? "opacity-100" : "opacity-40"}`}>🇹🇷</span>
          <span className="text-[#9a9a9a]">/</span>
          <span className={`text-lg ${language === "en" ? "opacity-100" : "opacity-40"}`}>🇬🇧</span>
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-16 rounded-full gap-4 px-3 py-1 pl-4 pr-6 bg-white shadow-soft border border-[#e8e0d5] hover:bg-[#f5efe6]">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#f5c6d6] to-[#e89db8] shadow-sm flex items-center justify-center text-3xl text-white font-bold">
                    {(() => {
                      const avatarId = userData?.equipped?.avatar || "default";
                      const avatarItem = AVATARS.find(a => a.id === avatarId);
                      return avatarItem?.emoji || user.email?.charAt(0).toUpperCase();
                    })()}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight min-w-[3rem]">
                    <span className="text-base font-bold text-[#4a4a4a]">{userData?.displayName || t("Oyuncu", "Player")}</span>
                    <span className="text-xs text-[#9a9a9a] font-medium">{t("Hesabım", "My Account")}</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-[#9a9a9a]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#e8e0d5] shadow-soft-lg rounded-xl">
                <DropdownMenuLabel>
                  <div>
                    <p className="text-xs text-[#9a9a9a]">{t("Giriş yapıldı", "Logged in")}</p>
                    <p className="text-sm font-semibold text-[#4a4a4a] truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#e8e0d5]" />
                <DropdownMenuItem asChild>
                  <Link href="/profil" className="cursor-pointer text-[#4a4a4a] hover:bg-[#f5efe6]">
                    <User className="mr-2 h-4 w-4 text-[#a7c7e7]" />
                    {t("Profilim", "My Profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/multiplayer" className="cursor-pointer text-[#4a4a4a] hover:bg-[#f5efe6]">
                    <Swords className="mr-2 h-4 w-4 text-[#c4b5e0]" />
                    Multiplayer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/leaderboard" className="cursor-pointer text-[#4a4a4a] hover:bg-[#f5efe6]">
                    <Trophy className="mr-2 h-4 w-4 text-[#f9c784]" />
                    {t("Sıralama", "Leaderboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#e8e0d5]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-[#e8a0a0] focus:text-[#d88080] focus:bg-[#fef0f0] cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("Çıkış Yap", "Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="text-[#6a6a6a] hover:text-[#4a4a4a] hover:bg-[#f5efe6] rounded-full">
                <Link href="/giris">{t("Giriş", "Login")}</Link>
              </Button>
              <Button size="sm" asChild className="rounded-full bg-gradient-to-r from-[#c4b5e0] to-[#9d8bc7] hover:opacity-90 text-white shadow-soft">
                <Link href="/kayit">{t("Kayıt Ol", "Register")}</Link>
              </Button>
            </>
          )}
        </div>

      </header >

      {/* Login Required Modal */}
      {showLoginToast && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#e8e0d5] shadow-2xl rounded-2xl p-6 max-w-sm mx-4 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#f9c784]/20 to-[#f9c784]/40 flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h4 className="text-xl font-bold text-[#4a4a4a] mb-2">
              {t("Giriş Yapmalısın", "Login Required")}
            </h4>
            <p className="text-[#6a6a6a] mb-6">
              {t(
                "Bu özelliğe erişmek için hesabına giriş yapman veya yeni bir hesap oluşturman gerekiyor. Ücretsiz kayıt ol ve tüm özelliklerin kilidini aç!",
                "You need to log in or create an account to access this feature. Register for free and unlock all features!"
              )}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/giris">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 px-5 border-2 border-[#e8e0d5] hover:border-[#c4b5e0] hover:bg-[#f5efe6] active:scale-95 transition-all duration-150"
                >
                  {t("Giriş Yap", "Login")}
                </Button>
              </Link>
              <Link href="/kayit">
                <Button
                  size="sm"
                  className="h-10 px-5 bg-gradient-to-r from-[#8fbc8f] to-[#6a9a6a] hover:opacity-90 active:scale-95 text-white shadow-soft transition-all duration-150"
                >
                  ✨ {t("Ücretsiz Kayıt Ol", "Register Free")}
                </Button>
              </Link>
            </div>
            <button
              onClick={() => setShowLoginToast(false)}
              className="mt-4 text-sm text-[#9a9a9a] hover:text-[#6a6a6a] transition"
            >
              {t("Kapat", "Close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
