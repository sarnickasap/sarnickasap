import "server-only";
import { asc, eq } from "drizzle-orm";
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

/* ──────────────────────────────────────────────────────────────────────────
   Site veri erişimi.

   Hepsi `use cache` + `cacheTag` ile işaretli: site statik hızda sunulur,
   admin panelinden yazma olduğunda `updateTag("site-data")` ile anında
   tazelenir. Tasarımdaki `sarnic-update` CustomEvent'inin sunucu karşılığı.
   ────────────────────────────────────────────────────────────────────────── */

export const SITE_TAG = "site-data";

export async function siteBilgisiGetir() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag(SITE_TAG);

  const [info] = await db.select().from(siteInfo).where(eq(siteInfo.id, 1));
  return info;
}

export async function calismaSaatleriGetir() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag(SITE_TAG);

  return db.select().from(hours).orderBy(asc(hours.dayIndex));
}

export async function kategorilerGetir() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag(SITE_TAG);

  return db.select().from(categories).orderBy(asc(categories.sort));
}

export async function urunlerGetir() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag(SITE_TAG);

  return db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      note: products.note,
      stock: products.stock,
      sort: products.sort,
      cat: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.sort));
}

/** Yalnızca YAYINDAKİ fırsatlar — tasarım `deals.filter(x => x.active)` yapıyor. */
export async function aktifFirsatlarGetir() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag(SITE_TAG);

  return db
    .select()
    .from(deals)
    .where(eq(deals.active, true))
    .orderBy(asc(deals.sort));
}

export async function galeriGetir() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag(SITE_TAG);

  return db.select().from(gallery).orderBy(asc(gallery.sort));
}

/** Yalnızca GÖRÜNÜR yorumlar — tasarım `reviews.filter(r => r.visible)` yapıyor. */
export async function gorunurYorumlarGetir() {
  "use cache";
  const { cacheTag } = await import("next/cache");
  cacheTag(SITE_TAG);

  return db
    .select()
    .from(reviews)
    .where(eq(reviews.visible, true))
    .orderBy(asc(reviews.sort));
}
