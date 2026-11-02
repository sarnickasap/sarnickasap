import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Firsatlar } from "@/components/site/firsatlar";
import { Urunler } from "@/components/site/urunler";
import { Hakkimizda } from "@/components/site/hakkimizda";
import { Galeri } from "@/components/site/galeri";
import { Markalar } from "@/components/site/markalar";
import { Yorumlar } from "@/components/site/yorumlar";
import { Iletisim } from "@/components/site/iletisim";
import { SiteFooter } from "@/components/site/footer";
import { GoruntuyeGirince } from "@/components/site/goruntuye-girince";
import {
  aktifFirsatlarGetir,
  calismaSaatleriGetir,
  galeriGetir,
  markalarGetir,
  gorunurYorumlarGetir,
  kategorilerGetir,
  siteBilgisiGetir,
  urunlerGetir,
} from "@/lib/data";
import { WA_MESAJ, telLink, waLink } from "@/lib/format";
import { guvenliJsonLd, yapilandirilmisVeri } from "@/lib/seo";
import { katalogGetir } from "@/lib/stok";
import {
  dbUrunleri,
  guncellemeMetni,
  katalogKategorileri,
  katalogUrunleri,
  siparisAlinir,
} from "@/lib/urun-kaynagi";

export default async function AnaSayfa() {
  const [info, firsatlar, saatler, dbUrun, dbKategori, katalog] = await Promise.all([
    siteBilgisiGetir(),
    aktifFirsatlarGetir(),
    calismaSaatleriGetir(),
    urunlerGetir(),
    kategorilerGetir(),
    katalogGetir(),
  ]);
  const [galeri, yorumlar, markalar] = await Promise.all([
    galeriGetir(),
    gorunurYorumlarGetir(),
    markalarGetir(),
  ]);

  const wa = waLink(info.whatsapp, WA_MESAJ.genelSiparis);
  const jsonLd = await yapilandirilmisVeri(katalog);

  /* Ürün kaynağı (K-37): stok programı kataloğu varsa o, yoksa site DB'si.
     Sipariş yalnızca katalog varken ve stok programı açık dediğinde. */
  const siparisAcik = siparisAlinir(katalog);
  const urunler = katalog ? katalogUrunleri(katalog) : dbUrunleri(dbUrun);
  const kategoriler = katalog
    ? katalogKategorileri(katalog)
    : dbKategori.map((k) => k.name);

  return (
    <div className="min-h-screen bg-ink text-body">
      {/* schema.org LocalBusiness — adres, telefon ve çalışma saatleri
          panelden gelir, ikinci bir yerde elle güncellenmez (K-11). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: guvenliJsonLd(jsonLd) }}
      />
      <SiteHeader
        waLink={wa}
        firsatVar={firsatlar.length > 0}
        yorumVar={yorumlar.length > 0}
        sepetVar={siparisAcik}
      />

      {/* ⚠️ TASARIM SAPMASI (K-33, kullanıcı onayı ile).
          Tasarım kaynağında (Sarnic Kasap.dc.html) `<main>` YOK — yalnızca
          header, nav, section'lar ve footer var. Admin tasarımında var.

          Eklendi çünkü ekran okuyucu kullanıcısının ana içeriğe atlayacağı
          bir landmark'ı yoktu. `<main>` tarayıcıda yalnızca `display: block`
          demek; bölümler zaten blok akışında olduğu için DÜZEN DEĞİŞMİYOR —
          ölçüldü, dört genişlikte birebir aynı (bkz. 07 - Görsel Karşılaştırma).

          `id` ileride "içeriğe atla" bağlantısı istenirse hedef olsun diye. */}
      <main id="ana-icerik">
        <Hero
          heroTitle={info.heroTitle}
          heroSub={info.heroSub}
          phone={info.phone}
          waLink={wa}
          telLink={telLink(info.whatsapp)}
          saatler={saatler}
        />
        {/* B3+ bölümleri buraya gelecek */}
        <GoruntuyeGirince>
          <Firsatlar firsatlar={firsatlar} whatsapp={info.whatsapp} />
        </GoruntuyeGirince>
        <GoruntuyeGirince>
          <Urunler
            urunler={urunler}
            kategoriler={kategoriler}
            whatsapp={info.whatsapp}
            katalog={
              katalog && {
                guncelleme: guncellemeMetni(katalog.updatedAt),
                kdvDahil: katalog.vatIncluded,
                siparisAcik,
              }
            }
          />
        </GoruntuyeGirince>
        <GoruntuyeGirince>
          <Hakkimizda about={info.about} />
        </GoruntuyeGirince>
        <GoruntuyeGirince>
          <Markalar markalar={markalar} />
        </GoruntuyeGirince>
        <GoruntuyeGirince>
          <Galeri ogeler={galeri} />
        </GoruntuyeGirince>
        <GoruntuyeGirince>
          <Yorumlar yorumlar={yorumlar} />
        </GoruntuyeGirince>
        <Iletisim
          address={info.address}
          phone={info.phone}
          telLink={telLink(info.whatsapp)}
          waLink={wa}
          saatler={saatler}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
