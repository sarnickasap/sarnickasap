import { guvenliGorselUrl } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri URL kuralı (aşama 4) — panel (istemci) ve sunucu eylemi aynı
   kuralı ve aynı Türkçe metni buradan okur. `"use server"` dosyası sabit
   dışa aktaramadığı için ayrı dosyada.

   Kural: boş ya da `https://<alt>.public.blob.vercel-storage.com/…`.
   Başka adresleri CSP `img-src` zaten engelliyor; sitede kırık görünürdü.
   ────────────────────────────────────────────────────────────────────────── */

export const GALERI_URL_HATASI =
  "Yalnızca bu siteye yüklenmiş görsellerin bağlantısı kabul edilir (…public.blob.vercel-storage.com). Görseli “Görsel yükle” ile yükleyin.";

export const GALERI_BLOB_DISI_UYARISI =
  "Bu görsel sitede görünmüyor — yükleyerek değiştirin.";

/** URL alanına yazılabilir mi? Boş değer (görseli kaldırma) kabul edilir. */
export function galeriUrlKabul(url: string): boolean {
  return url === "" || guvenliGorselUrl(url) !== null;
}

/* Sunucu eylemi gövde sınırı 1 MB (Next varsayılanı, değiştirilmedi).
   Çok parçalı gövdenin ek baytlarına yer kalsın diye 900 KB. Panel
   fotoğrafı yüklemeden önce tarayıcıda küçültüyor (lib/gorsel-kucult.ts). */
export const GALERI_MAKS_BAYT = 900 * 1024;
