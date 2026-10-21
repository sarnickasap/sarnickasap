"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  categories,
  deals,
  gallery,
  hours,
  products,
  reviews,
  siteInfo,
} from "@/lib/db/schema";
import { SITE_TAG } from "@/lib/data";
import { oturumZorunlu } from "@/lib/session";

/* ──────────────────────────────────────────────────────────────────────────
   Yönetim paneli yazma işlemleri.

   Tasarımda her değişiklik localStorage'a yazılıp `sarnic-update` olayı
   tetikleniyordu. Buradaki karşılığı: veritabanına yaz + `updateTag` ile
   sitenin önbelleğini tazele → değişiklik sitede anında görünür.

   ⚠️ HER eylem önce oturumu doğrular. Server Action'lar HTTP uç noktasıdır;
   istemci tarafındaki koruma yeterli değildir.
   ────────────────────────────────────────────────────────────────────────── */

async function yetkiVeTazele() {
  await oturumZorunlu();
}

function tazele() {
  updateTag(SITE_TAG);
}

/* ── Ürünler ─────────────────────────────────────────────────────────────── */

const urunAlan = z.object({
  id: z.number().int().positive(),
  name: z.string().max(128).optional(),
  categoryId: z.number().int().positive().optional(),
  price: z.number().min(0).max(1_000_000).optional(),
  note: z.string().max(2000).optional(),
  stock: z.boolean().optional(),
});

export async function urunGuncelle(girdi: z.input<typeof urunAlan>) {
  await yetkiVeTazele();
  const { id, ...alanlar } = urunAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db.update(products).set(alanlar).where(eq(products.id, id));
  tazele();
}

export async function urunEkle(kategoriAdi: string | null) {
  await yetkiVeTazele();
  const kats = await db.select().from(categories);
  const hedef = kats.find((k) => k.name === kategoriAdi) ?? kats[0];
  if (!hedef) throw new Error("Kategori bulunamadı");

  // Tasarım: yeni ürün listenin BAŞINA ekleniyor (unshift)
  const enKucuk = Math.min(0, ...(await db.select().from(products)).map((p) => p.sort));
  const [yeni] = await db
    .insert(products)
    .values({
      name: "Yeni ürün",
      categoryId: hedef.id,
      price: 0,
      note: "",
      stock: true,
      sort: enKucuk - 1,
    })
    .returning();
  tazele();
  return yeni;
}

export async function urunSil(id: number) {
  await yetkiVeTazele();
  await db.delete(products).where(eq(products.id, id));
  tazele();
}

/** Toplu fiyat güncelleme — tasarımdaki bulkCalc ile birebir:
 *  Math.max(0, Math.round(price * (1 + pct/100) / round) * round) */
export async function topluFiyat(kategoriAdi: string, yuzde: number, yuvarlama: number) {
  await yetkiVeTazele();
  const r = Math.max(1, Math.round(yuvarlama) || 1);
  const pct = Number(yuzde) || 0;

  const satirlar = await db
    .select({ id: products.id, price: products.price, cat: categories.name })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id));

  const hedef = satirlar.filter((p) => kategoriAdi === "Tümü" || p.cat === kategoriAdi);
  for (const p of hedef) {
    const yeni = Math.max(0, Math.round((p.price * (1 + pct / 100)) / r) * r);
    await db.update(products).set({ price: yeni }).where(eq(products.id, p.id));
  }
  tazele();
  return hedef.length;
}

/* ── Fırsatlar ───────────────────────────────────────────────────────────── */

const firsatAlan = z.object({
  id: z.number().int().positive(),
  title: z.string().max(128).optional(),
  description: z.string().max(2000).optional(),
  oldPrice: z.number().min(0).max(1_000_000).optional(),
  newPrice: z.number().min(0).max(1_000_000).optional(),
  until: z.string().max(64).optional(),
  active: z.boolean().optional(),
});

