import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { Firsatlar } from "@/components/site/firsatlar";
import { Urunler } from "@/components/site/urunler";
import {
  aktifFirsatlarGetir,
  calismaSaatleriGetir,
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

  const wa = waLink(info.whatsapp, WA_MESAJ.genelSiparis);

  return (
    <div className="min-h-screen bg-ink text-body">
      <SiteHeader waLink={wa} firsatVar={firsatlar.length > 0} />
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
      {/* B5+ bölümleri buraya gelecek */}
      <div className="h-[600px]" />
    </div>
  );
}
