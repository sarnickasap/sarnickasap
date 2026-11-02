import type { Metadata } from "next";
import { AltSayfa } from "@/components/site/alt-sayfa";
import { SiparisFormu } from "@/components/site/siparis-formu";
import { SiparisKapali } from "@/components/site/siparis-kapali";
import { siteBilgisiGetir } from "@/lib/data";
import { WA_MESAJ, waLink } from "@/lib/format";
import { katalogGetir } from "@/lib/stok";
import { siparisAlinir } from "@/lib/urun-kaynagi";

/* Ödeme / sipariş (K-37) — arama motorlarına kapalı. */
export const metadata: Metadata = {
  title: "Siparişi tamamla",
  robots: { index: false, follow: false },
};

export default async function SiparisSayfasi() {
  const [katalog, info] = await Promise.all([katalogGetir(), siteBilgisiGetir()]);
  const acik = siparisAlinir(katalog);

  return (
    <AltSayfa
      ust="Online sipariş"
      baslik="Siparişi tamamla"
      aciklama={acik ? "Bilgilerinizi girin, siparişiniz doğrudan dükkâna iletilir." : undefined}
      sepetVar={acik}
    >
      {acik ? (
        <SiparisFormu katalog={katalog} />
      ) : (
        <SiparisKapali waLink={waLink(info.whatsapp, WA_MESAJ.genelSiparis)} />
      )}
    </AltSayfa>
  );
}