export async function firsatGuncelle(girdi: z.input<typeof firsatAlan>) {
  await yetkiVeTazele();
  const { id, ...alanlar } = firsatAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db.update(deals).set(alanlar).where(eq(deals.id, id));
  tazele();
}

export async function firsatEkle() {
  await yetkiVeTazele();
  const enKucuk = Math.min(0, ...(await db.select().from(deals)).map((d) => d.sort));
  const [yeni] = await db
    .insert(deals)
    .values({
      title: "Yeni fırsat",
      description: "",
      oldPrice: 0,
      newPrice: 0,
      until: "Bu hafta",
      active: false,
      sort: enKucuk - 1,
    })
    .returning();
  tazele();
  return yeni;
}

export async function firsatSil(id: number) {
  await yetkiVeTazele();
  await db.delete(deals).where(eq(deals.id, id));
  tazele();
}

/* ── Galeri ──────────────────────────────────────────────────────────────── */

const galeriAlan = z.object({
  id: z.number().int().positive(),
  url: z.string().max(2000).optional(),
  caption: z.string().max(128).optional(),
});

export async function galeriGuncelle(girdi: z.input<typeof galeriAlan>) {
  await yetkiVeTazele();
  const { id, ...alanlar } = galeriAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db.update(gallery).set(alanlar).where(eq(gallery.id, id));
  tazele();
}

export async function galeriEkle() {
  await yetkiVeTazele();
  // Tasarım: galeri SONA ekleniyor (push) — diğer sekmelerden farklı
  const enBuyuk = Math.max(0, ...(await db.select().from(gallery)).map((g) => g.sort));
  const [yeni] = await db
    .insert(gallery)
    .values({ url: "", caption: "", sort: enBuyuk + 1 })
    .returning();
  tazele();
  return yeni;
}

export async function galeriSil(id: number) {
  await yetkiVeTazele();
  await db.delete(gallery).where(eq(gallery.id, id));
  tazele();
}

/* ── Yorumlar ────────────────────────────────────────────────────────────── */

const yorumAlan = z.object({
  id: z.number().int().positive(),
  name: z.string().max(64).optional(),
  text: z.string().max(4000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  visible: z.boolean().optional(),
});

export async function yorumGuncelle(girdi: z.input<typeof yorumAlan>) {
  await yetkiVeTazele();
  const { id, ...alanlar } = yorumAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db.update(reviews).set(alanlar).where(eq(reviews.id, id));
  tazele();
}

export async function yorumEkle() {
  await yetkiVeTazele();
  const enKucuk = Math.min(0, ...(await db.select().from(reviews)).map((r) => r.sort));
  const [yeni] = await db
    .insert(reviews)
    .values({ name: "", text: "", rating: 5, visible: false, sort: enKucuk - 1 })
    .returning();
  tazele();
  return yeni;
}

export async function yorumSil(id: number) {
  await yetkiVeTazele();
  await db.delete(reviews).where(eq(reviews.id, id));
  tazele();
}

/* ── İletişim bilgileri ve saatler ───────────────────────────────────────── */

const bilgiAlan = z.object({
  phone: z.string().max(32).optional(),
  whatsapp: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  heroTitle: z.string().max(200).optional(),
  heroSub: z.string().max(1000).optional(),
  about: z.string().max(4000).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
});

export async function bilgiGuncelle(girdi: z.input<typeof bilgiAlan>) {
  await yetkiVeTazele();
  const alanlar = bilgiAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db
    .update(siteInfo)
    .set({ ...alanlar, updatedAt: new Date() })
    .where(eq(siteInfo.id, 1));
  tazele();
}

const saatAlan = z.object({
  dayIndex: z.number().int().min(0).max(6),
  open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closed: z.boolean().optional(),
});

export async function saatGuncelle(girdi: z.input<typeof saatAlan>) {
  await yetkiVeTazele();
  const { dayIndex, ...alanlar } = saatAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db.update(hours).set(alanlar).where(eq(hours.dayIndex, dayIndex));
  tazele();
}
