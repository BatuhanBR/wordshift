export default function PremiumPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-6">
      <div className="max-w-2xl w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Sınırsız Mod Premium</h1>
        <p className="text-neutral-400 mb-6">Arka arkaya sınırsız kelime, canlı seri takibi ve reklam yok. Yakında ödeme altyapısı (Stripe) ile aktif olacak. Şimdilik davetiye ile deneniyor.</p>
        <div className="grid gap-3">
          <a href="/giris" className="inline-block rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-3 font-semibold hover:from-emerald-700 hover:to-cyan-700">Giriş Yap</a>
          <a href="/kayit" className="inline-block rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold hover:bg-white/10">Kayıt Ol</a>
        </div>
      </div>
    </div>
  );
}


