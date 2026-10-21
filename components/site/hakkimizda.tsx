import { FotoYerTutucu } from "./foto-yer-tutucu";

/* ──────────────────────────────────────────────────────────────────────────
   Hakkımızda — vault "Hakkimizda Bolumu" notundan birebir.

     section  1px #1f1f1f üst VE alt kenarlık · bg #0f0f0f
     iç       max-w 1280 · mx-auto · p 112px 24px
              grid auto-fit minmax(min(100%,420px),1fr) · gap56 · items-center
     sol      yer tutucu, yazı "fotoğraf: dükkân / usta"
     sağ      flex-col · gap20
       eyebrow 12px/600 · ls .12em · uppercase · #e0464e
       h2      DM Sans 700 · clamp(32,4.5vw,48) · lh1.05 · ls -.025em
               · #f8efea · text-wrap balance   ← balance YALNIZCA burada
       p       17px · lh1.7 · #a3a3a3 · text-wrap pretty
   ────────────────────────────────────────────────────────────────────────── */

export function Hakkimizda({ about }: { about: string }) {
  return (
    <section
      id="hakkimizda"
      className="border-t border-b border-line bg-ink-2"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-56 px-24 py-112">
        <FotoYerTutucu yazi="fotoğraf: dükkân / usta" />

        <div className="flex flex-col gap-20">
          <span className="text-12 font-semibold tracking-eyebrow uppercase text-brand-accent">
            Hakkımızda
          </span>
          <h2 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-balance text-cream">
            Mahallenin kasabı
          </h2>
          <p className="m-0 text-17 leading-17 text-pretty text-muted">{about}</p>
        </div>
      </div>
    </section>
  );
}
