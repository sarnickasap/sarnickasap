import { SiteHeader } from "@/components/site/header";
import { aktifFirsatlarGetir, siteBilgisiGetir } from "@/lib/data";
import { WA_MESAJ, waLink } from "@/lib/format";

export default async function AnaSayfa() {
  const [info, firsatlar] = await Promise.all([
    siteBilgisiGetir(),
    aktifFirsatlarGetir(),
  ]);

  return (
    <div className="min-h-screen bg-ink text-body">
      <SiteHeader
        waLink={waLink(info.whatsapp, WA_MESAJ.genelSiparis)}
        firsatVar={firsatlar.length > 0}
      />
      {/* B2+ bölümleri buraya gelecek */}
      <div className="h-[1200px]" />
    </div>
  );
}
