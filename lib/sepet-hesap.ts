import type { Kalem } from "@/lib/siparis-sema";
import type { KatalogUrun, Teslimat } from "@/lib/stok-sema";
import { miktarGecerli } from "@/lib/miktar";

/* ──────────────────────────────────────────────────────────────────────────
   Sepet hesapları — saf fonksiyonlar, istemci ve sunucu ortak.
   Fiyat ASLA depodan okunmaz: her satır güncel katalogdan yeniden türetilir.
   Toplam "tahmini"dir — tartılı ürünlerde fark teslimde ödenir.
   ────────────────────────────────────────────────────────────────────────── */

export type SepetSatiri = {
  kalem: Kalem;
  /** Katalogda yoksa ya da stokta değilse null — siparişe girmez. */
  urun: KatalogUrun | null;
  tutar: number;
};

export function sepetSatirlari(kalemler: Kalem[], urunler: KatalogUrun[]): SepetSatiri[] {
  const harita = new Map(urunler.map((u) => [u.code, u]));
  return kalemler.map((kalem) => {
    const u = harita.get(kalem.code);
    const uygun = u && u.inStock && miktarGecerli(u.unit, kalem.qty) ? u : null;
    return { kalem, urun: uygun, tutar: uygun ? yuvarla(uygun.price * kalem.qty) : 0 };
  });
}

export function araToplam(satirlar: SepetSatiri[]): number {
  return yuvarla(satirlar.reduce((t, s) => t + s.tutar, 0));
}

export function bolgeUcreti(d: Teslimat, bolge: string): number {
  return d.areas.find((a) => a.name === bolge)?.fee ?? 0;
}

/** Eve teslimde en az sepet tutarı kuralı; 0 = kural yok. */
export function enAzTutarKarsilaniyor(d: Teslimat, toplam: number): boolean {
  return d.minOrderTotal <= 0 || toplam >= d.minOrderTotal;
}

function yuvarla(n: number): number {
  return Math.round(n * 100) / 100;
}
