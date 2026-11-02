"use server";

import { eq } from "drizzle-orm";
import { put } from "@vercel/blob";
import { z } from "zod";
import { db } from "@/lib/db";
import { gallery } from "@/lib/db/schema";
import { icerikDegisti } from "@/lib/actions/tazelik";
import { gorselDosyasiniDogrula, yuklenenBlobuSil } from "@/lib/gorsel-dogrulama";
import { oturumZorunlu } from "@/lib/session";
import { GALERI_MAKS_BAYT, GALERI_URL_HATASI, galeriUrlKabul } from "@/lib/galeri-kurali";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri yazma işlemleri (aşama 4 — lib/actions/admin.ts'ten taşındı).

   Sorun: galeri yalnızca URL alıyordu, ama CSP `img-src` dış alan
   adlarını engelliyor — yapıştırılan bağlantı sitede kırık görünüyordu.
   Çözüm: marka logosundaki gibi sitenin kendi Blob deposuna YÜKLEME, ve
   URL alanında yalnızca Blob adresi (sunucuda da doğrulanır).

   Mevcut Blob dışı satırlara DOKUNULMAZ; panel uyarı gösterir, site yer
   tutucu gösterir. Alt yazı düzenlemesi yalnızca `caption` gönderdiği için
   o satırları kaydetmeyi engellemez.
   ────────────────────────────────────────────────────────────────────────── */

const kimlik = z.number().int().positive();

/** Blob klasörü — silme yalnızca bu önekteki dosyaları dener. */
const GALERI_ONEKI = "/galeri/";

/* Boyut sınırı ve gerekçesi: lib/galeri-kurali.ts */
const GALERI_KURALI = {
  izinli: ["image/png", "image/jpeg", "image/webp"],
  maksBayt: GALERI_MAKS_BAYT,
  tipMetni: "PNG, JPG veya WEBP",
} as const;

const galeriAlan = z.object({
  id: kimlik,
  url: z
    .string()
    .max(2000)
    .refine(galeriUrlKabul, GALERI_URL_HATASI)
    .optional(),
  caption: z.string().max(128).optional(),
});

export async function galeriGuncelle(girdi: z.input<typeof galeriAlan>) {
  await oturumZorunlu();
  const { id, ...alanlar } = galeriAlan.parse(girdi);
  if (Object.keys(alanlar).length === 0) return;
  await db.update(gallery).set(alanlar).where(eq(gallery.id, id));
  await icerikDegisti();
}

export async function galeriEkle() {
  await oturumZorunlu();
  // Tasarım: galeri SONA ekleniyor (push) — diğer sekmelerden farklı
  const enBuyuk = Math.max(0, ...(await db.select().from(gallery)).map((g) => g.sort));
  const [yeni] = await db
    .insert(gallery)
    .values({ url: "", caption: "", sort: enBuyuk + 1 })
    .returning();
  await icerikDegisti();
  return yeni;
}

export async function galeriSil(girdiId: number) {
  await oturumZorunlu();
  const id = kimlik.parse(girdiId);
  const [oge] = await db.select().from(gallery).where(eq(gallery.id, id)).limit(1);
  await db.delete(gallery).where(eq(gallery.id, id));
  // Yalnızca bu sitenin galeri klasörüne yüklediği dosya silinir
  await yuklenenBlobuSil(oge?.url, GALERI_ONEKI);
  await icerikDegisti();
}

export type GaleriYuklemeSonucu = { hata?: string; url?: string };

export async function galeriGorselYukle(
  _prev: GaleriYuklemeSonucu,
  formData: FormData,
): Promise<GaleriYuklemeSonucu> {
  await oturumZorunlu();

  const id = kimlik.safeParse(Number(formData.get("id")));
  if (!id.success) return { hata: "Geçersiz galeri öğesi." };
  const dogrulama = await gorselDosyasiniDogrula(formData.get("gorsel"), GALERI_KURALI);
  if ("hata" in dogrulama) return dogrulama;
  const { uzanti, dosya } = dogrulama;

  const [oge] = await db.select().from(gallery).where(eq(gallery.id, id.data)).limit(1);
  if (!oge) return { hata: "Galeri öğesi bulunamadı." };

  const { url } = await put(`galeri/${id.data}.${uzanti}`, dosya, {
    access: "public",
    addRandomSuffix: true,
    contentType: dosya.type,
  });

  await db.update(gallery).set({ url }).where(eq(gallery.id, id.data));
  // Önceki dosya yalnızca kayıt yeni adrese geçtikten sonra silinir
  if (oge.url !== url) await yuklenenBlobuSil(oge.url, GALERI_ONEKI);
  await icerikDegisti();
  return { url };
}
