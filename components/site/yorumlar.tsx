/* ──────────────────────────────────────────────────────────────────────────
   Yorumlar — vault "Yorumlar Bolumu" + "Yorum Karti" notlarından birebir.

     section  1px #1f1f1f ÜST kenarlık · bg #0f0f0f
     iç       max-w 1280 · mx-auto · p 112px 24px · flex-col · gap36
     başlık   gap12 → eyebrow #e0464e + h2 "Müşterilerimiz ne diyor"
     ızgara   auto-fill minmax(min(100%,320px),1fr) · gap16
     kart     figure · m0 · p28 · r12 · 1px #1f1f1f · bg #0a0a0a
              flex-col · gap18
       yıldız  flex · gap2 · 16px · letter-spacing 2px
               dolu #facc15 · sönük #333333   ← SVG değil, ★ (U+2605) metni
       alıntı  blockquote · m0 · flex-1 · 16px · lh1.6 · #e5e5e5 · pretty
       isim    figcaption · 14px/600 · #a3a3a3

   Yalnızca `visible: true` yorumlar listelenir.
   Gerçek yorum yoksa bölüm HİÇ render edilmez (K-15: uydurma yorum
   yayınlanmayacak; Google yorumlarından alınacak).
   ────────────────────────────────────────────────────────────────────────── */

export type YorumVerisi = {
  id: number;
  name: string;
  text: string;
  rating: number;
};

export function Yorumlar({ yorumlar }: { yorumlar: YorumVerisi[] }) {
  if (yorumlar.length === 0) return null;

  return (
    <section id="yorumlar" className="border-t border-line bg-ink-2">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-36 px-24 py-112">
        <div className="flex flex-col gap-12">
          <span className="text-12 font-semibold tracking-eyebrow uppercase text-brand-accent">
            Müşteri yorumları
          </span>
          <h2 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">
            Müşterilerimiz ne diyor
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-16">
          {yorumlar.map((y) => {
            const dolu = Math.max(0, Math.min(5, y.rating));
            return (
              <figure
                key={y.id}
                className="m-0 flex flex-col gap-18 rounded-12 border border-line bg-ink p-28"
              >
                <div
                  className="flex gap-2 text-16 tracking-star"
                  role="img"
                  aria-label={`5 üzerinden ${dolu} yıldız`}
                >
                  <span aria-hidden className="text-star">
                    {"★".repeat(dolu)}
                  </span>
                  <span aria-hidden className="text-edge">
                    {"★".repeat(5 - dolu)}
                  </span>
                </div>
                <blockquote className="m-0 flex-1 text-16 leading-16 text-pretty text-read">
                  {y.text}
                </blockquote>
                <figcaption className="text-14 font-semibold text-muted">
                  {y.name}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
