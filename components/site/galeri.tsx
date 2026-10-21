import { FotoYerTutucu } from "./foto-yer-tutucu";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri — vault "Galeri Bolumu" notundan birebir.

     section  max-w 1280 · mx-auto · p 112px 24px · flex-col · gap36
              (kendi kenarlığı yok; üstteki Hakkımızda'nın border-bottom'ı ayırır)
     başlık   flex-col · gap12 → eyebrow #e0464e + h2 "Dükkândan"
     ızgara   auto-fill minmax(min(100%,300px),1fr) · gap16
     figür    m0 · flex-col · gap10
       görsel  w-full · aspect 4/3 · object-cover · r12 · block · bg #171717
       yoksa   yer tutucu, yazı "fotoğraf"
       altyazı 14px · #a3a3a3

   Lightbox / tıklama davranışı YOK — tasarımda da yok.
   ────────────────────────────────────────────────────────────────────────── */

export type GaleriOgesi = { id: number; url: string; caption: string };

export function Galeri({ ogeler }: { ogeler: GaleriOgesi[] }) {
  return (
    <section
      id="galeri"
      className="mx-auto flex max-w-[1280px] flex-col gap-36 px-24 py-112"
    >
      <div className="flex flex-col gap-12">
        <span className="text-12 font-semibold tracking-eyebrow uppercase text-brand-accent">
          Galeri
        </span>
        <h2 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">
          Dükkândan
        </h2>
      </div>

      {ogeler.length === 0 ? (
        /* Boş durum — tasarımda YOK (K-08) */
        <p className="m-0 text-14 text-muted">Henüz görsel eklenmedi.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-16">
          {ogeler.map((g) => (
            <figure key={g.id} className="m-0 flex flex-col gap-10">
              {g.url ? (
                /* Kullanıcı tarafından girilen URL — next/image uzak alan adı
                   yapılandırması gerektirir; galeri URL'leri serbest olduğu
                   için düz <img> kullanılıyor (tasarımdaki gibi). */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.url}
                  alt={g.caption}
                  className="block aspect-[4/3] w-full rounded-12 bg-hover object-cover"
                />
              ) : (
                <FotoYerTutucu yazi="fotoğraf" />
              )}
              <figcaption className="text-14 text-muted">{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
