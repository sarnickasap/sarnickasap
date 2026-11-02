"use client";

import { fiyat } from "@/lib/format";
import type { Teslimat } from "@/lib/stok-sema";
import { aralikEtiketi, type GunSecenegi } from "@/lib/teslimat";
import { FormAlani, alanAria } from "./form-alani";
import { GIRDI, HATA, IPUCU, KART } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   Teslim şekli, gün, saat aralığı, bölge ve adres — TASARIMDA YOK (K-37).
   Seçenekler stok programının `delivery` ayarlarından üretilir
   (lib/teslimat.ts). Yalnızca açık olan teslim şekilleri listelenir.
   ────────────────────────────────────────────────────────────────────────── */

export type TeslimTipi = "pickup" | "delivery";

const TIP_ETIKETI: Record<TeslimTipi, string> = {
  pickup: "Gel-al (dükkândan teslim alırım)",
  delivery: "Eve teslim",
};

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
    <fieldset className={`${KART} m-0 min-w-0`}>
      <legend className="sr-only">Teslim bilgileri</legend>
      <h2 className="m-0 font-display text-20 font-semibold text-cream">Teslim</h2>

      <div role="radiogroup" aria-label="Teslim şekli" className="flex flex-wrap gap-12">
        {tipler.map((t) => (
          <label key={t} className="flex min-h-44 cursor-pointer items-center gap-8 rounded-8 border border-edge px-14 text-15 text-body has-[:checked]:border-cream">
            <input type="radio" name="tip" value={t} checked={p.tip === t} onChange={() => p.onTip(t)} />
            {TIP_ETIKETI[t]}
          </label>
        ))}
      </div>
      {p.hatalar.tip && <p className={HATA}>{p.hatalar.tip}</p>}

      {p.gunler.length === 0 ? (
        <p className={HATA}>Önümüzdeki günlerde uygun saat kalmadı. Lütfen WhatsApp’tan yazın.</p>
      ) : (
        <GunVeSaat {...p} />
      )}

      {p.tip === "delivery" && <AdresAlanlari {...p} />}
    </fieldset>
  );
}

function GunVeSaat(p: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-16">
      <FormAlani id="tarih" etiket="Gün" hata={p.hatalar.tarih}>
        <select id="tarih" name="tarih" value={p.tarih} onChange={(e) => p.onTarih(e.target.value)}
          className={`${GIRDI} h-44`} {...alanAria("tarih", p.hatalar.tarih)}>
          {p.gunler.map((g) => (
            <option key={g.deger} value={g.deger}>{g.etiket}</option>
          ))}
        </select>
      </FormAlani>
      <FormAlani id="aralik" etiket="Saat aralığı" hata={p.hatalar.aralik}>
        <select id="aralik" name="aralik" value={p.aralik} onChange={(e) => p.onAralik(e.target.value)}
          className={`${GIRDI} h-44`} {...alanAria("aralik", p.hatalar.aralik)}>
          {p.araliklar.map((a) => (
            <option key={a} value={a}>{aralikEtiketi(p.teslimat, a)}</option>
          ))}
        </select>
      </FormAlani>
    </div>
  );
}

function AdresAlanlari(p: Props) {
  const d = p.teslimat;
  return (
    <>
      <FormAlani id="bolge" etiket="Teslimat bölgesi" hata={p.hatalar.bolge}>
        <select id="bolge" name="bolge" value={p.bolge} onChange={(e) => p.onBolge(e.target.value)}
          className={`${GIRDI} h-44`} {...alanAria("bolge", p.hatalar.bolge)}>
          <option value="">Bölge seçin</option>
          {d.areas.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name} — {a.fee > 0 ? `teslimat ${fiyat(a.fee)}` : "ücretsiz teslimat"}
            </option>
          ))}
        </select>
      </FormAlani>
      {d.minOrderTotal > 0 && (
        <p className={p.enAzTutarEksik ? HATA : IPUCU}>
          Eve teslim için en az sepet tutarı {fiyat(d.minOrderTotal)}.
        </p>
      )}
      <FormAlani id="adres" etiket="Açık adres" hata={p.hatalar.adres}>
        <textarea id="adres" name="adres" rows={3} maxLength={300} autoComplete="street-address"
          className={`${GIRDI} py-10 leading-15`} {...alanAria("adres", p.hatalar.adres)} />
      </FormAlani>
    </>
  );
}
