"use client";

import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { useMemo, useState } from "react";
import { CopIkonu } from "@/components/icons";
import { fiyat } from "@/lib/format";
import { birimSoneki } from "@/lib/miktar";
import { kalemSil, miktarGuncelle, notGuncelle, useSepet } from "@/lib/sepet";
import { araToplam, sepetSatirlari, type SepetSatiri } from "@/lib/sepet-hesap";
import type { KatalogUrun } from "@/lib/stok-sema";
import { yerelNitelikler } from "./astryx-yardimci";
import { MiktarSecici } from "./miktar-secici";
import { CERCEVELI, CTA, CTA_IKINCIL, IPUCU, KART } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   /sepet içeriği — TASARIMDA YOK (K-37).
   Fiyatlar her render'da GÜNCEL katalogdan türetilir (depoda fiyat yok).
   Katalogdan kalkmış ya da tükenmiş kalem işaretlenir, toplama girmez.
   Astryx Card / Button / IconButton / TextInput / EmptyState / Heading /
   Text / HStack / VStack (liste `as="ul"`) / Skeleton (sepet okunurken).
   Satırlar List değil Card: her satırda düğme, miktar seçici ve metin
   alanı var — List etkileşimli içerik taşıyan satırlar için uygun değil.
   ────────────────────────────────────────────────────────────────────────── */

export function SepetIcerik({ urunler, teslimatNotu }: { urunler: KatalogUrun[]; teslimatNotu: string }) {
  const sepet = useSepet();
  const satirlar = useMemo(() => (sepet ? sepetSatirlari(sepet, urunler) : []), [sepet, urunler]);
  const adlar = useMemo(() => new Map(urunler.map((u) => [u.code, u.name])), [urunler]);

  if (sepet === null) return <Skeleton height={190} width="100%" aria-busy="true" />;
  if (sepet.length === 0) return <BosSepet />;

  const toplam = araToplam(satirlar);
  const gecerliVar = satirlar.some((s) => s.urun);

  return (
    <VStack gap={6}>
      <VStack as="ul" gap={3} className="m-0 list-none p-0">
        {satirlar.map((s) => (
          <SepetSatirKarti key={s.kalem.code} satir={s} ad={adlar.get(s.kalem.code) ?? s.kalem.code} />
        ))}
      </VStack>

      <Card role="region" aria-label="Sepet özeti" className={KART}>
        <HStack className="items-baseline" justify="between" gap={3}>
          <Text className="text-15 text-soft">Tahmini toplam</Text>
          <Text weight="bold" className="font-display text-28 text-white">{fiyat(toplam)}</Text>
        </HStack>
        {teslimatNotu && <Text as="p" className={IPUCU}>{teslimatNotu}</Text>}
        <Text as="p" className={IPUCU}>Ödeme teslimde nakit veya kartla yapılır.</Text>
        <HStack wrap="wrap" gap={3}>
          {gecerliVar ? (
            <Button variant="primary" size="lg" label="Siparişi tamamla" href="/siparis" className={CTA} />
          ) : (
            <Text as="p" color="secondary" className="text-14">Sepette sipariş verilebilecek ürün kalmadı.</Text>
          )}
          <Button size="lg" label="Alışverişe devam et" href="/#urunler" className={CTA_IKINCIL} />
        </HStack>
      </Card>
    </VStack>
  );
}

function BosSepet() {
  return (
    <Card className={KART}>
      <EmptyState
        headingLevel={2}
        title="Sepetiniz boş."
        actions={<Button variant="primary" size="lg" label="Ürünlere göz atın" href="/#urunler" className={CTA} />}
      />
    </Card>
  );
}

function SepetSatirKarti({ satir, ad }: { satir: SepetSatiri; ad: string }) {
  const { kalem, urun, tutar } = satir;

  return (
    <li>
      <Card className={KART}>
        <HStack wrap="wrap" align="start" justify="between" gap={3}>
          <VStack gap={1} className="min-w-0">
            <Heading level={2} className="font-display text-20 font-semibold tracking-product text-cream break-words">{ad}</Heading>
            {urun ? (
              <Text className="text-13 text-muted-dark">
                {fiyat(urun.price)} {birimSoneki(urun.unit)}
              </Text>
            ) : (
              <Text weight="semibold" className="text-13 text-discount">Artık satışta değil — sepetten çıkarın.</Text>
            )}
          </VStack>
          <IconButton
            size="lg"
            label={`${ad} ürününü sepetten çıkar`}
            icon={<CopIkonu size={16} />}
            onClick={() => kalemSil(kalem.code)}
            className={`h-36 w-36 flex-none ${CERCEVELI} hover:border-brand hover:bg-brand hover:text-white`}
          />
        </HStack>

        {urun && (
          <>
            <HStack wrap="wrap" align="center" justify="between" gap={3}>
              <MiktarSecici
                unit={urun.unit}
                deger={kalem.qty}
                onDegis={(q) => miktarGuncelle(kalem.code, urun.unit, q)}
                etiket={`${ad} miktarı`}
              />
              <Text weight="bold" className="font-display text-20 text-white">{fiyat(tutar)}</Text>
            </HStack>
            <KesimNotu code={kalem.code} ilkNot={kalem.note} />
          </>
        )}
      </Card>
    </li>
  );
}

/** Kalem notu: yazarken yerel, alandan çıkınca sepete kaydedilir. */
function KesimNotu({ code, ilkNot }: { code: string; ilkNot: string }) {
  const [not, setNot] = useState(ilkNot);
  return (
    <TextInput
      label="Kesim/çekim tercihi"
      value={not}
      onChange={setNot}
      onBlur={() => notGuncelle(code, not)}
      size="lg"
      placeholder="Ör. kuşbaşı doğransın, az yağlı çekilsin"
      {...yerelNitelikler({ maxLength: 200 })}
    />
  );
}
