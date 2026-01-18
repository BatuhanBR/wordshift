export default function LicensesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 text-neutral-100">
      <h1 className="mb-6 text-3xl font-bold">Lisanslar ve Atıflar</h1>
      <p className="mb-4 text-neutral-300">
        Bu projede kullanılan üçüncü taraf kaynakların lisans ve atıf bilgileri aşağıdadır.
      </p>

      <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-6">
        <h2 className="mb-2 text-xl font-semibold">Türkçe Kelime Listesi</h2>
        <ul className="list-disc space-y-1 pl-6 text-neutral-300">
          <li>
            Kaynak: <a className="underline hover:text-white" href="https://github.com/CanNuhlar/Turkce-Kelime-Listesi" target="_blank">CanNuhlar/Turkce-Kelime-Listesi</a>
          </li>
          <li>
            Raw: <a className="underline hover:text-white" href="https://raw.githubusercontent.com/CanNuhlar/Turkce-Kelime-Listesi/main/kelimeler.txt" target="_blank">kelimeler.txt</a>
          </li>
          <li>Lisans: MIT License</li>
        </ul>
        <p className="mt-4 text-sm text-neutral-400">
          Ayrıntılar için repodaki <code>THIRD_PARTY_NOTICES.md</code> dosyasına bakabilirsiniz.
        </p>
      </div>
    </div>
  );
}


