import { asc, eq } from "drizzle-orm";
import { oturumZorunlu } from "@/lib/session";
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
import { Panel } from "@/components/admin/panel";

export const instant = false;

export default async function PanelSayfasi() {
  await oturumZorunlu();

  const [urunler, kategoriler, firsatlar, galeriOgeleri, yorumlar, bilgiler, saatler] =
    await Promise.all([
      db
        .select({
          id: products.id,
          name: products.name,
          categoryId: products.categoryId,
          price: products.price,
          note: products.note,
          stock: products.stock,
        })
        .from(products)
        .orderBy(asc(products.sort)),
      db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.sort)),
      // Admin'de TÜMÜ listelenir; sayaçlar aktif/görünür olanı sayar
      db.select().from(deals).orderBy(asc(deals.sort)),
      db.select().from(gallery).orderBy(asc(gallery.sort)),
      db.select().from(reviews).orderBy(asc(reviews.sort)),
      db.select().from(siteInfo).where(eq(siteInfo.id, 1)),
      db.select().from(hours).orderBy(asc(hours.dayIndex)),
    ]);

  return (
    <Panel
      veri={{
        urunler,
        kategoriler,
        firsatlar,
        galeri: galeriOgeleri,
        yorumlar,
        bilgi: bilgiler[0],
        saatler,
      }}
    />
  );
}
