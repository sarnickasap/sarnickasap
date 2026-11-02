"use client";

import { useEffect, useRef, useState } from "react";
import { MIKTAR_KURALI } from "@/lib/miktar";
import { sepeteEkle, type EklemeSonucu } from "@/lib/sepet";
import type { Birim } from "@/lib/stok-sema";
import { MiktarSecici } from "./miktar-secici";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün kartında miktar seçici + "Sepete ekle" — TASARIMDA YOK (K-37).

   Görsel dil kartın kendi öğelerinden:
     seçici  h36 · r8 · 1px #333333 (WhatsApp ok düğmesiyle aynı çerçeve)
     buton   h36 · r8 · #b8222a · 14px/600 · beyaz · hover #9e1c23
             (site birincil butonunun 36px'lik karşılığı)
   Durum `aria-live` ile duyurulur; buton metni kısa süre "Eklendi" olur.
   ────────────────────────────────────────────────────────────────────────── */

const GERI_BILDIRIM_MS = 1600;

const DURUM_METNI: Record<EklemeSonucu, string> = {
  eklendi: "Sepete eklendi",
  dolu: "Sepette en fazla 30 kalem olabilir",
  kaydedilemedi: "Sepet bu tarayıcıda kaydedilemiyor",
};

export function SepeteEkle({ code, unit, name }: { code: string; unit: Birim; name: string }) {
  const [miktar, setMiktar] = useState(MIKTAR_KURALI[unit].varsayilan);
  const [durum, setDurum] = useState<EklemeSonucu | null>(null);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (zamanlayici.current) clearTimeout(zamanlayici.current);
    },
    [],
  );

  const ekle = () => {
    setDurum(sepeteEkle(code, unit, miktar));
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
    zamanlayici.current = setTimeout(() => setDurum(null), GERI_BILDIRIM_MS);
  };

  const hataVar = durum !== null && durum !== "eklendi";

  return (
    <div className="flex flex-wrap items-center gap-8">
      <MiktarSecici unit={unit} deger={miktar} onDegis={setMiktar} etiket={`${name} miktarı`} />

      <button
        type="button"
        onClick={ekle}
        className="flex h-36 min-w-[120px] flex-1 cursor-pointer items-center justify-center rounded-8 border-0 bg-brand px-12 text-14 font-semibold whitespace-nowrap text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover"
      >
        {durum === "eklendi" ? "Eklendi" : "Sepete ekle"}
        <span className="sr-only"> — {name}</span>
      </button>

      <p aria-live="polite" className={hataVar ? "m-0 w-full text-12 text-discount" : "sr-only"}>
        {durum ? DURUM_METNI[durum] : ""}
      </p>
    </div>
  );
}
