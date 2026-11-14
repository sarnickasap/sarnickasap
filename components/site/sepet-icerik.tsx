"use client";

import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { IconButton } from "@astryxdesign/core/IconButton";
import { TextInput } from "@astryxdesign/core/TextInput";
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
   Astryx Card / Button / IconButton / TextInput / EmptyState.
   ────────────────────────────────────────────────────────────────────────── */

export function SepetIcerik({ urunler, teslimatNotu }: { urunler: KatalogUrun[]; teslimatNotu: string }) {
  const sepet = useSepet();
  const satirlar = useMemo(() => (sepet ? sepetSatirlari(sepet, urunler) : []), [sepet, urunler]);
  const adlar = useMemo(() => new Map(urunler.map((u) => [u.code, u.name])), [urunler]);

  if (sepet === null) return <div className="min-h-190" aria-busy="true" />;
  if (sepet.length === 0) return <BosSepet />;

  const toplam = araToplam(satirlar);
  const gecerliVar = satirlar.some((s) => s.urun);

  return (
    <div className="flex flex-col gap-24">
      <ul className="m-0 flex list-none flex-col gap-12 p-0">
        {satirlar.map((s) => (
          <SepetSatirKarti key={s.kalem.code} satir={s} ad={adlar.get(s.kalem.code) ?? s.kalem.code} />
        ))}
      </ul>

      <Card role="region" aria-label="Sepet özeti" className={KART}>
        <div className="flex items-baseline justify-between gap-12">
          <span className="text-15 text-soft">Tahmini toplam</span>
          <span className="font-display text-28 font-bold text-white">{fiyat(toplam)}</span>
        </div>
        {teslimatNotu && <p className={IPUCU}>{teslimatNotu}</p>}
        <p className={IPUCU}>Ödeme teslimde nakit veya kartla yapılır.</p>
        <div className="flex flex-wrap gap-12">
          {gecerliVar ? (
            <Button variant="primary" size="lg" label="Siparişi tamamla" href="/siparis" className={CTA} />
          ) : (
            <p className="m-0 text-14 text-muted">Sepette sipariş verilebilecek ürün kalmadı.</p>
          )}
          <Button size="lg" label="Alışverişe devam et" href="/#urunler" className={CTA_IKINCIL} />
        </div>
      </Card>
    </div>
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
      <div className="flex flex-wrap items-start justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <h2 className="m-0 font-display text-20 font-semibold tracking-product text-cream break-words">{ad}</h2>
          {urun ? (
            <span className="text-13 text-muted-dark">
              {fiyat(urun.price)} {birimSoneki(urun.unit)}
            </span>
          ) : (
            <span className="text-13 font-semibold text-discount">Artık satışta değil — sepetten çıkarın.</span>
          )}
        </div>
        <IconButton
          size="lg"
          label={`${ad} ürününü sepetten çıkar`}
          icon={<CopIkonu size={16} />}
          onClick={() => kalemSil(kalem.code)}
          className={`h-36 w-36 flex-none ${CERCEVELI} hover:border-brand hover:bg-brand hover:text-white`}
        />
      </div>

      {urun && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-12">
            <MiktarSecici
              unit={urun.unit}
              deger={kalem.qty}
              onDegis={(q) => miktarGuncelle(kalem.code, urun.unit, q)}
              etiket={`${ad} miktarı`}
            />
            <span className="font-display text-20 font-bold text-white">{fiyat(tutar)}</span>
          </div>
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
