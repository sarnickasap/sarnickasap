import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Firsatlar } from "@/components/site/firsatlar";
import { Urunler } from "@/components/site/urunler";
import { Hakkimizda } from "@/components/site/hakkimizda";
import { Galeri } from "@/components/site/galeri";
import { Yorumlar } from "@/components/site/yorumlar";
import { Iletisim } from "@/components/site/iletisim";
import { SiteFooter } from "@/components/site/footer";
import {
  aktifFirsatlarGetir,
  calismaSaatleriGetir,
  galeriGetir,
  gorunurYorumlarGetir,
  kategorilerGetir,
  siteBilgisiGetir,
  urunlerGetir,
} from "@/lib/data";
import { WA_MESAJ, telLink, waLink } from "@/lib/format";

export default async function AnaSayfa() {
  const [info, firsatlar, saatler, urunler, kategoriler] = await Promise.all([
    siteBilgisiGetir(),
    aktifFirsatlarGetir(),
    calismaSaatleriGetir(),
    urunlerGetir(),
    kategorilerGetir(),
  ]);
  const [galeri, yorumlar] = await Promise.all([
    galeriGetir(),
    gorunurYorumlarGetir(),
  ]);

  const wa = waLink(info.whatsapp, WA_MESAJ.genelSiparis);

  return (
    <div className="min-h-screen bg-ink text-body">
      <SiteHeader waLink={wa} firsatVar={firsatlar.length > 0}
        yorumVar={yorumlar.length > 0} />
      <Hero
        heroTitle={info.heroTitle}
        heroSub={info.heroSub}
        phone={info.phone}
        waLink={wa}
        telLink={telLink(info.whatsapp)}
        saatler={saatler}
      />
      {/* B3+ bölümleri buraya gelecek */}
      <Firsatlar firsatlar={firsatlar} whatsapp={info.whatsapp} />
      <Urunler
        urunler={urunler}
        kategoriler={kategoriler.map((k) => k.name)}
        whatsapp={info.whatsapp}
      />
      <Hakkimizda about={info.about} />
      <Galeri ogeler={galeri} />
      <Yorumlar yorumlar={yorumlar} />
      <Iletisim
        address={info.address}
        phone={info.phone}
        telLink={telLink(info.whatsapp)}
        waLink={wa}
        saatler={saatler}
      />
      <SiteFooter />
    </div>
  );
}
