import Image from "next/image";
import { cacheLife } from "next/cache";

/* ──────────────────────────────────────────────────────────────────────────
   Site Footer — vault "Site Footer" notundan birebir.

     footer  1px #1f1f1f ÜST kenarlık
     iç      max-w 1280 · mx-auto · p 32px 24px
             flex · flex-wrap · justify-between · items-center · gap16
             13px · #737373 (K-21 → #8a8a8a)
     sol     flex items-center gap12
             img 32×31 object-contain · alt="" (dekoratif)
             "© 2026 Sarnıç Kasap · Gaziemir, İzmir"
     sağ     "Yönetim" → #737373, hover #fafafa

   Yıl dinamik: tasarımda sabit "2026" yazıyordu; site yıllarca yaşayacağı
   için 1 Ocak'ta eskimemesi gerekiyor. `use cache` + günlük tazeleme ile
   prerender'a sabitlenmesi engellendi (Next 16 `new Date()`'i prerender'da
   kabul etmiyor). Bugün 2026 olduğu için tasarımla aynı görünüyor.
   ────────────────────────────────────────────────────────────────────────── */

async function yilGetir() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const yil = await yilGetir();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-16 px-24 py-32 text-13 text-muted-dark">
        <div className="flex items-center gap-12">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={31}
            unoptimized
            className="h-31 w-32 object-contain"
          />
          <span>© {yil} Sarnıç Kasap · Gaziemir, İzmir</span>
        </div>
        <a
          href="/yonetim"
          className="text-muted-dark transition-colors duration-150 ease-out-soft hover:text-body"
        >
          Yönetim
        </a>
      </div>
    </footer>
  );
}
