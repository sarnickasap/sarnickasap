"use server";

import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { SITE_TAG } from "@/lib/data";
import { oturumZorunlu } from "@/lib/session";

/* ──────────────────────────────────────────────────────────────────────────
   Çalıştığımız markalar / üreticiler (K-31) — TASARIMDA YOK.

   Logolar Vercel Blob'a yükleniyor. Galeri URL alanıyla yetiniyordu ama
   logolarda bu pratik değil: kullanıcının elinde dosya var, barındıracak
   yeri yok. Yükleme zorunlu bir kolaylık.
   ────────────────────────────────────────────────────────────────────────── */

const IZINLI_TIP = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAKS_BAYT = 1024 * 1024; // 1 MB — logo için fazlasıyla yeterli

const markaAlan = z.object({
  id: z.number().int().positive(),
  name: z.string().max(128).optional(),
  linkUrl: z.string().max(2000).optional(),
  visible: z.boolean().optional(),
});

export async function markaGuncelle(girdi: z.input<typeof markaAlan>) {
  await oturumZorunlu();
  const { id, ...alanlar } = markaAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db.update(brands).set(alanlar).where(eq(brands.id, id));
  updateTag(SITE_TAG);
}

export async function markaEkle() {
  await oturumZorunlu();
  const enBuyuk = Math.max(0, ...(await db.select().from(brands)).map((b) => b.sort));
  const [yeni] = await db
    .insert(brands)
    .values({ name: "Yeni marka", logoUrl: "", linkUrl: "", visible: true, sort: enBuyuk + 1 })
    .returning();
  updateTag(SITE_TAG);
  return yeni;
}

export async function markaSil(id: number) {
  await oturumZorunlu();
  const [marka] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);

  // Logo dosyasını da sil — yetim blob bırakma
  if (marka?.logoUrl?.startsWith("https://")) {
    await del(marka.logoUrl).catch(() => {});
  }

  await db.delete(brands).where(eq(brands.id, id));
  updateTag(SITE_TAG);
}

export type YuklemeSonuc = { hata?: string; url?: string };

export async function logoYukle(
  _prev: YuklemeSonuc,
  formData: FormData,
): Promise<YuklemeSonuc> {
  await oturumZorunlu();

  const id = Number(formData.get("id"));
  const dosya = formData.get("logo");

  if (!Number.isInteger(id) || id <= 0) return { hata: "Geçersiz marka." };
  if (!(dosya instanceof File) || dosya.size === 0)
    return { hata: "Dosya seçilmedi." };
  if (!IZINLI_TIP.includes(dosya.type))
    return { hata: "Yalnızca PNG, JPG, SVG veya WEBP yüklenebilir." };
  if (dosya.size > MAKS_BAYT)
    return { hata: `Dosya 1 MB'tan küçük olmalı (şu an ${Math.round(dosya.size / 1024)} KB).` };

  const [marka] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  if (!marka) return { hata: "Marka bulunamadı." };

  const uzanti = dosya.name.split(".").pop()?.toLowerCase() ?? "png";
  const { url } = await put(`markalar/${id}.${uzanti}`, dosya, {
    access: "public",
    // Aynı marka için tekrar yüklenince eskisinin üzerine yazılsın diye
    addRandomSuffix: true,
    contentType: dosya.type,
  });

  // Önceki logoyu temizle
  if (marka.logoUrl?.startsWith("https://") && marka.logoUrl !== url) {
    await del(marka.logoUrl).catch(() => {});
  }

  await db.update(brands).set({ logoUrl: url }).where(eq(brands.id, id));
  updateTag(SITE_TAG);
  return { url };
}
