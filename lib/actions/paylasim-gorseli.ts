"use server";

import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteInfo } from "@/lib/db/schema";
import { icerikDegisti } from "@/lib/actions/tazelik";
import { gorselDosyasiniDogrula, yuklenenBlobuSil } from "@/lib/gorsel-dogrulama";
import { oturumZorunlu } from "@/lib/session";
import {
  PAYLASIM_MAKS_BAYT,
  PAYLASIM_MAKS_KENAR,
  PAYLASIM_ONEKI,
  paylasimDosyaAdi,
} from "@/lib/paylasim-gorseli-kurali";

/* ──────────────────────────────────────────────────────────────────────────
   Paylaşım görseli (og:image) — SEO sekmesinden yükleme / kaldırma.
   K-38'de "panelde giriş yok" diye açık kalmıştı.

   Galeri yüklemesiyle aynı yol: oturum → dosya doğrulaması (MIME'den
   uzantı, boyut) → sitenin Blob deposu → `site_info.og_image_url`.
   Kayda YALNIZCA `put()`un döndürdüğü Blob adresi yazılır; istemciden
   URL alınmaz. Önceki dosya, kayıt yeni adrese geçtikten sonra silinir.
   ────────────────────────────────────────────────────────────────────────── */

const PAYLASIM_KURALI = {
  izinli: ["image/png", "image/jpeg", "image/webp"],
  maksBayt: PAYLASIM_MAKS_BAYT,
  tipMetni: "JPG, PNG veya WEBP",
} as const;

const olcu = z.coerce.number().int().min(1).max(PAYLASIM_MAKS_KENAR);
const olcuSemasi = z.object({ genislik: olcu, yukseklik: olcu });

export type PaylasimYuklemeSonucu = { hata?: string; url?: string };

async function mevcutAdres(): Promise<string | null> {
  const [bilgi] = await db
    .select({ url: siteInfo.ogImageUrl })
    .from(siteInfo)
    .where(eq(siteInfo.id, 1))
    .limit(1);
  return bilgi?.url ?? null;
}

async function adresiYaz(url: string | null): Promise<void> {
  await db
    .update(siteInfo)
    .set({ ogImageUrl: url, updatedAt: new Date() })
    .where(eq(siteInfo.id, 1));
}

export async function paylasimGorseliYukle(formData: FormData): Promise<PaylasimYuklemeSonucu> {
  await oturumZorunlu();

  const olculer = olcuSemasi.safeParse({
    genislik: formData.get("genislik"),
    yukseklik: formData.get("yukseklik"),
  });
  if (!olculer.success) return { hata: "Görsel ölçüsü okunamadı. Tekrar deneyin." };
  const dogrulama = await gorselDosyasiniDogrula(formData.get("gorsel"), PAYLASIM_KURALI);
  if ("hata" in dogrulama) return dogrulama;
  const { uzanti, dosya } = dogrulama;

  const onceki = await mevcutAdres();
  const { url } = await put(paylasimDosyaAdi(olculer.data, uzanti), dosya, {
    access: "public",
    addRandomSuffix: true,
    contentType: dosya.type,
  });

  await adresiYaz(url);
  if (onceki !== url) await yuklenenBlobuSil(onceki, PAYLASIM_ONEKI);
  await icerikDegisti();
  return { url };
}

/** Görseli kaldırır — site logoya döner. */
export async function paylasimGorseliKaldir(): Promise<void> {
  await oturumZorunlu();
  const onceki = await mevcutAdres();
  await adresiYaz(null);
  await yuklenenBlobuSil(onceki, PAYLASIM_ONEKI);
  await icerikDegisti();
}
