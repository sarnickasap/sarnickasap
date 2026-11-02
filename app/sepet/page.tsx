import type { Metadata } from "next";
import { AltSayfa } from "@/components/site/alt-sayfa";
import { SepetIcerik } from "@/components/site/sepet-icerik";
import { SiparisKapali } from "@/components/site/siparis-kapali";
import { siteBilgisiGetir } from "@/lib/data";
import { WA_MESAJ, waLink } from "@/lib/format";
import { katalogGetir } from "@/lib/stok";
import { siparisAlinir } from "@/lib/urun-kaynagi";

/* Sepet (K-37) — arama motorlarına kapalı; içerik tarayıcıdaki sepete bağlı. */
export const metadata: Metadata = {
  title: "Sepet",
  robots: { index: false, follow: false },
};

export default async function SepetSayfasi() {
  const [katalog, info] = await Promise.all([katalogGetir(), siteBilgisiGetir()]);

  return (
    <AltSayfa ust="Online sipariş" baslik="Sepetiniz" sepetVar={siparisAlinir(katalog)}>
      {siparisAlinir(katalog) ? (
        <SepetIcerik urunler={katalog.products} teslimatNotu={katalog.delivery.note} />
      ) : (
        <SiparisKapali waLink={waLink(info.whatsapp, WA_MESAJ.genelSiparis)} />
      )}
    </AltSayfa>
  );
}
