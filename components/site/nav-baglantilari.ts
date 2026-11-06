/** Tasarımdaki 6 nav bağlantısı — sıra ve metinler birebir. */
export const NAV_BAGLANTILARI = [
  { href: "#firsatlar", label: "Fırsatlar", kosul: "firsat" },
  { href: "#urunler", label: "Ürünler", kosul: null },
  { href: "#hakkimizda", label: "Hakkımızda", kosul: null },
  { href: "#galeri", label: "Galeri", kosul: "galeri" },
  { href: "#yorumlar", label: "Yorumlar", kosul: "yorum" },
  { href: "#iletisim", label: "İletişim", kosul: null },
] as const;

/**
 * Karar K-08 — ölü bağlantı olmasın.
 *
 * Tasarımda Fırsatlar bölümü `hasDeals` false olduğunda tamamen kaldırılıyor
 * ama nav linki kalıyordu → hiçbir yere gitmeyen bağlantı.
 * Aynı durum Yorumlar için de geçerli: gerçek yorum girilene kadar bölüm
 * gizli (K-15), dolayısıyla linki de gizlenmeli.
 */
export function gorunurNavBaglantilari(opts: {
  firsatVar: boolean;
  yorumVar: boolean;
  galeriVar: boolean;
}) {
  return NAV_BAGLANTILARI.filter((l) =>
    l.kosul === "firsat"
      ? opts.firsatVar
      : l.kosul === "yorum"
        ? opts.yorumVar
        : l.kosul === "galeri"
          ? opts.galeriVar
          : true,
  );
}
