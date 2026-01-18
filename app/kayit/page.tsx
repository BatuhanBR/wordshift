"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setLoading(true);

    try {
      await register(email, password, displayName || undefined);
      // Redirect to login page instead of auto-login
      router.push("/giris?registered=true");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Kayıt başarısız: " + err.message);
      } else {
        setError("Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      router.push("/profil");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Google kaydı başarısız: " + err.message);
      } else {
        setError("Google kaydı başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf8f3] px-4 py-8 relative overflow-hidden cozy-pattern">
      {/* Decorative Blobs - Enhanced like homepage */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#a7c7e7]/40 to-[#a7c7e7]/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#a8d5a2]/40 to-[#a8d5a2]/10 blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-1/4 right-1/3 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#c4b5e0]/35 to-[#c4b5e0]/10 blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute -bottom-20 left-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#f5c6d6]/35 to-[#f5c6d6]/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-[#f9c784]/30 to-[#f9c784]/10 blur-3xl" />
      </div>

      <div className="bg-white rounded-3xl shadow-soft-lg border border-[#e8e0d5] p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#a7c7e7] to-[#7ba7d1] shadow-soft mx-auto flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#4a4a4a] mb-2">Kayıt Ol</h1>
          <p className="text-[#9a9a9a]">Hesap oluştur ve oyuna başla</p>
        </div>

        {error && (
          <div className="bg-[#fef0f0] border border-[#f5c6c6] text-[#d88080] px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6a6a6a] mb-2">
              Nickname
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5efe6] border border-[#e8e0d5] rounded-xl focus:border-[#a7c7e7] focus:ring-2 focus:ring-[#a7c7e7]/20 outline-none transition text-[#4a4a4a] placeholder-[#c4c4c4]"
              placeholder="Oyun içi takma adınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6a6a6a] mb-2">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5efe6] border border-[#e8e0d5] rounded-xl focus:border-[#a7c7e7] focus:ring-2 focus:ring-[#a7c7e7]/20 outline-none transition text-[#4a4a4a] placeholder-[#c4c4c4]"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6a6a6a] mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5efe6] border border-[#e8e0d5] rounded-xl focus:border-[#a7c7e7] focus:ring-2 focus:ring-[#a7c7e7]/20 outline-none transition text-[#4a4a4a] placeholder-[#c4c4c4]"
              placeholder="En az 6 karakter"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6a6a6a] mb-2">
              Şifre Tekrar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#f5efe6] border border-[#e8e0d5] rounded-xl focus:border-[#a7c7e7] focus:ring-2 focus:ring-[#a7c7e7]/20 outline-none transition text-[#4a4a4a] placeholder-[#c4c4c4]"
              placeholder="Şifrenizi tekrar girin"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#a7c7e7] to-[#7ba7d1] text-white font-semibold rounded-xl shadow-soft hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e8e0d5]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#9a9a9a]">veya</span>
          </div>
        </div>

        <button
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full py-3 bg-white border-2 border-[#e8e0d5] text-[#6a6a6a] font-semibold rounded-xl shadow-soft hover:bg-[#f5efe6] transition disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google ile Kayıt Ol
        </button>

        <div className="text-center mt-6">
          <p className="text-[#9a9a9a]">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="font-bold text-[#a7c7e7] hover:text-[#7ba7d1]">
              Giriş Yap
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="inline-flex items-center text-sm text-[#9a9a9a] hover:text-[#6a6a6a] transition">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
