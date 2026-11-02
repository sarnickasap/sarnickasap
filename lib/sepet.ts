import { useSyncExternalStore } from "react";
import { z } from "zod";
import { EN_FAZLA_KALEM, KalemSema, type Kalem } from "@/lib/siparis-sema";
import { miktarDuzelt } from "@/lib/miktar";
import type { Birim } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Tarayıcı sepeti — localStorage `sarnic-sepet-v1`.

   Depoda yalnızca {code, qty, note} durur; FİYAT TUTULMAZ. Okunan veri
   kullanıcı tarafından değiştirilebilir, bu yüzden her okumada zod ile
   doğrulanır — bozuksa sepet boş sayılır.

   Paylaşım `useSyncExternalStore` ile: başlıktaki sayaç, ürün kartları ve
   sepet sayfası aynı depoyu dinler. Başka sekmedeki değişiklik `storage`
   olayıyla gelir. Sunucuda (ve hidrasyon sırasında) değer `null` —
   "henüz okunmadı" ile "boş sepet" ayrılsın, metin kayması olmasın.
   ────────────────────────────────────────────────────────────────────────── */

const ANAHTAR = "sarnic-sepet-v1";
const OLAY = "sarnic-sepet-degisti";
const REF_ANAHTARI = "sarnic-siparis-ref";

const SepetSema = z.array(KalemSema).max(EN_FAZLA_KALEM);

function coz(ham: string | null): Kalem[] {
  if (!ham) return [];
  try {
    const sonuc = SepetSema.safeParse(JSON.parse(ham));
    if (!sonuc.success) return [];
    const gorulen = new Set<string>();
    return sonuc.data.filter((k) => !gorulen.has(k.code) && Boolean(gorulen.add(k.code)));
  } catch {
    return [];
  }
}

let onbellek: { ham: string | null; deger: Kalem[] } | null = null;

function oku(): Kalem[] {
  let ham: string | null = null;
  try {
    ham = window.localStorage.getItem(ANAHTAR);
  } catch {
    ham = null; // gizli pencere / engelli depo → boş sepet
  }
  if (onbellek?.ham === ham) return onbellek.deger;
  onbellek = { ham, deger: coz(ham) };
  return onbellek.deger;
}

function yaz(kalemler: Kalem[]): boolean {
  try {
    window.localStorage.setItem(ANAHTAR, JSON.stringify(kalemler));
    return true;
  } catch {
    return false;
  } finally {
    window.dispatchEvent(new Event(OLAY));
  }
}

function abone(bildir: () => void): () => void {
  window.addEventListener(OLAY, bildir);
  window.addEventListener("storage", bildir);
  return () => {
    window.removeEventListener(OLAY, bildir);
    window.removeEventListener("storage", bildir);
  };
}

/** Sepet kalemleri; sunucuda ve hidrasyonda `null`. */
export function useSepet(): Kalem[] | null {
  return useSyncExternalStore<Kalem[] | null>(abone, oku, () => null);
}

export type EklemeSonucu = "eklendi" | "dolu" | "kaydedilemedi";

export function sepeteEkle(code: string, birim: Birim, qty: number): EklemeSonucu {
  const mevcut = oku();
  const var_ = mevcut.find((k) => k.code === code);
  if (!var_ && mevcut.length >= EN_FAZLA_KALEM) return "dolu";
  const yeni = var_
    ? mevcut.map((k) => (k.code === code ? { ...k, qty: miktarDuzelt(birim, k.qty + qty) } : k))
    : [...mevcut, { code, qty: miktarDuzelt(birim, qty), note: "" }];
  return yaz(yeni) ? "eklendi" : "kaydedilemedi";
}

export function miktarGuncelle(code: string, birim: Birim, qty: number): void {
  yaz(oku().map((k) => (k.code === code ? { ...k, qty: miktarDuzelt(birim, qty) } : k)));
}

export function notGuncelle(code: string, note: string): void {
  yaz(oku().map((k) => (k.code === code ? { ...k, note: note.slice(0, 200) } : k)));
}

export function kalemSil(code: string): void {
  yaz(oku().filter((k) => k.code !== code));
}

export function sepetiTemizle(): void {
  yaz([]);
}

/* ── Sipariş kimliği (idempotency) ─────────────────────────────────────
   Ödeme sayfası açıldığında BİR kez üretilir ve başarıya kadar tutulur:
   çift tıklama, ağ kopması sonrası yeniden gönderim aynı siparişi döner. */

export function siparisRefAl(): string {
  try {
    const var_ = window.sessionStorage.getItem(REF_ANAHTARI);
    if (var_) return var_;
    const yeni = crypto.randomUUID();
    window.sessionStorage.setItem(REF_ANAHTARI, yeni);
    return yeni;
  } catch {
    return crypto.randomUUID();
  }
}

export function siparisRefTemizle(): void {
  try {
    window.sessionStorage.removeItem(REF_ANAHTARI);
  } catch {
    /* depo yoksa temizlenecek bir şey de yok */
  }
}
