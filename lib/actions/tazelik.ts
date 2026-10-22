import "server-only";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { siteInfo } from "@/lib/db/schema";
import { SITE_TAG } from "@/lib/data";

/* Önbelleği tazele + içerik tazelik damgasını ilerlet.

   `app/sitemap.ts` `lastModified` olarak `site_info.updated_at` kullanıyor.
   Bu damga yalnızca `bilgiGuncelle` tarafından yazılıyordu; ürün, fiyat,
   fırsat, galeri, yorum ve marka değişiklikleri sayfayı değiştirdiği hâlde
   sitemap "değişmedi" diyordu. Her içerik yazmasından sonra çağrılır. */
export async function icerikDegisti() {
  /* Önbellek tazelemesi ANINDA — kullanıcı değişikliği sitede hemen görmeli. */
  updateTag(SITE_TAG);

  /* Tazelik damgası YANITTAN SONRA yazılıyor.

     İlk sürümde damga `await` ile yazılıyordu ve her panel kaydına İKİNCİ
     bir Neon gidiş dönüşü ekliyordu — kaydetme gecikmesi neredeyse iki
     katına çıktı. Ölçüldü: sabit beklemeli testler bu yüzden düşmeye
     başladı, yani kullanıcı da yavaşlamayı hissederdi.

     Damga yalnızca `sitemap.xml` `lastModified` için; bir isteklik gecikme
     tamamen zararsız. `after()` işi yanıt gönderildikten sonra çalıştırır,
     böylece kullanıcı beklemez.

     Hata yutulmuyor ama kaydı da düşürmüyor: damga yazılamazsa sitemap
     tazeliği bir tur geride kalır, kullanıcının verisi etkilenmez. */
  after(async () => {
    try {
      await db
        .update(siteInfo)
        .set({ updatedAt: new Date() })
        .where(eq(siteInfo.id, 1));
    } catch (e) {
      console.error("Tazelik damgası yazılamadı:", e);
    }
  });
}
