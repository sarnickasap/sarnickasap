"use client";

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
import { FormAlani, alanAria } from "./form-alani";
import { BIRINCIL, GIRDI, HATA, IPUCU, KART } from "./siparis-stilleri";
import { TeslimatAlanlari, type TeslimTipi } from "./teslimat-alanlari";

/* ──────────────────────────────────────────────────────────────────────────
   Ödeme / sipariş formu — TASARIMDA YOK (K-37).

   Gönderim `onSubmit` + `startTransition` ile: `<form action>` React 19'da
   başarısız gönderimden sonra da alanları SIFIRLIYOR; hata gösterilirken
   müşterinin yazdıkları silinmesin diye form eylemi elle tetikleniyor.

   Form gövdesi yalnızca istemcide (sepet okunduktan sonra) render edilir:
   `clientRef` ve "şimdi" zamanı prerender'a sabitlenmez.
   ────────────────────────────────────────────────────────────────────────── */

export function SiparisFormu({ katalog }: { katalog: Katalog }) {
  const sepet = useSepet();
  if (sepet === null) return <div className="min-h-190" aria-busy="true" />;

  const satirlar = sepetSatirlari(sepet, katalog.products).filter((s) => s.urun);
  if (satirlar.length === 0) {
    return (
      <div className={KART}>
        <p className="m-0 text-16 text-read">Sepetinizde sipariş verilebilecek ürün yok.</p>
        <div className="flex"><Link href="/#urunler" className={BIRINCIL}>Ürünlere göz atın</Link></div>
      </div>
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
      {eksikVar && <p className={HATA}>Sepetinizdeki bazı ürünler artık satışta değil; siparişe eklenmedi.</p>}

      <MusteriAlanlari hatalar={durum.alanHatalari} />
      <TeslimatAlanlari teslimat={d} tip={tip} onTip={setTip} gunler={gunler} tarih={tarih} onTarih={setTarih}
        araliklar={araliklar} aralik={aralik} onAralik={setAralik} bolge={bolge} onBolge={setBolge}
        enAzTutarEksik={enAzTutarEksik} hatalar={durum.alanHatalari} />
      <NotVeOnay hatalar={durum.alanHatalari} />
      <SiparisOzeti satirlar={satirlar} toplam={toplam} ucret={ucret} teslimatNotu={d.note} />

      <div role="alert" aria-live="assertive">
        {durum.hata && <p className={`${HATA} text-15`}>{durum.hata}</p>}
      </div>
      <div className="flex">
        <button type="submit" disabled={bekliyor || enAzTutarEksik || gunler.length === 0} className={BIRINCIL}>
          {bekliyor ? "Gönderiliyor…" : "Siparişi gönder"}
        </button>
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

function MusteriAlanlari({ hatalar }: { hatalar: Partial<Record<string, string>> }) {
  return (
    <fieldset className={`${KART} m-0 min-w-0`}>
      <legend className="sr-only">İletişim bilgileri</legend>
      <h2 className="m-0 font-display text-20 font-semibold text-cream">İletişim</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-16">
        <FormAlani id="ad" etiket="Ad soyad" hata={hatalar.ad}>
          <input id="ad" name="ad" type="text" required maxLength={80} autoComplete="name"
            className={`${GIRDI} h-44`} {...alanAria("ad", hatalar.ad)} />
        </FormAlani>
        <FormAlani id="telefon" etiket="Cep telefonu" hata={hatalar.telefon}>
          <input id="telefon" name="telefon" type="tel" required inputMode="tel" autoComplete="tel"
            placeholder="05xx xxx xx xx" maxLength={20} className={`${GIRDI} h-44`} {...alanAria("telefon", hatalar.telefon)} />
        </FormAlani>
      </div>
    </fieldset>
  );
}

function NotVeOnay({ hatalar }: { hatalar: Partial<Record<string, string>> }) {
  return (
    <fieldset className={`${KART} m-0 min-w-0`}>
      <legend className="sr-only">Not ve onay</legend>
      <FormAlani id="not" etiket="Sipariş notu (isteğe bağlı)" hata={hatalar.not}>
        <textarea id="not" name="not" rows={3} maxLength={500}
          className={`${GIRDI} py-10 leading-15`} {...alanAria("not", hatalar.not)} />
      </FormAlani>
      <div className="flex flex-col gap-6">
        <label className="flex cursor-pointer items-start gap-8 text-14 leading-15 text-read">
          <input type="checkbox" name="kvkk" required {...alanAria("kvkk", hatalar.kvkk)} />
          <span>
            Kişisel verilerimin siparişimin hazırlanması ve benimle iletişim için işlenmesine ilişkin{" "}
            <Link href="/kvkk" target="_blank" className="text-cream underline underline-offset-2">aydınlatma metnini</Link>{" "}
            okudum.
          </span>
        </label>
        {hatalar.kvkk && <p id="kvkk-hata" className={HATA}>{hatalar.kvkk}</p>}
      </div>
    </fieldset>
  );
}

function SiparisOzeti({ satirlar, toplam, ucret, teslimatNotu }: {
  satirlar: SepetSatiri[]; toplam: number; ucret: number; teslimatNotu: string;
}) {
  return (
    <section aria-label="Sipariş özeti" className={KART}>
      <h2 className="m-0 font-display text-20 font-semibold text-cream">Özet</h2>
      <ul className="m-0 flex list-none flex-col gap-8 p-0">
        {satirlar.map((s) => s.urun && (
          <li key={s.kalem.code} className="flex justify-between gap-12 text-14 text-read">
            <span className="min-w-0 break-words">{s.urun.name} · {miktarMetni(s.urun.unit, s.kalem.qty)}</span>
            <span className="flex-none">{fiyat(s.tutar)}</span>
          </li>
        ))}
      </ul>
      <div className="h-1 bg-line" />
      {ucret > 0 && (
        <div className="flex justify-between text-14 text-read"><span>Teslimat ücreti</span><span>{fiyat(ucret)}</span></div>
      )}
      <div className="flex items-baseline justify-between gap-12">
        <span className="text-15 text-soft">Tahmini toplam</span>
        <span className="font-display text-28 font-bold text-white">{fiyat(toplam + ucret)}</span>
      </div>
      {teslimatNotu && <p className={IPUCU}>{teslimatNotu}</p>}
      <p className={IPUCU}>Ödeme teslimde nakit veya kartla yapılır.</p>
    </section>
  );
}
