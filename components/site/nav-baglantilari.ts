/** Tasarımdaki 6 nav bağlantısı — sıra ve metinler birebir. */
export const NAV_BAGLANTILARI = [
  { href: "#firsatlar", label: "Fırsatlar", firsataBagli: true },
  { href: "#urunler", label: "Ürünler", firsataBagli: false },
  { href: "#hakkimizda", label: "Hakkımızda", firsataBagli: false },
  { href: "#galeri", label: "Galeri", firsataBagli: false },
  { href: "#yorumlar", label: "Yorumlar", firsataBagli: false },
  { href: "#iletisim", label: "İletişim", firsataBagli: false },
] as const;

/**
 * Tasarımda Fırsatlar bölümü `hasDeals` false olduğunda tamamen kaldırılıyor
 * ama nav linki kalıyordu → hiçbir yere gitmeyen ölü bağlantı.
 * Karar K-08 gereği link de gizleniyor.
 */
export function gorunurNavBaglantilari(firsatVar: boolean) {
  return NAV_BAGLANTILARI.filter((l) => !l.firsataBagli || firsatVar);
}
