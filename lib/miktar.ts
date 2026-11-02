import type { Birim } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Miktar kuralları — sözleşmedeki sınırlarla birebir (web-api.md):
     kg   : 0,25 katları · 0,25–50 · varsayılan 0,5
     adet : tam sayı     · 1–100   · varsayılan 1
   Sepet, kart ve sunucu doğrulaması aynı kuralı buradan okur.
   ────────────────────────────────────────────────────────────────────────── */

type Kural = { adim: number; enAz: number; enCok: number; varsayilan: number };

export const MIKTAR_KURALI: Record<Birim, Kural> = {
  kg: { adim: 0.25, enAz: 0.25, enCok: 50, varsayilan: 0.5 },
  adet: { adim: 1, enAz: 1, enCok: 100, varsayilan: 1 },
};

/** Değeri adıma yuvarlar ve sınırlara sıkıştırır. */
export function miktarDuzelt(birim: Birim, deger: number): number {
  const k = MIKTAR_KURALI[birim];
  if (!Number.isFinite(deger)) return k.varsayilan;
  const yuvarlanmis = Math.round(deger / k.adim) * k.adim;
  return Math.min(k.enCok, Math.max(k.enAz, yuvarlanmis));
}

/** Sözleşmeye uygun mu? (sunucu tarafı kesin kontrol) */
export function miktarGecerli(birim: Birim, deger: number): boolean {
  const k = MIKTAR_KURALI[birim];
  if (!Number.isFinite(deger) || deger < k.enAz || deger > k.enCok) return false;
  const kat = deger / k.adim;
  return Math.abs(kat - Math.round(kat)) < 1e-9;
}

const KG_BICIM = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });

/** "500 g" · "1 kg" · "1,5 kg" · "3 adet" */
export function miktarMetni(birim: Birim, deger: number): string {
  if (birim === "adet") return `${deger} adet`;
  if (deger < 1) return `${Math.round(deger * 1000)} g`;
  return `${KG_BICIM.format(deger)} kg`;
}

/** Birim fiyat soneki — kartta "/ kg" ya da "/ adet". */
export function birimSoneki(birim: Birim): string {
  return birim === "kg" ? "/ kg" : "/ adet";
}
