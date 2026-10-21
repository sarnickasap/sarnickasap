/* ──────────────────────────────────────────────────────────────────────────
   Biçimlendirme ve bağlantı üreticileri — `sarnic-store.js` ve tasarımın
   `renderVals()` fonksiyonundan BİREBİR aktarıldı. Metinler aynen korunmalı:
   WhatsApp mesajları müşteriye gidiyor.
   ────────────────────────────────────────────────────────────────────────── */

/** Tasarım: (Number(v)||0).toLocaleString('tr-TR',{maximumFractionDigits:2}) + ' ₺'
 *  Örn. 890 → "890 ₺" · 1150 → "1.150 ₺" (rakam ile ₺ arasında normal boşluk) */
export function fiyat(v: number | string | null | undefined): string {
  const n = Number(v) || 0;
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + " ₺";
}

/** Tasarım: 'https://wa.me/' + info.whatsapp + '?text=' + encodeURIComponent(msg) */
export function waLink(whatsapp: string, mesaj: string): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(mesaj)}`;
}

/** Tasarım: 'tel:+' + info.whatsapp */
export function telLink(whatsapp: string): string {
  return `tel:+${whatsapp}`;
}

/* Tasarımdaki mesaj metinleri — apostroflar U+2019 (') olmalı, düz ' değil. */
export const WA_MESAJ = {
  genelSiparis: "Merhaba, sipariş vermek istiyorum.",
  firsat: (baslik: string) =>
    `Merhaba, "${baslik}" fırsatından ayırtmak istiyorum.`,
  // Sondaki boşluk tasarımda var — müşteri miktarı yazsın diye. Silinmemeli.
  urun: (ad: string) => `Merhaba, ${ad} almak istiyorum. Miktar: `,
} as const;

/** İşletme adı — harita sorgusunda ve yapılandırılmış veride kullanılır. */
export const ISLETME_ADI = "Sarnıç Kasap";

/**
 * Google Haritalar gömme sorgusu.
 *
 * ⚠️ İşletme adı ÖNE eklenmeli. Yalnız adresle sorgulandığında Google
 * dükkânı bulamıyor: işaretçi düşmüyor ve harita **tamamen farklı bir
 * bölgeyi** gösteriyordu (ölçüldü — canlıda bu hata vardı).
 * Ad + adres ile hem doğru konuma pin düşüyor hem de bilgi kartında
 * işletme adı, puanı ve "Haritalar'da aç" bağlantısı çıkıyor.
 *
 * Biçim API anahtarı gerektirmez (tasarımdaki `output=embed` ile aynı).
 */
export function haritaSorgusu(adres: string): string {
  return (
    "https://maps.google.com/maps?q=" +
    encodeURIComponent(`${ISLETME_ADI}, ${adres}`) +
    "&z=16&output=embed"
  );
}

/** Tasarım: oldPrice > newPrice ise '%N indirim', değilse boş string. */
export function indirimOrani(eski: number, yeni: number): string {
  if (!(eski > yeni)) return "";
  return "%" + Math.round((1 - yeni / eski) * 100) + " indirim";
}
