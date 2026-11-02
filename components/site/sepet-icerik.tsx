"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CopIkonu } from "@/components/icons";
import { fiyat } from "@/lib/format";
import { birimSoneki } from "@/lib/miktar";
import { kalemSil, miktarGuncelle, notGuncelle, useSepet } from "@/lib/sepet";
import { araToplam, sepetSatirlari, type SepetSatiri } from "@/lib/sepet-hesap";
import type { KatalogUrun } from "@/lib/stok-sema";
import { MiktarSecici } from "./miktar-secici";
import { BIRINCIL, GIRDI, IKINCIL, IPUCU, KART } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   /sepet içeriği — TASARIMDA YOK (K-37).
   Fiyatlar her render'da GÜNCEL katalogdan türetilir (depoda fiyat yok).
   Katalogdan kalkmış ya da tükenmiş kalem işaretlenir, toplama girmez.
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

      <section aria-label="Sepet özeti" className={KART}>
        <div className="flex items-baseline justify-between gap-12">
          <span className="text-15 text-soft">Tahmini toplam</span>
          <span className="font-display text-28 font-bold text-white">{fiyat(toplam)}</span>
        </div>
        {teslimatNotu && <p className={IPUCU}>{teslimatNotu}</p>}
        <p className={IPUCU}>Ödeme teslimde nakit veya kartla yapılır.</p>
        <div className="flex flex-wrap gap-12">
          {gecerliVar ? (
            <Link href="/siparis" className={BIRINCIL}>Siparişi tamamla</Link>
          ) : (
            <p className="m-0 text-14 text-muted">Sepette sipariş verilebilecek ürün kalmadı.</p>
          )}
          <Link href="/#urunler" className={IKINCIL}>Alışverişe devam et</Link>
        </div>
      </section>
    </div>
  );
}

function BosSepet() {
  return (
    <div className={KART}>
      <p className="m-0 text-16 text-read">Sepetiniz boş.</p>
      <div className="flex">
        <Link href="/#urunler" className={BIRINCIL}>Ürünlere göz atın</Link>
      </div>
    </div>
  );
}

function SepetSatirKarti({ satir, ad }: { satir: SepetSatiri; ad: string }) {
  const { kalem, urun, tutar } = satir;
  const notId = `not-${kalem.code}`;

  return (
    <li className={KART}>
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
        <button
          type="button"
          onClick={() => kalemSil(kalem.code)}
          aria-label={`${ad} ürününü sepetten çıkar`}
          className="flex h-36 w-36 flex-none cursor-pointer items-center justify-center rounded-8 border border-edge bg-transparent text-body transition-colors duration-150 ease-out-soft hover:border-brand hover:bg-brand hover:text-white"
        >
          <CopIkonu size={16} />
        </button>
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
          <div className="flex flex-col gap-6">
            <label htmlFor={notId} className="text-13 font-medium text-soft">Kesim/çekim tercihi</label>
            <input
              id={notId}
              type="text"
              maxLength={200}
              defaultValue={kalem.note}
              onBlur={(e) => notGuncelle(kalem.code, e.target.value)}
              placeholder="Ör. kuşbaşı doğransın, az yağlı çekilsin"
              className={`${GIRDI} h-40`}
            />
          </div>
        </>
      )}
    </li>
  );
}
