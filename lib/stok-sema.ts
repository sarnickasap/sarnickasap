import { z } from "zod";

/* ──────────────────────────────────────────────────────────────────────────
   Stok programı API sözleşmesi — şemalar ve tipler.
   Sözleşme: sarnickasap-yonetim/docs/web-api.md (K-37)

   Bu dosya `server-only` DEĞİL: tipler ve sabitler sepet/sipariş
   bileşenlerinde de kullanılıyor. Ağ çağrıları `lib/stok.ts`'te.

   `z.object` bilinmeyen alanları atar (strict değil) — stok programı
   sözleşmeye geriye uyumlu alan eklediğinde site bozulmasın.
   ────────────────────────────────────────────────────────────────────────── */

const SAAT = /^([01]\d|2[0-3]):[0-5]\d$/;
const GUN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const BirimSema = z.enum(["kg", "adet"]);
export type Birim = z.infer<typeof BirimSema>;

export const KatalogUrunSema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  unit: BirimSema,
  price: z.number().nonnegative().finite(),
  /* Kampanya alanları (aşama 4) — stok programı henüz göndermeyebilir.
     `.catch(null)`: alan yoksa YA DA bozuksa yalnızca kampanya düşer;
     tek bir hatalı alan bütün kataloğu reddettirmesin. */
  listPrice: z.number().positive().finite().nullable().catch(null),
  campaignUntil: z.string().regex(GUN).nullable().catch(null),
  inStock: z.boolean(),
  description: z.string().max(500).default(""),
  imageUrl: z.string().max(500).nullable().default(null),
  sort: z.number().default(0),
});
export type KatalogUrun = z.infer<typeof KatalogUrunSema>;

export const BolgeSema = z.object({
  name: z.string().min(1).max(80),
  fee: z.number().nonnegative().finite(),
});
export type Bolge = z.infer<typeof BolgeSema>;

export const TeslimatSema = z.object({
  pickup: z.boolean(),
  homeDelivery: z.boolean(),
  minOrderTotal: z.number().nonnegative().default(0),
  areas: z.array(BolgeSema).default([]),
  leadHours: z.number().min(0).max(72).default(2),
  slotMinutes: z.number().int().min(15).max(240).default(60),
  openTime: z.string().regex(SAAT),
  closeTime: z.string().regex(SAAT),
  closedWeekdays: z.array(z.number().int().min(0).max(6)).default([]),
  maxDaysAhead: z.number().int().min(0).max(30).default(7),
  note: z.string().max(300).default(""),
});
export type Teslimat = z.infer<typeof TeslimatSema>;

export const KatalogSema = z.object({
  updatedAt: z.iso.datetime({ offset: true }),
  vatIncluded: z.boolean().default(true),
  categories: z.array(z.string()).default([]),
  products: z.array(KatalogUrunSema),
  delivery: TeslimatSema,
  ordersOpen: z.boolean(),
});
export type Katalog = z.infer<typeof KatalogSema>;

/** Sipariş uç noktasının yanıtı — başarılı ya da `{ok:false,error}`. */
export const SiparisYanitSema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    orderId: z.number(),
    orderNo: z.string().min(1).max(32),
    estimatedTotal: z.number(),
    deliveryFee: z.number().default(0),
  }),
  z.object({ ok: z.literal(false), error: z.string().min(1).max(300) }),
]);
export type SiparisYaniti = z.infer<typeof SiparisYanitSema>;

/* ── Görsel güvenliği ───────────────────────────────────────────────────
   CSP `img-src` yalnızca Vercel Blob'un genel alan adına izin veriyor
   (`https://*.public.blob.vercel-storage.com` — sitenin kendi deposu da,
   stok programının deposu da, ör. `qur8uaumjegyazes.public.blob…`).
   Başka bir ana makineden gelen URL tarayıcıda zaten engellenirdi; hiç
   render edilmiyor ki kırık görsel ve CSP ihlali raporu oluşmasın. */
const IZINLI_GORSEL_SONEKI = ".public.blob.vercel-storage.com";

export function guvenliGorselUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    // Sonek eşleşmesi + en az bir alt alan adı etiketi (CSP'deki `*.` gibi)
    const altAlan = u.hostname.slice(0, -IZINLI_GORSEL_SONEKI.length);
    return u.hostname.endsWith(IZINLI_GORSEL_SONEKI) && altAlan.length > 0
      ? u.toString()
      : null;
  } catch {
    return null;
  }
}
