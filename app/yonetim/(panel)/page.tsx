import { asc, eq } from "drizzle-orm";
import { oturumZorunlu } from "@/lib/session";
import { db } from "@/lib/db";
import { categories, deals, gallery, products, reviews } from "@/lib/db/schema";
import { Panel } from "@/components/admin/panel";

export const instant = false;

export default async function PanelSayfasi() {
  await oturumZorunlu();

  const [urunler, kategoriler, aktifFirsatlar, galeriOgeleri, gorunurYorumlar] =
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
      db.select().from(deals).where(eq(deals.active, true)),
      db.select().from(gallery),
      db.select().from(reviews).where(eq(reviews.visible, true)),
    ]);

  return (
    <Panel
      veri={{
        urunler,
        kategoriler,
        firsatSayisi: aktifFirsatlar.length,
        galeriSayisi: galeriOgeleri.length,
        yorumSayisi: gorunurYorumlar.length,
      }}
    />
  );
}
