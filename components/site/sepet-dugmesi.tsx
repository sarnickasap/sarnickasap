"use client";

import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import { SepetIkonu } from "@/components/icons";
import { useSepet } from "@/lib/sepet";
import { CERCEVELI } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   Başlıktaki sepet düğmesi — TASARIMDA YOK (K-37).
   Astryx Button (çerçeveli ikincil dil, h40). Boş sepette yalnız ikon;
   doluyken sayı marka kırmızısı bir Badge olarak eklenir.

   Sayı hidrasyondan sonra okunur (sunucuda sepet yok); rozet o ana dek
   görünmez — düğme genişliği yalnızca dolu sepette artar.
   ────────────────────────────────────────────────────────────────────────── */

export function SepetDugmesi() {
  const sepet = useSepet();
  const adet = sepet?.length ?? 0;

  return (
    <>
      <Button
        href="/sepet"
        size="lg"
        label={adet > 0 ? `Sepet, ${adet} ürün` : "Sepet, boş"}
        icon={<SepetIkonu size={16} />}
        isIconOnly={adet === 0}
        className={`h-40 flex-none gap-6 px-11 ${CERCEVELI}`}
      >
        {adet > 0 && <Badge label={adet} aria-hidden className="bg-brand font-semibold text-white" />}
      </Button>
      <VisuallyHidden aria-live="polite">
        {sepet ? `Sepette ${adet} ürün` : ""}
      </VisuallyHidden>
    </>
  );
}
