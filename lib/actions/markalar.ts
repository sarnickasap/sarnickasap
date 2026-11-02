"use server";

import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import { z } from "zod";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { icerikDegisti } from "@/lib/actions/tazelik";
import { oturumZorunlu } from "@/lib/session";
import { gorselDosyasiniDogrula } from "@/lib/gorsel-dogrulama";

/* ──────────────────────────────────────────────────────────────────────────
   Çalıştığımız markalar / üreticiler (K-31) — TASARIMDA YOK.

   Logolar Vercel Blob'a yükleniyor. Galeri URL alanıyla yetiniyordu ama
   logolarda bu pratik değil: kullanıcının elinde dosya var, barındıracak
   yeri yok. Yükleme zorunlu bir kolaylık.
   ────────────────────────────────────────────────────────────────────────── */

/* Dosya doğrulaması (MIME → uzantı, boyut, SVG içerik denetimi — K-32)
   galeriyle ortak: lib/gorsel-dogrulama.ts */
const LOGO_KURALI = {
  izinli: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
  maksBayt: 1024 * 1024, // 1 MB — logo için fazlasıyla yeterli
  tipMetni: "PNG, JPG, SVG veya WEBP",
} as const;

/** Silme/yükleme yolları da güncelleme yolu kadar doğrulanmalı. */
const kimlik = z.number().int().positive();

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
  await icerikDegisti();
}

export async function markaEkle() {
  await oturumZorunlu();
  const enBuyuk = Math.max(0, ...(await db.select().from(brands)).map((b) => b.sort));
  const [yeni] = await db
    .insert(brands)
    .values({ name: "Yeni marka", logoUrl: "", linkUrl: "", visible: true, sort: enBuyuk + 1 })
    .returning();
  await icerikDegisti();
  return yeni;
}

export async function markaSil(girdiId: number) {
  await oturumZorunlu();
  const id = kimlik.parse(girdiId);
  const [marka] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);

  // Logo dosyasını da sil — yetim blob bırakma
  if (marka?.logoUrl?.startsWith("https://")) {
    await del(marka.logoUrl).catch(() => {});
  }

  await db.delete(brands).where(eq(brands.id, id));
  await icerikDegisti();
}

export type YuklemeSonuc = { hata?: string; url?: string };

export async function logoYukle(
  _prev: YuklemeSonuc,
  formData: FormData,
): Promise<YuklemeSonuc> {
  await oturumZorunlu();

  const idHam = Number(formData.get("id"));

  if (!kimlik.safeParse(idHam).success) return { hata: "Geçersiz marka." };
  const id = idHam;
  const dogrulama = await gorselDosyasiniDogrula(formData.get("logo"), LOGO_KURALI);
  if ("hata" in dogrulama) return dogrulama;
  const { uzanti, dosya } = dogrulama;

  const [marka] = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  if (!marka) return { hata: "Marka bulunamadı." };

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
  await icerikDegisti();
  return { url };
}
