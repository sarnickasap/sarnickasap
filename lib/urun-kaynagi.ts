import type { UrunVerisi } from "@/components/site/urun-karti";
import { guvenliGorselUrl, type Katalog } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün kaynağı seçimi (K-37).
   Stok programı kataloğu varsa ürünler ve kategoriler oradan; yoksa
   sitenin kendi veritabanından (önceki davranış, sipariş kapalı).
   ────────────────────────────────────────────────────────────────────────── */

type DbUrunu = {
  id: number;
  name: string;
  cat: string;
  price: number;
  note: string;
  stock: boolean;
};

export function dbUrunleri(urunler: DbUrunu[]): UrunVerisi[] {
  return urunler.map((u) => ({
    anahtar: `db-${u.id}`,
    code: null,
    name: u.name,
    cat: u.cat,
    price: u.price,
    note: u.note,
    stock: u.stock,
    unit: "kg",
    imageUrl: null,
  }));
}

export function katalogUrunleri(k: Katalog): UrunVerisi[] {
  return k.products.map((u) => ({
    anahtar: `stok-${u.code}`,
    code: u.code,
    name: u.name,
    cat: u.category,
    price: u.price,
    note: u.description,
    stock: u.inStock,
    unit: u.unit,
    imageUrl: guvenliGorselUrl(u.imageUrl),
  }));
}

/** Sözleşmedeki sıra korunur; ürünü olan ama listede olmayan kategori sona eklenir. */
export function katalogKategorileri(k: Katalog): string[] {
  const urunlu = new Set(k.products.map((u) => u.category));
  const sirali = k.categories.filter((c) => urunlu.has(c));
  const eksik = [...urunlu].filter((c) => !sirali.includes(c));
  return [...sirali, ...eksik];
}

/** Sipariş alınabilir mi: stok programı açık VE en az bir teslim şekli var. */
export function siparisAlinir(k: Katalog | null): k is Katalog {
  return Boolean(k && k.ordersOpen && (k.delivery.pickup || k.delivery.homeDelivery));
}

const GUNCELLEME_BICIMI = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** "2 Kasım 12:15" — Europe/Istanbul */
export function guncellemeMetni(iso: string): string {
  return GUNCELLEME_BICIMI.format(new Date(iso));
}
