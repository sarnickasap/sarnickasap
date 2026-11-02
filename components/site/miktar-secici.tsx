"use client";

import { ArtiIkonu, EksiIkonu } from "@/components/icons";
import { MIKTAR_KURALI, miktarDuzelt, miktarMetni } from "@/lib/miktar";
import type { Birim } from "@/lib/stok-sema";

/* Miktar seçici — TASARIMDA YOK (K-37).
   h36 · r8 · 1px #333333 (ürün kartındaki WhatsApp ok düğmesinin çerçevesi).
   kg: 0,25 adım ("500 g" / "1,5 kg") · adet: 1 adım. */

const DUGME =
  "flex h-34 w-34 cursor-pointer items-center justify-center border-0 bg-transparent text-body " +
  "transition-colors duration-150 ease-out-soft hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40";

export function MiktarSecici({
  unit,
  deger,
  onDegis,
  etiket,
}: {
  unit: Birim;
  deger: number;
  onDegis: (yeni: number) => void;
  etiket: string;
}) {
  const k = MIKTAR_KURALI[unit];
  const degistir = (yon: 1 | -1) => onDegis(miktarDuzelt(unit, deger + yon * k.adim));

  return (
    <div
      role="group"
      aria-label={etiket}
      className="flex h-36 flex-none items-center overflow-hidden rounded-8 border border-edge"
    >
      <button type="button" onClick={() => degistir(-1)} disabled={deger <= k.enAz}
        aria-label="Azalt" className={DUGME}>
        <EksiIkonu size={14} />
      </button>
      <output aria-live="polite" className="min-w-64 text-center text-14 font-medium text-body">
        {miktarMetni(unit, deger)}
      </output>
      <button type="button" onClick={() => degistir(1)} disabled={deger >= k.enCok}
        aria-label="Artır" className={DUGME}>
        <ArtiIkonu size={14} />
      </button>
    </div>
  );
}
