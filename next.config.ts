import type { NextConfig } from "next";

/* ──────────────────────────────────────────────────────────────────────────
   Güvenlik başlıkları (K-32).
   Taramada yalnızca Vercel'in eklediği HSTS vardı; gerisi yoktu.

   CSP notları — her kaynak bir ihtiyaca dayanıyor, geniş tutulmadı:
   · 'unsafe-inline' script için ZORUNLU: Next.js akış sırasında satır içi
     bootstrap script'leri yazıyor. Nonce ile kaldırmak statik kabuğu
     (PPR) bozar; bu sitede satır içi script yüzeyi yalnızca Next'in kendi
     çıktısı ve JSON-LD (artık kaçışlı — bkz. lib/seo.ts).
   · blob.vercel-storage.com → marka logoları (K-31)
   · *.google.com / gstatic → harita iframe'i (K-16)
   · vitals.vercel-insights → Analytics (K-24)
   · frame-ancestors 'none' → tıklama hırsızlığına (clickjacking) karşı;
     X-Frame-Options'ın modern karşılığı.
   ────────────────────────────────────────────────────────────────────────── */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.googleapis.com https://*.gstatic.com https://maps.google.com",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com https://*.public.blob.vercel-storage.com",
  "frame-src https://maps.google.com https://www.google.com",
  "upgrade-insecure-requests",
].join("; ");

const GUVENLIK_BASLIKLARI = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Bu sitenin ihtiyacı olmayan güçlü API'ler kapatılıyor
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: GUVENLIK_BASLIKLARI },
      {
        /* Panel hiçbir koşulda önbelleğe alınmamalı. Taramada kimlikli
           yanıtta `cache-control: public` görüldü; sızıntı tespit edilmedi
           (anonim istek temiz geldi) ama bu başlık riski tamamen kapatır. */
        source: "/yonetim/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
