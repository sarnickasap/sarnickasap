import { cacheLife } from "next/cache";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { istanbulYili } from "@/lib/saatler";
import { kategoriOzetleri, type KategoriOzeti } from "@/lib/urun-kaynagi";
import { urunKaynagiGetir } from "@/lib/urun-verisi";

/* ──────────────────────────────────────────────────────────────────────────
   Site Footer — vault "Site Footer" notundan birebir.

     footer  1px #1f1f1f ÜST kenarlık
     iç      max-w 1280 · mx-auto · p 32px 24px
             flex · flex-wrap · justify-between · items-center · gap16
             13px · #737373 (K-21 → #8a8a8a)
     sol     flex items-center gap12
             img 32×31 object-contain · alt="" (dekoratif)
             "© 2026 Sarnıç Kasap · Gaziemir, İzmir"
     sağ     "Yönetim" → #737373, hover #fafafa

   Yıl dinamik: tasarımda sabit "2026" yazıyordu; site yıllarca yaşayacağı
   için 1 Ocak'ta eskimemesi gerekiyor. `use cache` + günlük tazeleme ile
   prerender'a sabitlenmesi engellendi (Next 16 `new Date()`'i prerender'da
   kabul etmiyor). Bugün 2026 olduğu için tasarımla aynı görünüyor.

   "Kategoriler" satırı — TASARIMDA YOK (K-39). Kategori sayfalarına
   sunucuda üretilen, taranabilir bağlantılar; ana sayfadaki sekme
   bağlantısı yalnızca tıklamadan sonra çıkıyordu. Kaynak sitemap ve
   generateStaticParams ile aynı (`urunKaynagiGetir` + `kategoriOzetleri`).
   Footer'ın 13px / #8a8a8a dili; `basis-full` ile kendi satırında,
   altındaki logo/© ve "Yönetim" satırı aynen kalır. Medya sorgusu yok:
   bağlantılar flex-wrap ile alt satıra iner.
   `prefetch={false}`: footer her sayfada görünür olunca 7+ RSC ön
   yüklemesi tetikliyordu (mobil veri + ISR yükü); tarayıcı yeniden
   yüklemesinde bu istekler açık kalıp `networkidle`'ı da kilitliyordu
   (admin-galeri zaman aşımı, ölçüldü). Tarayıcılar için bağlantı aynı.
   ────────────────────────────────────────────────────────────────────────── */

const FOOTER_BAGLANTI =
  "text-muted-dark transition-colors duration-150 ease-out-soft hover:text-body";

async function yilGetir() {
  "use cache";
  cacheLife("days");
  /* Europe/Istanbul'a sabit. Ham `new Date().getFullYear()` sunucu UTC'de
     çalıştığı için 1 Ocak 00:00–03:00 (TR) arası ESKİ yılı gösteriyordu —
     oysa açık/kapalı durumu ve saat tablosu Istanbul'a sabitlenmişti.
     Yılda üç saatlik bir tutarsızlık; izleyici kitlesi Türkiye'de. */
  return istanbulYili();
}

function KategoriBaglantilari({
  kategoriler,
}: {
  kategoriler: KategoriOzeti[];
}) {
  if (kategoriler.length === 0) return null;
  return (
    <nav
      aria-labelledby="footer-kategoriler"
      className="flex basis-full flex-wrap items-baseline gap-x-16 gap-y-8"
    >
      <h2
        id="footer-kategoriler"
        className="m-0 text-13 font-medium text-muted"
      >
        Kategoriler
      </h2>
      <ul className="m-0 flex flex-wrap gap-x-16 gap-y-8 p-0 list-none">
        {kategoriler.map((k) => (
          <li key={k.slug}>
            <Link
              href={`/urunler/${k.slug}`}
              prefetch={false}
              className={FOOTER_BAGLANTI}
            >
              {k.ad}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function SiteFooter() {
  const [yil, kaynak] = await Promise.all([yilGetir(), urunKaynagiGetir()]);
  const kategoriler = kategoriOzetleri(kaynak.kategoriler);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-16 px-24 py-32 text-13 text-muted-dark">
        <KategoriBaglantilari kategoriler={kategoriler} />
        <div className="flex items-center gap-12">
          <Logo
            genislik={32}
            yukseklik={31}
            alt=""
            className="h-31 w-32 object-contain"
          />
          <span>© {yil} Sarnıç Kasap · Gaziemir, İzmir</span>
        </div>
        <a href="/yonetim" className={FOOTER_BAGLANTI}>
          Yönetim
        </a>
      </div>
    </footer>
  );
}
