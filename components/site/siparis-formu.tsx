"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import Link from "next/link";
import { startTransition, useActionState, useMemo, useState } from "react";
import { siparisVer } from "@/lib/actions/siparis";
import { fiyat } from "@/lib/format";
import { miktarMetni } from "@/lib/miktar";
import { siparisRefAl, useSepet } from "@/lib/sepet";
import { araToplam, bolgeUcreti, enAzTutarKarsilaniyor, sepetSatirlari, type SepetSatiri } from "@/lib/sepet-hesap";
import { BOS_DURUM, type Kalem } from "@/lib/siparis-sema";
import type { Katalog } from "@/lib/stok-sema";
import { uygunAraliklar, uygunGunler } from "@/lib/teslimat";
import { alanDurumu, yerelNitelikler } from "./astryx-yardimci";
import { CTA, FIELDSET, IPUCU, KART } from "./siparis-stilleri";
import { TeslimatAlanlari, type TeslimTipi } from "./teslimat-alanlari";

/* ──────────────────────────────────────────────────────────────────────────
   Ödeme / sipariş formu — TASARIMDA YOK (K-37). Alanlar Astryx form
   bileşenleri; `htmlName`'ler sunucu eyleminin beklediği adlarla aynı.

   Gönderim `onSubmit` + `startTransition` ile: `<form action>` React 19'da
   başarısız gönderimden sonra da alanları SIFIRLIYOR; hata gösterilirken
   müşterinin yazdıkları silinmesin diye form eylemi elle tetikleniyor.

   Form gövdesi yalnızca istemcide (sepet okunduktan sonra) render edilir:
   `clientRef` ve "şimdi" zamanı prerender'a sabitlenmez.
   ────────────────────────────────────────────────────────────────────────── */

type Hatalar = Partial<Record<string, string>>;

const BOLUM_BASLIGI = "m-0 font-display text-20 font-semibold text-cream";

export function SiparisFormu({ katalog }: { katalog: Katalog }) {
  const sepet = useSepet();
  if (sepet === null) return <div className="min-h-190" aria-busy="true" />;

  const satirlar = sepetSatirlari(sepet, katalog.products).filter((s) => s.urun);
  if (satirlar.length === 0) {
    return (
      <Card className={KART}>
        <EmptyState
          headingLevel={2}
          title="Sepetinizde sipariş verilebilecek ürün yok."
          actions={<Button variant="primary" size="lg" label="Ürünlere göz atın" href="/#urunler" className={CTA} />}
        />
      </Card>
    );
  }
  return <FormGovdesi katalog={katalog} satirlar={satirlar} eksikVar={satirlar.length < sepet.length} />;
}

function FormGovdesi({ katalog, satirlar, eksikVar }: { katalog: Katalog; satirlar: SepetSatiri[]; eksikVar: boolean }) {
  const d = katalog.delivery;
  const [durum, gonder, bekliyor] = useActionState(siparisVer, BOS_DURUM);
  const [clientRef] = useState(siparisRefAl);
  const [simdi] = useState(() => new Date());
  const [tip, setTip] = useState<TeslimTipi>(d.pickup ? "pickup" : "delivery");
  const [tarihSecimi, setTarih] = useState("");
  const [aralikSecimi, setAralik] = useState("");
  const [bolge, setBolge] = useState("");

  const gunler = useMemo(() => uygunGunler(d, simdi), [d, simdi]);
  const tarih = gunler.some((g) => g.deger === tarihSecimi) ? tarihSecimi : (gunler[0]?.deger ?? "");
  const araliklar = useMemo(() => (tarih ? uygunAraliklar(d, tarih, simdi) : []), [d, tarih, simdi]);
  const aralik = araliklar.includes(aralikSecimi) ? aralikSecimi : (araliklar[0] ?? "");

  const toplam = araToplam(satirlar);
  const ucret = tip === "delivery" ? bolgeUcreti(d, bolge) : 0;
  const enAzTutarEksik = tip === "delivery" && !enAzTutarKarsilaniyor(d, toplam);
  const kalemler: Kalem[] = satirlar.map((s) => s.kalem);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => gonder(fd));
  };

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-24">
      <input type="hidden" name="clientRef" value={clientRef} />
      <input type="hidden" name="kalemler" value={JSON.stringify(kalemler)} />
      <BalKupu />
      {eksikVar && (
        <Banner status="warning" title="Sepetinizdeki bazı ürünler artık satışta değil; siparişe eklenmedi." />
      )}

      <MusteriAlanlari hatalar={durum.alanHatalari} />
      <TeslimatAlanlari teslimat={d} tip={tip} onTip={setTip} gunler={gunler} tarih={tarih} onTarih={setTarih}
        araliklar={araliklar} aralik={aralik} onAralik={setAralik} bolge={bolge} onBolge={setBolge}
        enAzTutarEksik={enAzTutarEksik} hatalar={durum.alanHatalari} />
      <NotVeOnay hatalar={durum.alanHatalari} />
      <SiparisOzeti satirlar={satirlar} toplam={toplam} ucret={ucret} teslimatNotu={d.note} />

      <div role="alert" aria-live="assertive">
        {durum.hata && <Banner status="error" title={durum.hata} />}
      </div>
      <div className="flex">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          label={bekliyor ? "Gönderiliyor…" : "Siparişi gönder"}
          isDisabled={bekliyor || enAzTutarEksik || gunler.length === 0}
          className={CTA}
        />
      </div>
    </form>
  );
}

