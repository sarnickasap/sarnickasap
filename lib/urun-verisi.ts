import "server-only";
import type { UrunVerisi } from "@/components/site/urun-karti";
import { kategorilerGetir, urunlerGetir } from "@/lib/data";
import { katalogGetir, stokProgramiTanimli } from "@/lib/stok";
import type { Katalog } from "@/lib/stok-sema";
import {
  dbUrunleri,
  katalogKategorileri,
  katalogUrunleri,
  siparisAlinir,
} from "@/lib/urun-kaynagi";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün kaynağı — ana sayfa, kategori sayfaları ve sitemap için TEK yer
   (aşama 4; önce yalnızca app/page.tsx'teydi).

   K-37 kuralı aynen: stok programı kataloğu varsa ve en az bir ürünü
   varsa o; yoksa sitenin kendi veritabanı (sipariş kapalı). Her alt çağrı
   `use cache` + `site-data` etiketli — üç sayfa aynı önbelleği paylaşır.
   ────────────────────────────────────────────────────────────────────────── */

export type UrunKaynagi = {
  /** Kullanılan katalog; DB yedeğindeyse null */
  katalog: Katalog | null;
  urunler: UrunVerisi[];
  kategoriler: string[];
  siparisAcik: boolean;
  /** Stok programı tanımlı ama katalog yok: fiyat gösterilmez (örnek fiyat sızmasın). */
  fiyatlarYok: boolean;
};

export async function urunKaynagiGetir(): Promise<UrunKaynagi> {
  const [dbUrun, dbKategori, hamKatalog] = await Promise.all([
    urunlerGetir(),
    kategorilerGetir(),
    katalogGetir(),
  ]);
  /* Stok programında henüz "sitede göster" işaretli ürün yoksa katalog boş
     gelir; site boş liste göstermesin diye o durumda da site DB'sine dönülür. */
  const katalog = hamKatalog && hamKatalog.products.length > 0 ? hamKatalog : null;
  /* Site DB'sindeki ürünler yalnızca stok programı hiç tanımlı değilse (yerel
     geliştirme/test) gösterilir. Canlıda katalog alınamazsa o fiyatlar eski ya da
     örnek olabilir; müşteriye gerçek fiyat gibi sunulmaz. Kategoriler kalır ki
     kategori sayfaları ve footer bağlantıları çalışsın. */
  const fiyatlarYok = !katalog && stokProgramiTanimli();

  return {
    katalog,
    fiyatlarYok,
    urunler: katalog ? katalogUrunleri(katalog) : fiyatlarYok ? [] : dbUrunleri(dbUrun),
    kategoriler: katalog ? katalogKategorileri(katalog) : dbKategori.map((k) => k.name),
    siparisAcik: siparisAlinir(katalog),
  };
}
