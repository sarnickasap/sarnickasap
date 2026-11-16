"use client";

import { Icon } from "@astryxdesign/core/Icon";
import type { SVGProps } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   İkonlar — hepsi Astryx <Icon> üzerinden çizilir (astryx-icon sınıfı,
   currentColor, varsayılan olarak aria-hidden).

   • Astryx'in semantik adı olan ikonlar ("clock", "externalLink", "menu",
     "close") temanın ikon kaydından gelir. Sarnıç teması neutral'dan
     türüyor; neutral'ın kaydı lucide — tasarımdaki setle aynı çizim dili.
   • Astryx'te karşılığı OLMAYANLAR (telefon, konum, mesaj/WhatsApp, ok,
     artı, eksi, çöp, sepet) tasarımdaki inline SVG'lerden BİREBİR (lucide)
     kopyalanmış bileşenler olarak <Icon icon={…}> içine verilir.
     Ortak nitelikler: viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
     ⚠️  `Plus` ikonunda tasarımda `stroke-linejoin` YOK — birebir korundu.

   Neden "use client"? Icon bir istemci bileşeni; SVG bileşenini prop
   olarak geçirmek ancak aynı istemci modülünde mümkün (sunucudan istemciye
   fonksiyon aktarılamaz). Dışa açılan API değişmedi: `size` (px) +
   `className`. Astryx boyutları (12/16/20/24) tam eşleşince boyut sınıfı,
   değilse (14, 15, 18, 28) aynı px satır içi ölçü olarak verilir
   (fontSize da: kayıt ikonları 1em ile çiziliyor).

   Hepsi dekoratif: ikonlar her zaman bir metin etiketinin yanında ya da
   `aria-label`'lı bir bağlantının/düğmenin içinde kullanılıyor.
   ────────────────────────────────────────────────────────────────────────── */

type Props = { size: number; className?: string };
type SvgBileseni = (p: SVGProps<SVGSVGElement>) => React.ReactElement;
type AstryxAdi = "clock" | "externalLink" | "menu" | "close";

const ASTRYX_BOYUTU = { 12: "xsm", 16: "sm", 20: "md", 24: "lg" } as const;

function boyutProplari(size: number) {
  const ad = ASTRYX_BOYUTU[size as keyof typeof ASTRYX_BOYUTU];
  return ad
    ? { size: ad }
    : { style: { width: size, height: size, fontSize: size } };
}

function ikon(cizim: SvgBileseni | AstryxAdi) {
  function Ikon({ size, className }: Props) {
    return <Icon icon={cizim} className={className} {...boyutProplari(size)} />;
  }
  return Ikon;
}

const ortak = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  focusable: false,
} as const;

/** WhatsApp / mesaj — tasarımda WhatsApp butonlarında kullanılıyor (lucide message-circle) */
export const MesajIkonu = ikon((p) => (
  <svg {...ortak} {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
));

export const TelefonIkonu = ikon((p) => (
  <svg {...ortak} {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
));

export const SagOkIkonu = ikon((p) => (
  <svg {...ortak} {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
));

export const KonumIkonu = ikon((p) => (
  <svg {...ortak} {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
));

/** Astryx "clock" */
export const SaatIkonu = ikon("clock");

/** Astryx "externalLink" */
export const DisBaglantiIkonu = ikon("externalLink");

/** ⚠️ Tasarımda `stroke-linejoin` niteliği yok — birebir korundu. */
export const ArtiIkonu = ikon((p) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    focusable={false}
    {...p}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
));

export const CopIkonu = ikon((p) => (
  <svg {...ortak} {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
));

/* ── Tasarımda YOK — mobil menü için eklendi (onaylı sapma #1, K-18).
      Astryx "menu" ve "close" (neutral kaydında lucide `menu` / `x`). */

export const MenuIkonu = ikon("menu");

export const KapatIkonu = ikon("close");

/* ── Tasarımda YOK — online sipariş için eklendi (K-37).
      Lucide `shopping-bag` ve `minus`; aynı çizim dili. */

export const SepetIkonu = ikon((p) => (
  <svg {...ortak} {...p}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
));

export const EksiIkonu = ikon((p) => (
  <svg {...ortak} {...p}>
    <path d="M5 12h14" />
  </svg>
));
