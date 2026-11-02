import type { Katalog, KatalogUrun } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Süresi dolmuş kampanya koruması (K-39).

   Stok programı kampanya bitince zaten normal fiyatı gönderiyor; risk
   yalnızca ÖNBELLEKTEKİ eski katalog (5 dk tazeleme, 24 sa son başarılı
   kayıt — lib/stok.ts). Stok programına ulaşılamazsa site dünkü kampanya
   fiyatını "Son gün: dün" rozetiyle göstermeye devam ederdi.

   Kural: `campaignUntil` (dahil) bugünden (Europe/Istanbul) önceyse
   kampanya yok sayılır ve `listPrice` — kampanyadan önceki normal fiyat —
   fiyat olur. Rozet, üstü çizili fiyat, Fırsatlar kartı ve JSON-LD
   `priceValidUntil` kendiliğinden düşer; sepet ve sipariş denetimi de
   aynı fiyatı görür (hepsi `katalogGetir()`ten okur).

   Tarih karşılaştırması METİN üzerinden: ikisi de sıfır dolgulu
   YYYY-MM-DD (şema GUN düzenli ifadesiyle doğruluyor).

   Saf fonksiyonlar — elle doğrulama: 06 - İlerleme Günlüğü (K-39).
   ────────────────────────────────────────────────────────────────────────── */

/** Kampanyanın son günü (dahil) `bugun`den önce mi? */
export function kampanyaBitti(campaignUntil: string | null, bugun: string): boolean {
  return campaignUntil !== null && campaignUntil < bugun;
}

/** Süresi dolmuşsa normal fiyata döndürülmüş YENİ ürün; değilse aynısı. */
export function suresiDolanKampanyayiKaldir(u: KatalogUrun, bugun: string): KatalogUrun {
  if (!kampanyaBitti(u.campaignUntil, bugun)) return u;
  const normalFiyat = u.listPrice !== null && u.listPrice > u.price ? u.listPrice : u.price;
  return { ...u, price: normalFiyat, listPrice: null, campaignUntil: null };
}

/** Kataloğun tüm ürünlerine uygular (girdi değişmez). */
export function suresiDolanKampanyalariKaldir(k: Katalog, bugun: string): Katalog {
  return { ...k, products: k.products.map((u) => suresiDolanKampanyayiKaldir(u, bugun)) };
}
