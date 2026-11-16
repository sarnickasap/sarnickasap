"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { RadioList, RadioListItem } from "@astryxdesign/core/RadioList";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { useState } from "react";
import { fiyat } from "@/lib/format";
import type { Teslimat } from "@/lib/stok-sema";
import { aralikEtiketi, type GunSecenegi } from "@/lib/teslimat";
import { alanDurumu } from "./astryx-yardimci";
import { FIELDSET, IPUCU, KART } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   Teslim şekli, gün, saat aralığı, bölge ve adres — TASARIMDA YOK (K-37).
   Seçenekler stok programının `delivery` ayarlarından üretilir
   (lib/teslimat.ts). Yalnızca açık olan teslim şekilleri listelenir.
   Astryx RadioList / Selector / TextArea / Grid / Heading / Text /
   VisuallyHidden (legend); `htmlName`'ler sunucu eylemiyle aynı.
   ────────────────────────────────────────────────────────────────────────── */

export type TeslimTipi = "pickup" | "delivery";

const TIP_ETIKETI: Record<TeslimTipi, string> = {
  pickup: "Gel-al (dükkândan teslim alırım)",
  delivery: "Eve teslim",
};

const HATA = "m-0 text-13 text-discount";

const ALAN_IZGARASI = { minWidth: 220, max: 2 } as const;

type Props = {
  teslimat: Teslimat;
  tip: TeslimTipi;
  onTip: (t: TeslimTipi) => void;
  gunler: GunSecenegi[];
  tarih: string;
  onTarih: (t: string) => void;
  araliklar: string[];
  aralik: string;
  onAralik: (a: string) => void;
  bolge: string;
  onBolge: (b: string) => void;
  enAzTutarEksik: boolean;
  hatalar: Partial<Record<string, string>>;
};

export function TeslimatAlanlari(p: Props) {
  const d = p.teslimat;
  const tipler = (["pickup", "delivery"] as const).filter((t) =>
    t === "pickup" ? d.pickup : d.homeDelivery,
  );

  return (
    <Card className={KART}>
      <fieldset className={FIELDSET}>
        <VisuallyHidden as="legend">Teslim bilgileri</VisuallyHidden>
        <Heading level={2} className="font-display text-20 font-semibold text-cream">Teslim</Heading>

        <RadioList
          label="Teslim şekli"
          htmlName="tip"
          orientation="horizontal"
          value={p.tip}
          onChange={(t) => p.onTip(t as TeslimTipi)}
          status={alanDurumu(p.hatalar.tip)}
        >
          {tipler.map((t) => (
            <RadioListItem key={t} value={t} label={TIP_ETIKETI[t]} />
          ))}
        </RadioList>

        {p.gunler.length === 0 ? (
          <Banner status="error" title="Önümüzdeki günlerde uygun saat kalmadı. Lütfen WhatsApp’tan yazın." />
        ) : (
          <GunVeSaat {...p} />
        )}

        {p.tip === "delivery" && <AdresAlanlari {...p} />}
      </fieldset>
    </Card>
  );
}

function GunVeSaat(p: Props) {
  return (
    <Grid columns={ALAN_IZGARASI} gap={4}>
      <Selector
        label="Gün"
        htmlName="tarih"
        size="lg"
        width="100%"
        presentation="adaptive"
        value={p.tarih}
        onChange={p.onTarih}
        options={p.gunler.map((g) => ({ value: g.deger, label: g.etiket }))}
        status={alanDurumu(p.hatalar.tarih)}
      />
      <Selector
        label="Saat aralığı"
        htmlName="aralik"
        size="lg"
        width="100%"
        presentation="adaptive"
        value={p.aralik}
        onChange={p.onAralik}
        options={p.araliklar.map((a) => ({ value: a, label: aralikEtiketi(p.teslimat, a) }))}
        status={alanDurumu(p.hatalar.aralik)}
      />
    </Grid>
  );
}

function AdresAlanlari(p: Props) {
  const d = p.teslimat;
  const [adres, setAdres] = useState("");
  return (
    <>
      <Selector
        label="Teslimat bölgesi"
        htmlName="bolge"
        size="lg"
        width="100%"
        presentation="adaptive"
        placeholder="Bölge seçin"
        value={p.bolge || undefined}
        onChange={p.onBolge}
        options={d.areas.map((a) => ({
          value: a.name,
          label: `${a.name} — ${a.fee > 0 ? `teslimat ${fiyat(a.fee)}` : "ücretsiz teslimat"}`,
        }))}
        status={alanDurumu(p.hatalar.bolge)}
      />
      {d.minOrderTotal > 0 && (
        <Text as="p" className={p.enAzTutarEksik ? HATA : IPUCU}>
          Eve teslim için en az sepet tutarı {fiyat(d.minOrderTotal)}.
        </Text>
      )}
      <TextArea
        label="Açık adres"
        htmlName="adres"
        value={adres}
        onChange={setAdres}
        rows={3}
        htmlMaxLength={300}
        size="lg"
        autoComplete="street-address"
        status={alanDurumu(p.hatalar.adres)}
      />
    </>
  );
}
