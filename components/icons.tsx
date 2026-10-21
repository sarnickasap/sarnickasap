/* ──────────────────────────────────────────────────────────────────────────
   İkonlar — tasarımdaki inline SVG'lerden BİREBİR kopyalandı (lucide seti).
   Ortak nitelikler: viewBox="0 0 24 24" fill="none" stroke="currentColor"
   stroke-width="2" stroke-linecap="round" stroke-linejoin="round"

   ⚠️  `Plus` ikonunda tasarımda `stroke-linejoin` YOK — birebir korundu.

   Hepsi `aria-hidden`: ikonlar her zaman bir metin etiketinin yanında ya da
   `aria-label`'lı bir bağlantının içinde kullanılıyor.
   ────────────────────────────────────────────────────────────────────────── */

type Props = { size: number; className?: string };

const ortak = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** WhatsApp / mesaj — tasarımda WhatsApp butonlarında kullanılıyor */
export const MesajIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const TelefonIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const SagOkIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const KonumIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const SaatIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export const DisBaglantiIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

/** ⚠️ Tasarımda `stroke-linejoin` niteliği yok — birebir korundu. */
export const ArtiIkonu = ({ size, className }: Props) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden
    focusable={false}
    className={className}
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CopIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

/* ── Tasarımda YOK — mobil menü için eklendi (onaylı sapma #1, K-18).
      Lucide `menu` ve `x` ikonları; diğerleriyle aynı çizim diline uyuyor. */

export const MenuIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </svg>
);

export const KapatIkonu = ({ size, className }: Props) => (
  <svg width={size} height={size} className={className} {...ortak}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