/** Botlar için görünmez alan — ekran okuyucudan ve klavyeden de gizli. */
function BalKupu() {
  return (
    <div aria-hidden className="absolute -left-[10000px] h-1 w-1 overflow-hidden">
      <label htmlFor="website">Web sitesi</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
    </div>
  );
}

function MusteriAlanlari({ hatalar }: { hatalar: Hatalar }) {
  const [ad, setAd] = useState("");
  const [telefon, setTelefon] = useState("");
  return (
    <Card className={KART}>
      <fieldset className={FIELDSET}>
        <legend className="sr-only">İletişim bilgileri</legend>
        <h2 className={BOLUM_BASLIGI}>İletişim</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-16">
          <TextInput label="Ad soyad" htmlName="ad" value={ad} onChange={setAd} size="lg"
            autoComplete="name" status={alanDurumu(hatalar.ad)} {...yerelNitelikler({ required: true, maxLength: 80 })} />
          <TextInput label="Cep telefonu" htmlName="telefon" type="tel" value={telefon} onChange={setTelefon} size="lg"
            inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx"
            status={alanDurumu(hatalar.telefon)} {...yerelNitelikler({ required: true, maxLength: 20 })} />
        </div>
      </fieldset>
    </Card>
  );
}

function NotVeOnay({ hatalar }: { hatalar: Hatalar }) {
  const [not, setNot] = useState("");
  const [onay, setOnay] = useState(false);
  return (
    <Card className={KART}>
      <fieldset className={FIELDSET}>
        <legend className="sr-only">Not ve onay</legend>
        <TextArea label="Sipariş notu (isteğe bağlı)" htmlName="not" value={not} onChange={setNot}
          rows={3} htmlMaxLength={500} size="lg" status={alanDurumu(hatalar.not)} />
        <div className="flex flex-col gap-6">
          <CheckboxInput
            label="Kişisel verilerimin siparişimin hazırlanması ve benimle iletişim için işlenmesine ilişkin aydınlatma metnini okudum."
            htmlName="kvkk"
            value={onay}
            onChange={setOnay}
            status={alanDurumu(hatalar.kvkk)}
          />
          <Link href="/kvkk" target="_blank" rel="noopener noreferrer" className="ml-28 w-fit text-14 text-cream underline underline-offset-2">
            Aydınlatma metnini okuyun
          </Link>
        </div>
      </fieldset>
    </Card>
  );
}

function SiparisOzeti({ satirlar, toplam, ucret, teslimatNotu }: {
  satirlar: SepetSatiri[]; toplam: number; ucret: number; teslimatNotu: string;
}) {
  return (
    <Card role="region" aria-label="Sipariş özeti" className={KART}>
      <h2 className={BOLUM_BASLIGI}>Özet</h2>
      <ul className="m-0 flex list-none flex-col gap-8 p-0">
        {satirlar.map((s) => s.urun && (
          <li key={s.kalem.code} className="flex justify-between gap-12 text-14 text-read">
            <span className="min-w-0 break-words">{s.urun.name} · {miktarMetni(s.urun.unit, s.kalem.qty)}</span>
            <span className="flex-none">{fiyat(s.tutar)}</span>
          </li>
        ))}
      </ul>
      <Divider />
      {ucret > 0 && (
        <div className="flex justify-between text-14 text-read"><span>Teslimat ücreti</span><span>{fiyat(ucret)}</span></div>
      )}
      <div className="flex items-baseline justify-between gap-12">
        <span className="text-15 text-soft">Tahmini toplam</span>
        <span className="font-display text-28 font-bold text-white">{fiyat(toplam + ucret)}</span>
      </div>
      {teslimatNotu && <p className={IPUCU}>{teslimatNotu}</p>}
      <p className={IPUCU}>Ödeme teslimde nakit veya kartla yapılır.</p>
    </Card>
  );
}
