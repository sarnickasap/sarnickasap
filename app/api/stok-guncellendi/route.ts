import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { SITE_TAG } from "@/lib/data";

/* ──────────────────────────────────────────────────────────────────────────
   Stok programından "ürün/fiyat değişti" bildirimi (K-37).

   POST · Authorization: Bearer <REVALIDATE_TOKEN> → 200 {ok:true}
   Token yoksa, 32 karakterden kısaysa ya da eşleşmiyorsa 401.

   Sözleşme `updateTag` diyor; Next 16'da `updateTag` YALNIZCA server
   action'da çağrılabiliyor. Route handler'daki karşılığı
   `revalidateTag(tag, { expire: 0 })`: bayat içerik sunulmaz, sıradaki
   istek taze veriyi bekler — davranış aynı.
   ────────────────────────────────────────────────────────────────────────── */

const EN_AZ_TOKEN = 32;

function yetkili(baslik: string | null): boolean {
  const beklenen = process.env.REVALIDATE_TOKEN?.trim() ?? "";
  if (beklenen.length < EN_AZ_TOKEN || !baslik?.startsWith("Bearer ")) return false;
  const a = Buffer.from(baslik.slice("Bearer ".length).trim());
  const b = Buffer.from(beklenen);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(istek: Request): Promise<Response> {
  if (!yetkili(istek.headers.get("authorization"))) {
    return Response.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }
  revalidateTag(SITE_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
