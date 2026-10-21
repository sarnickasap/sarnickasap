import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import {
  aktifFirsatlarGetir,
  calismaSaatleriGetir,
  siteBilgisiGetir,
} from "@/lib/data";
import { WA_MESAJ, telLink, waLink } from "@/lib/format";

export default async function AnaSayfa() {
  const [info, firsatlar, saatler] = await Promise.all([
    siteBilgisiGetir(),
    aktifFirsatlarGetir(),
    calismaSaatleriGetir(),
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
      {/* B3+ bölümleri buraya gelecek */}
      <div className="h-[600px]" />
    </div>
  );
}
