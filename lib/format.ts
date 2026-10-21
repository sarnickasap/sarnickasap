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

/** Tasarım: oldPrice > newPrice ise '%N indirim', değilse boş string. */
export function indirimOrani(eski: number, yeni: number): string {
  if (!(eski > yeni)) return "";
  return "%" + Math.round((1 - yeni / eski) * 100) + " indirim";
}
