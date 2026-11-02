import Link from "next/link";
import { Logo } from "@/components/logo";
import { SiteFooter } from "./footer";
import { SepetDugmesi } from "./sepet-dugmesi";

/* ──────────────────────────────────────────────────────────────────────────
   Alt sayfa kabuğu (/sepet, /siparis, /kvkk, /urunler/<kategori>) — TASARIMDA YOK (K-37).
   Ana sayfa başlığının yapısı korunur (sticky · rgba(10,10,10,.88) · blur ·
   1px #1f1f1f alt kenarlık · max-w 1280 · 10px 24px), ama bölüm çapaları
   yerine ana sayfaya dönüş bağlantısı var — `#urunler` gibi çapalar bu
   sayfalarda boşa düşerdi.

   İçerik sütunu: max-w 880 · p 56px 24px 112px · başlık ana sayfadaki
   bölüm başlığıyla aynı (eyebrow + h2).
   ────────────────────────────────────────────────────────────────────────── */

const GERI_LINKI =
  "rounded-8 px-12 py-8 text-14 font-medium whitespace-nowrap text-muted " +
  "transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-body";

export function AltSayfa({
  ust,
  baslik,
  aciklama,
  sepetVar = false,
  ustBilgi,
  children,
}: {
  ust: string;
  baslik: string;
  aciklama?: React.ReactNode;
  sepetVar?: boolean;
  /** Başlığın üstünde (ör. kategori sayfasında sayfa yolu) */
  ustBilgi?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-body">
      <header className="sticky top-0 z-20 border-b border-line bg-[rgba(10,10,10,0.88)] backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-16 px-24 py-10">
          <Link href="/" className="flex flex-none items-center" aria-label="Ana sayfa">
            <Logo genislik={48} yukseklik={46} alt="Sarnıç Kasap" className="block h-46 w-48 object-contain" />
          </Link>
          <div className="flex-1" />
          <Link href="/#urunler" className={GERI_LINKI}>
            Ürünlere dön
          </Link>
          {sepetVar && <SepetDugmesi />}
        </div>
      </header>

      <main id="ana-icerik" className="mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-32 px-24 pt-56 pb-112">
        <div className="flex flex-col gap-12">
          {ustBilgi}
          <span className="text-12 font-semibold tracking-eyebrow uppercase text-brand-accent">{ust}</span>
          <h1 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">{baslik}</h1>
          {aciklama && <div className="m-0 text-16 leading-16 text-muted">{aciklama}</div>}
        </div>
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
