import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { cacheLife } from "next/cache";
import { Logo } from "@/components/logo";
import { istanbulYili } from "@/lib/saatler";
import { YASAL_BILGI } from "@/lib/yasal-bilgi";
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
     sağ     "KVKK aydınlatma metni" bağlantısı (eski "Yönetim" yerine)

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

   Astryx: Link (bağlantılar; LinkProvider → next/link, `prefetch={false}`
   kalan nitelik olarak next/link'e geçer) · Heading · Text · HStack.
   <footer>/<nav> yerli öğe: landmark'lar ve testteki
   `footer nav[aria-labelledby="footer-kategoriler"]` seçicisi.
   Yasal kimlik satırı (Meta işletme doğrulaması) metni DEĞİŞTİRİLMEDİ ve
   her sayfada görünür kalır (alt-sayfa.tsx da bu footer'ı kullanır).
   ────────────────────────────────────────────────────────────────────────── */

const FOOTER_BAGLANTI =
  "text-muted-dark no-underline transition-colors duration-150 ease-out-soft hover:text-body";

/** `prefetch={false}` Astryx Link tiplerinde yok; bileşen kalan nitelikleri
 *  LinkProvider'daki next/link'e aktarıyor (bkz. yukarıdaki not). */
const ON_YUKLEME_YOK = { prefetch: false } as object;

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
      <Heading
        level={2}
        id="footer-kategoriler"
        weight="medium"
        className="m-0 font-sans text-13 text-muted"
      >
        Kategoriler
      </Heading>
      <HStack as="ul" wrap="wrap" className="m-0 list-none gap-x-16 gap-y-8 p-0">
        {kategoriler.map((k) => (
          <li key={k.slug}>
            <Link
              href={`/urunler/${k.slug}`}
              color="inherit"
              type="inherit"
              className={FOOTER_BAGLANTI}
              {...ON_YUKLEME_YOK}
            >
              {k.ad}
            </Link>
          </li>
        ))}
      </HStack>
    </nav>
  );
}

export async function SiteFooter() {
  const [yil, kaynak] = await Promise.all([yilGetir(), urunKaynagiGetir()]);
  const kategoriler = kategoriOzetleri(kaynak.kategoriler);

  return (
    <footer className="border-t border-line">
      <HStack
        wrap="wrap"
        vAlign="center"
        justify="between"
        gap={4}
        className="mx-auto max-w-[1280px] px-24 py-32 text-13 text-muted-dark"
      >
        <KategoriBaglantilari kategoriler={kategoriler} />
        <HStack vAlign="center" gap={3}>
          <Logo
            genislik={32}
            yukseklik={31}
            alt=""
            className="h-31 w-32 object-contain"
          />
          <Text type="inherit" color="inherit">
            © {yil} Sarnıç Kasap · Gaziemir, İzmir
          </Text>
        </HStack>
        {/* "Yönetim" bağlantısı kaldırıldı: panel /yonetim adresinden açılır,
            müşteriye gösterilmez. Yerine KVKK aydınlatma metni (her sayfadan
            erişilebilir olmalı). */}
        <Link
          href="/kvkk"
          color="inherit"
          type="inherit"
          className={FOOTER_BAGLANTI}
          {...ON_YUKLEME_YOK}
        >
          KVKK aydınlatma metni
        </Link>
        {/* Resmi kimlik (Meta işletme doğrulaması resmi adı sitede arar) */}
        <Text as="p" type="inherit" color="inherit" className="m-0 basis-full">
          {YASAL_BILGI.isyeriAdi} — {YASAL_BILGI.adSoyad} · {YASAL_BILGI.adres}{" "}
          · {YASAL_BILGI.vergiDairesi} {YASAL_BILGI.vergiNo} · Esnaf Sicil No{" "}
          {YASAL_BILGI.esnafSicilNo}
        </Text>
      </HStack>
    </footer>
  );
}
