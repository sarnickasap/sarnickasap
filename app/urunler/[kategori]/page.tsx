import { BreadcrumbItem, Breadcrumbs } from "@astryxdesign/core/Breadcrumbs";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AltSayfa } from "@/components/site/alt-sayfa";
import { UrunIzgarasi } from "@/components/site/urun-izgarasi";
import { siteBilgisiGetir } from "@/lib/data";
import { altSayfaMetadata, guvenliJsonLd, kanonikAdres, SITE_URL } from "@/lib/seo";
import { kategoriJsonLd } from "@/lib/seo-urun";
import { guncellemeMetni, kategoriOzetleri, type KategoriOzeti } from "@/lib/urun-kaynagi";
import { urunKaynagiGetir, type UrunKaynagi } from "@/lib/urun-verisi";
import { FiyatlarGuncelleniyor } from "@/components/site/fiyatlar-guncelleniyor";

/* ──────────────────────────────────────────────────────────────────────────
   Kategori sayfası — yerel SEO (aşama 4). TASARIMDA YOK; alt sayfa kabuğu
   (/kvkk, /sepet ile aynı) + ana sayfanın ürün ızgarası.

   Adres: /urunler/<turkceSlug(kategori)> — kural lib/slug.ts'te.
   Kaynak ana sayfayla aynı (lib/urun-verisi.ts): stok kataloğu ya da DB.
   Bilinmeyen kategori → 404. generateStaticParams derlemedeki
   kategorileri önceden üretir; sonradan eklenen kategori ilk ziyarette
   üretilip önbelleğe alınır (Cache Components ISR).

   Astryx: Breadcrumbs, Text, Heading, VStack/HStack, Button (kategori
   pilleri — bağlantı), Link ("Ana sayfaya dön").
   ────────────────────────────────────────────────────────────────────────── */

/* Sayfanın tamamı statik olmak ZORUNDA (her veri `use cache`'li). Yan
   etkisi istenen şey: listede olmayan bir slug'da Next ilk isteği tam
   render bitene kadar bekletir; böylece `notFound()` akış başlamadan
   çalışır ve yanıt gerçekten 404 olur. Bu olmadan kök `loading.tsx`
   sınırı yüzünden kabuk 200 ile gidiyor, 404 yalnızca `noindex` meta
   etiketine dönüşüyordu (ölçüldü). */
export const ensureStatic = "navigation";

/** Cache Components boş dizi kabul etmiyor; kategori yoksa bu (404 olur). */
const KATEGORISIZ_YER_TUTUCU = "kategori";

const BAGLANTI =
  "text-14 text-cream underline-offset-2 transition-colors duration-150 ease-out-soft hover:text-white";

const KATEGORI_PILI =
  "h-38 rounded-pill border border-edge bg-transparent px-16 text-14 font-medium text-soft hover:bg-hover hover:text-white";

export async function generateStaticParams(): Promise<{ kategori: string }[]> {
  const { kategoriler } = await urunKaynagiGetir();
  const ozetler = kategoriOzetleri(kategoriler);
  return ozetler.length > 0
    ? ozetler.map((k) => ({ kategori: k.slug }))
    : [{ kategori: KATEGORISIZ_YER_TUTUCU }];
}

type Bulunan = { kaynak: UrunKaynagi; secili: KategoriOzeti; tumu: KategoriOzeti[] };

async function kategoriBul(slug: string): Promise<Bulunan | null> {
  const kaynak = await urunKaynagiGetir();
  const tumu = kategoriOzetleri(kaynak.kategoriler);
  const secili = tumu.find((k) => k.slug === slug);
  return secili ? { kaynak, secili, tumu } : null;
}

function aciklamaMetni(ad: string): string {
  return `${ad} fiyatları: Sarnıç Kasap, Gaziemir / İzmir. Günlük taze ${ad.toLocaleLowerCase("tr-TR")} ürünleri, güncel kilo ve adet fiyatları; dükkândan alın ya da sipariş verin.`;
}

