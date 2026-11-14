"use client";

import { IconButton } from "@astryxdesign/core/IconButton";
import { ArtiIkonu, EksiIkonu } from "@/components/icons";
import { MIKTAR_KURALI, miktarDuzelt, miktarMetni } from "@/lib/miktar";
import type { Birim } from "@/lib/stok-sema";

/* Miktar seçici — TASARIMDA YOK (K-37).
   Çerçeve h36 · r8 · 1px #333333 (ürün kartındaki WhatsApp düğmesinin
   çerçevesi); ± düğmeleri Astryx IconButton (ghost).
   kg: 0,25 adım ("500 g" / "1,5 kg") · adet: 1 adım. */

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
      <IconButton
        variant="ghost"
        size="lg"
        label="Azalt"
        icon={<EksiIkonu size={14} />}
        isDisabled={deger <= k.enAz}
        onClick={() => degistir(-1)}
        className="h-34 rounded-none"
      />
      <output aria-live="polite" className="min-w-64 text-center text-14 font-medium text-body">
        {miktarMetni(unit, deger)}
      </output>
      <IconButton
        variant="ghost"
        size="lg"
        label="Artır"
        icon={<ArtiIkonu size={14} />}
        isDisabled={deger >= k.enCok}
        onClick={() => degistir(1)}
        className="h-34 rounded-none"
      />
    </div>
  );
}
