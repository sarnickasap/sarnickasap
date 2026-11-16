import { guvenliGorselUrl } from "@/lib/stok-sema";
import { BolumBasligi } from "./bilgi-bolum-basligi";
import { GaleriIzgarasi, type GaleriFotografi } from "./galeri-izgarasi";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri — vault "Galeri Bolumu" notundan birebir.

     section  max-w 1280 · mx-auto · p 112px 24px · flex-col · gap32
              (kendi kenarlığı yok; üstteki Hakkımızda'nın border-bottom'ı ayırır)
     başlık   BolumBasligi → eyebrow #e0464e + h2 "Dükkândan"
     ızgara   Astryx Grid · min 300px sütun · gap16 (galeri-izgarasi.tsx)
     figür    m0 · flex-col · gap10
       görsel  Astryx AspectRatio 4/3 · cover · r12 · bg #171717
       yoksa   satır gösterilmez; hiç görsel yoksa bölüm de çıkmaz
       altyazı 14px · #a3a3a3

   Astryx'e geçişle eklenen: fotoğrafa tıklayınca Astryx Lightbox (tam ekran,
   önceki/sonraki, kaydırma). Lightbox kapalıyken DOM'da görsel basmaz;
   `#galeri img` yalnızca ızgaradaki fotoğrafları sayar (admin-galeri testi).

   Aşama 4: yalnızca izinli Blob adresi <img> olur. Eski satırlardaki dış
   bağlantıları CSP `img-src` zaten engelliyordu (kırık görsel + CSP ihlal
   raporu); artık onların yerine yer tutucu çıkar. Veriye dokunulmaz —
   panel o satırlarda "yükleyerek değiştirin" uyarısı gösterir.
   ────────────────────────────────────────────────────────────────────────── */

export type GaleriOgesi = { id: number; url: string; caption: string };

/** Görseli olmayan satırlar çağıran tarafta elenir; hiç görsel yoksa bölüm çıkmaz. */
export function Galeri({ ogeler }: { ogeler: GaleriOgesi[] }) {
  // Sunucuda süzülür: istemciye yalnızca izinli adresler gider.
  const fotograflar: GaleriFotografi[] = ogeler.flatMap((g) => {
    const src = guvenliGorselUrl(g.url || null);
    return src ? [{ id: g.id, src, caption: g.caption }] : [];
  });
  if (fotograflar.length === 0) return null;

  return (
    <section
      id="galeri"
      className="mx-auto flex max-w-[1280px] flex-col gap-32 px-24 py-112"
    >
      <BolumBasligi ust="Galeri" baslik="Dükkândan" />
      <GaleriIzgarasi fotograflar={fotograflar} />
    </section>
  );
}