export async function generateMetadata({
  params,
}: PageProps<"/urunler/[kategori]">): Promise<Metadata> {
  const { kategori } = await params;
  const [bulunan, info] = await Promise.all([kategoriBul(kategori), siteBilgisiGetir()]);
  if (!bulunan) return { title: "Sayfa bulunamadı", robots: { index: false, follow: true } };
  const { ad, slug } = bulunan.secili;
  return altSayfaMetadata({
    baslik: `${ad} fiyatları — Sarnıç Kasap Gaziemir`,
    aciklama: aciklamaMetni(ad),
    yol: `/urunler/${slug}`,
    ogImageUrl: info.ogImageUrl,
    mutlakBaslik: true,
  });
}

function Giris({ ad, kaynak }: { ad: string; kaynak: UrunKaynagi }) {
  const kucuk = ad.toLocaleLowerCase("tr-TR");
  return (
    <>
      <Text as="p" color="inherit" type="inherit">
        Gaziemir’deki dükkânımızda günlük hazırlanan {kucuk} ürünleri ve güncel fiyatları.{" "}
        {kaynak.siparisAcik
          ? "Sepete ekleyip gel-al ya da eve teslim sipariş verebilir, dilerseniz WhatsApp’tan yazabilirsiniz."
          : "İstediğiniz kesim ve gramajı WhatsApp’tan yazın ya da dükkâna uğrayın."}
      </Text>
      {kaynak.katalog && (
        <Text as="p" display="block" className="mt-8 text-12 text-muted-dark">
          {kaynak.katalog.vatIncluded ? "Fiyatlar KDV dahildir · " : ""}Son güncelleme:{" "}
          {guncellemeMetni(kaynak.katalog.updatedAt)}
        </Text>
      )}
    </>
  );
}

function SayfaYolu({ ad }: { ad: string }) {
  return (
    <Breadcrumbs label="Sayfa yolu" variant="supporting">
      <BreadcrumbItem href="/">Ana sayfa</BreadcrumbItem>
      <BreadcrumbItem isCurrent>{ad} fiyatları</BreadcrumbItem>
    </Breadcrumbs>
  );
}

function DigerKategoriler({ tumu, seciliSlug }: { tumu: KategoriOzeti[]; seciliSlug: string }) {
  const digerleri = tumu.filter((k) => k.slug !== seciliSlug);
  if (digerleri.length === 0) return null;
  return (
    <VStack as="nav" aria-label="Diğer kategoriler" gap={3}>
      <Heading level={2} className="font-display text-20 font-semibold text-cream">Diğer kategoriler</Heading>
      <HStack as="ul" wrap="wrap" gap={2} className="m-0 list-none p-0">
        {digerleri.map((k) => (
          <li key={k.slug}>
            <Button size="lg" label={k.ad} href={`/urunler/${k.slug}`} className={KATEGORI_PILI} />
          </li>
        ))}
      </HStack>
    </VStack>
  );
}

export default async function KategoriSayfasi({ params }: PageProps<"/urunler/[kategori]">) {
  const { kategori } = await params;
  const [bulunan, info] = await Promise.all([kategoriBul(kategori), siteBilgisiGetir()]);
  if (!bulunan) notFound();

  const { kaynak, secili, tumu } = bulunan;
  const urunler = kaynak.urunler.filter((u) => u.cat === secili.ad);
  const jsonLd = kategoriJsonLd({
    ad: secili.ad,
    url: kanonikAdres(`/urunler/${secili.slug}`),
    anaSayfa: SITE_URL,
    urunler,
    kdvDahil: kaynak.katalog?.vatIncluded ?? true,
  });

  return (
    <AltSayfa
      ust="Ürünler ve fiyatlar"
      baslik={`${secili.ad} fiyatları`}
      aciklama={<Giris ad={secili.ad} kaynak={kaynak} />}
      sepetVar={kaynak.siparisAcik}
      ustBilgi={<SayfaYolu ad={secili.ad} />}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: guvenliJsonLd(jsonLd) }} />
      {kaynak.fiyatlarYok ? (
        <FiyatlarGuncelleniyor whatsapp={info.whatsapp} />
      ) : (
        <UrunIzgarasi urunler={urunler} whatsapp={info.whatsapp} siparisAcik={kaynak.siparisAcik} />
      )}
      <DigerKategoriler tumu={tumu} seciliSlug={secili.slug} />
      <Link href="/" hasUnderline weight="medium" color="inherit" className={`${BAGLANTI} w-fit`}>
        ← Ana sayfaya dön
      </Link>
    </AltSayfa>
  );
}
