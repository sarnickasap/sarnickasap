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

/* MIME tipi → uzanti eşlemesi (K-32).

   Önce `dosya.name.split(".").pop()` kullanılıyordu; yani uzanti TARAYICIDAN
   gelen bir isme güveniyordu. Taramada `logo.noext` adlı bir dosya
   `markalar/5.noext` olarak yüklendi — depodaki yolu saldırganın seçtiği bir
   dize belirliyordu. Artık uzanti yalnızca DOĞRULANMIŞ MIME tipinden
   türetiliyor; dosya adı hiç kullanılmıyor. */
const IZINLI: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};
const MAKS_BAYT = 1024 * 1024; // 1 MB — logo için fazlasıyla yeterli

/* ── SVG içerik denetimi (K-32) ──
   Ölçüm: Vercel Blob bir SVG'yi `content-type: image/svg+xml` +
   `content-disposition: inline` ile sunuyor. Yani blob adresi doğrudan
   açılırsa SVG içindeki <script> ÇALIŞIR.

   Etki neden düşük: o origin `*.public.blob.vercel-storage.com`, bu sitenin
   origin'i değil — sarnickasap.com çerezlerine veya DOM'una erişemez. Ayrıca
   yükleme yalnızca girişli yöneticiye açık.

   Bu denetim tam bir sanitizer DEĞİL, derinlemesine savunma: script, olay
   işleyicileri ve dış kaynak çağrıları içeren SVG reddedilir. Logolar bu
   yapıların hiçbirine ihtiyaç duymaz, dolayısıyla meşru dosya engellenmez. */
const SVG_YASAK = /<script|<foreignObject|<iframe|\son\w+\s*=|javascript:|<!ENTITY|<use[^>]+href\s*=\s*["']?(?:https?:)?\/\//i;

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
  const uzanti = IZINLI[dosya.type];
  if (!uzanti) return { hata: "Yalnızca PNG, JPG, SVG veya WEBP yüklenebilir." };
  if (dosya.size > MAKS_BAYT)
    return { hata: `Dosya 1 MB'tan küçük olmalı (şu an ${Math.round(dosya.size / 1024)} KB).` };

  if (dosya.type === "image/svg+xml") {
    const metin = await dosya.text();
    if (SVG_YASAK.test(metin))
      return {
        hata: "Bu SVG betik veya dış kaynak içeriyor; güvenlik için reddedildi. PNG olarak yükleyin.",
      };
  }

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
  updateTag(SITE_TAG);
  return { url };
}
