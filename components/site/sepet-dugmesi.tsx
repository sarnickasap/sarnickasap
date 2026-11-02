"use client";

import Link from "next/link";
import { SepetIkonu } from "@/components/icons";
import { useSepet } from "@/lib/sepet";

/* ──────────────────────────────────────────────────────────────────────────
   Başlıktaki sepet düğmesi — TASARIMDA YOK (K-37).
   Hero'daki ikincil butonun 40px'lik karşılığı: 1px #333333 · r8 ·
   14px/500 · #fafafa · hover #171717. Sayı pil rozeti fırsat pilinin
   renkleriyle (#b8222a zemin, beyaz).

   Sayı hidrasyondan sonra okunur (sunucuda sepet yok); rozet o ana dek
   görünmez ama yeri ayrılmaz — düğme genişliği yalnızca dolu sepette artar.
   ────────────────────────────────────────────────────────────────────────── */

export function SepetDugmesi() {
  const sepet = useSepet();
  const adet = sepet?.length ?? 0;

  return (
    <Link
      href="/sepet"
      aria-label={adet > 0 ? `Sepet, ${adet} ürün` : "Sepet, boş"}
      className="flex h-40 flex-none items-center gap-6 rounded-8 border border-edge px-11 text-14 font-medium text-body transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-white"
    >
      <SepetIkonu size={16} />
      {adet > 0 && (
        <span aria-hidden className="rounded-pill bg-brand px-7 py-1 text-12 font-semibold text-white">
          {adet}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {sepet ? `Sepette ${adet} ürün` : ""}
      </span>
    </Link>
  );
}
