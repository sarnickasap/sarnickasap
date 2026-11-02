/* ──────────────────────────────────────────────────────────────────────────
   Paylaşım görseli (og:image) kuralı — panel (istemci), sunucu eylemi ve
   metadata (lib/seo.ts) aynı sabitleri buradan okur. `"use server"`
   dosyası sabit dışa aktaramadığı için ayrı dosyada.

   Şemada yalnızca `site_info.og_image_url` var (ölçü sütunu yok, şema
   değişikliği istenmedi). Ölçü bu yüzden Blob yolunun İÇİNDE taşınır:
     paylasim/og-1200x630-<rastgele>.jpg
   Böylece `og:image:width/height` bilinir ve WhatsApp/Facebook görseli
   ilk paylaşımda indirip ölçmek zorunda kalmaz. Ölçüyü tarayıcıdaki
   küçültme üretir; sunucu aralığı doğrular.
   ────────────────────────────────────────────────────────────────────────── */

/** Blob klasörü — silme yalnızca bu önekteki dosyaları dener. */
export const PAYLASIM_ONEKI = "/paylasim/";

/** Önerilen ölçü (Facebook/WhatsApp geniş önizleme) */
export const PAYLASIM_ONERILEN = { genislik: 1200, yukseklik: 630 } as const;

/** Tarayıcı küçültmesinin uzun kenar sınırı — önerilen genişlik kadar. */
export const PAYLASIM_MAKS_KENAR = PAYLASIM_ONERILEN.genislik;

/* Galeriyle aynı gerekçe: sunucu eylemi gövdesi 1 MB (lib/galeri-kurali.ts) */
export const PAYLASIM_MAKS_BAYT = 900 * 1024;

export const PAYLASIM_IPUCU =
  "WhatsApp/Facebook'ta paylaşılınca görünen görsel (önerilen 1200×630)";

export type PaylasimOlcusu = { genislik: number; yukseklik: number };

/** Blob dosya adı (rastgele sonek Blob tarafından eklenir). */
export function paylasimDosyaAdi(o: PaylasimOlcusu, uzanti: string): string {
  return `paylasim/og-${o.genislik}x${o.yukseklik}.${uzanti}`;
}

const OLCULU_YOL = /^\/paylasim\/og-(\d{1,5})x(\d{1,5})(?:-[A-Za-z0-9]+)?\.(?:jpg|png|webp)$/;

/** Yoldan ölçüyü okur; site dışı ya da eski biçimli adreste `null`. */
export function paylasimOlcusuOku(url: string): PaylasimOlcusu | null {
  try {
    const eslesme = OLCULU_YOL.exec(new URL(url).pathname);
    if (!eslesme) return null;
    const genislik = Number(eslesme[1]);
    const yukseklik = Number(eslesme[2]);
    return genislik > 0 && yukseklik > 0 ? { genislik, yukseklik } : null;
  } catch {
    return null;
  }
}
