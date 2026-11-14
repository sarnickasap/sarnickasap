/* ──────────────────────────────────────────────────────────────────────────
   Site genelinde Astryx bileşenlerine verilen marka ölçüleri.

   Bileşenler (Button, Card, Badge…) Astryx'ten gelir; renkler sarnic
   temasından (accent = #b8222a). Buradaki sınıflar yalnızca tasarımda
   ÖLÇÜLMÜŞ değerleri korur — Tailwind `utilities` katmanı Astryx
   katmanlarından sonra geldiği için bu sınıflar bileşen varsayılanını ezer.

     CTA       hero/sayfa butonu   h48 · px22 · gap10 · 15px/600
     CTA_ORTA  başlık butonu       h40 · px16 · gap8  · 14px/600
     CERCEVELI ikincil buton dili  1px #333333 · saydam zemin
     CTA_IKINCIL büyük ikincil     CTA + CERCEVELI · 15px/500
     KART      Astryx Card'a: #0f0f0f · p22 · gap16 (çerçeve/r12 Card'dan)
     IPUCU     13px · lh1.5 · #a3a3a3
   ────────────────────────────────────────────────────────────────────────── */

export const CTA = "h-48 gap-10 px-22 text-15 font-semibold";

export const CTA_ORTA = "h-40 gap-8 px-16 text-14 font-semibold";

export const CERCEVELI = "border border-edge bg-transparent text-body";

/** Büyük ikincil buton (hero, sepet, sonuç sayfaları). */
export const CTA_IKINCIL = `${CTA} font-medium ${CERCEVELI}`;

export const KART = "flex flex-col gap-16 bg-ink-2 p-22";

/** Kart içindeki <fieldset>: tarayıcı çerçevesi/boşluğu sıfır, kartın akışı sürer. */
export const FIELDSET = "m-0 flex min-w-0 flex-col gap-16 border-0 p-0";

export const IPUCU = "m-0 text-13 leading-15 text-muted";
