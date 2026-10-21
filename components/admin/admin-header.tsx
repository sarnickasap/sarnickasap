import { DisBaglantiIkonu } from "@/components/icons";
import { Logo } from "@/components/logo";

/* ──────────────────────────────────────────────────────────────────────────
   Admin Header — vault "Admin Header" notundan birebir.

     header  bg #0a0a0a · #fafafa   (sticky DEĞİL)
     iç      max-w 1280 · mx-auto · p 10px 20px · flex items-center
             gap14 · flex-wrap
     logo    40×38 · object-contain   (tıklanabilir DEĞİL — sitedekinden farkı)
     blok    flex-col · flex-1 · min-w-140
             "Sarnıç Kasap" DM Sans 700 16px #f8efea
             "Yönetim paneli" 12px #a3a3a3
     durum   12px #a3a3a3 · flex items-center gap6
             + nokta 7×7 r50% #22c55e  (tasarımda HER ZAMAN yeşil)
     buton   "Siteyi aç" → h36 px14 r8 · 1px #333333 · 13px/500
             + ok ikonu 14px METİNDEN SONRA · hover bg #171717
   ────────────────────────────────────────────────────────────────────────── */

export function AdminHeader({ durumMetni }: { durumMetni: string }) {
  return (
    <header className="bg-black text-body">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-14 px-20 py-10">
        <Logo
          genislik={40}
          yukseklik={38}
          alt="Sarnıç Kasap"
          className="h-38 w-40 object-contain"
        />

        <div className="flex min-w-140 flex-1 flex-col">
          <span className="font-display text-16 font-bold text-cream">
            Sarnıç Kasap
          </span>
          <span className="text-12 text-muted">Yönetim paneli</span>
        </div>

        <span className="flex items-center gap-6 text-12 text-muted">
          <span className="h-7 w-7 rounded-full bg-open" aria-hidden />
          <span aria-live="polite">{durumMetni}</span>
        </span>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-36 items-center gap-8 rounded-8 border border-edge px-14 text-13 font-medium text-body no-underline transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-white"
        >
          Siteyi aç
          <DisBaglantiIkonu size={14} />
        </a>
      </div>
    </header>
  );
}
