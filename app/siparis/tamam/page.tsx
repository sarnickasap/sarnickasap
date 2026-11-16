import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import type { Metadata } from "next";
import { Suspense } from "react";
import { z } from "zod";
import { MesajIkonu } from "@/components/icons";
import { AltSayfa } from "@/components/site/alt-sayfa";
import { SiparisAdimlari } from "@/components/site/siparis-adimlari";
import { SepetiTemizle } from "@/components/site/sepeti-temizle";
import { CTA, CTA_IKINCIL, IPUCU, KART } from "@/components/site/siparis-stilleri";
import { siteBilgisiGetir } from "@/lib/data";
import { fiyat, WA_MESAJ, waLink } from "@/lib/format";
import { gunMetni } from "@/lib/teslimat";

/* ──────────────────────────────────────────────────────────────────────────
   Sipariş alındı (K-37) — arama motorlarına kapalı.
   Sorgu dizgisi yalnızca GÖSTERİM içindir (server action yazar); yine de
   zod ile doğrulanır, uymayan değer gösterilmez.
   Astryx: Stepper (SiparisAdimlari), Card, MetadataList (sipariş ayrıntısı,
   <dl>), Text, HStack, Button, Skeleton (yükleme yeri).
   ────────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Siparişiniz alındı",
  robots: { index: false, follow: false },
};

const SorguSema = z.object({
  no: z.string().regex(/^[A-Za-z0-9-]{1,32}$/),
  tutar: z.coerce.number().nonnegative().optional(),
  ucret: z.coerce.number().nonnegative().optional(),
  tip: z.enum(["pickup", "delivery"]).optional(),
  tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  aralik: z.string().regex(/^\d{2}:\d{2}–\d{2}:\d{2}$/).optional(),
});

type SorguParametreleri = Promise<Record<string, string | string[] | undefined>>;

export default function SiparisTamamSayfasi({ searchParams }: { searchParams: SorguParametreleri }) {
  return (
    <AltSayfa ust="Online sipariş" baslik="Siparişiniz alındı" ustBilgi={<SiparisAdimlari adim={2} />}>
      <SepetiTemizle />
      <Suspense fallback={<Skeleton height={190} width="100%" aria-busy="true" />}>
        <Ozet searchParams={searchParams} />
      </Suspense>
    </AltSayfa>
  );
}

async function Ozet({ searchParams }: { searchParams: SorguParametreleri }) {
  const [ham, info] = await Promise.all([searchParams, siteBilgisiGetir()]);
  const s = SorguSema.safeParse(ham);
  const wa = waLink(info.whatsapp, s.success ? WA_MESAJ.siparisNo(s.data.no) : WA_MESAJ.genelSiparis);

  return (
    <Card className={KART}>
      {s.success ? (
        <Ayrinti {...s.data} />
      ) : (
        <Text as="p" className="text-16 text-read">Siparişiniz dükkâna iletildi.</Text>
      )}
      <Text as="p" className={IPUCU}>Ödeme teslimde nakit veya kartla yapılır. Tartılı ürünlerde tutar teslimde kesinleşir.</Text>
      <HStack wrap="wrap" gap={3}>
        <Button
          variant="primary"
          size="lg"
          label="WhatsApp’tan yazın"
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          icon={<MesajIkonu size={18} />}
          className={CTA}
        />
        <Button size="lg" label="Ana sayfaya dön" href="/" className={CTA_IKINCIL} />
      </HStack>
    </Card>
  );
}

function Ayrinti(d: z.infer<typeof SorguSema>) {
  const teslim = d.tip === "delivery" ? "Eve teslim" : d.tip === "pickup" ? "Gel-al" : null;
  const zaman = [d.tarih && gunMetni(d.tarih), d.aralik].filter(Boolean).join(" · ");

  return (
    <MetadataList label={{ position: "start" }} className="text-15 [&_dt]:text-soft">
      <MetadataListItem label="Sipariş no">
        <Text weight="bold" className="font-display text-20 text-white">{d.no}</Text>
      </MetadataListItem>
      {d.tutar !== undefined && (
        <MetadataListItem label="Tahmini tutar">
          <Text className="text-read">{fiyat(d.tutar)}</Text>
        </MetadataListItem>
      )}
      {d.ucret ? (
        <MetadataListItem label="Teslimat ücreti">
          <Text className="text-read">{fiyat(d.ucret)}</Text>
        </MetadataListItem>
      ) : null}
      {teslim && (
        <MetadataListItem label="Teslim">
          <Text className="text-read">{zaman ? `${teslim} · ${zaman}` : teslim}</Text>
        </MetadataListItem>
      )}
    </MetadataList>
  );
}
