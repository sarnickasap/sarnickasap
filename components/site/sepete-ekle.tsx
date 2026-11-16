"use client";

import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { useToast } from "@astryxdesign/core/Toast";
import { useEffect, useRef, useState } from "react";
import { MIKTAR_KURALI } from "@/lib/miktar";
import { sepeteEkle, type EklemeSonucu } from "@/lib/sepet";
import type { Birim } from "@/lib/stok-sema";
import { MiktarSecici } from "./miktar-secici";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün kartında miktar seçici + "Sepete ekle" — TASARIMDA YOK (K-37).

     seçici  MiktarSecici (h36 · r8 · 1px #333333)
     buton   Astryx Button primary · h36 · 14px/600 (marka kırmızısı)

   Başarı: Astryx Toast ("Sepete eklendi" + "Sepete git" bağlantısı; Toast
   kendi `role=status` canlı bölgesiyle duyurur) ve buton metni kısa süre
   "Eklendi" olur. Hata (sepet dolu / kaydedilemedi) kalıcı bilgi olduğu
   için kartın içinde metin olarak kalır (`aria-live`).
   ────────────────────────────────────────────────────────────────────────── */

const GERI_BILDIRIM_MS = 1600;

const HATA_METNI: Record<Exclude<EklemeSonucu, "eklendi">, string> = {
  dolu: "Sepette en fazla 30 kalem olabilir",
  kaydedilemedi: "Sepet bu tarayıcıda kaydedilemiyor",
};

export function SepeteEkle({ code, unit, name }: { code: string; unit: Birim; name: string }) {
  const [miktar, setMiktar] = useState(MIKTAR_KURALI[unit].varsayilan);
  const [durum, setDurum] = useState<EklemeSonucu | null>(null);
  const zamanlayici = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bildir = useToast();

  useEffect(
    () => () => {
      if (zamanlayici.current) clearTimeout(zamanlayici.current);
    },
    [],
  );

  const ekle = () => {
    const sonuc = sepeteEkle(code, unit, miktar);
    setDurum(sonuc);
    if (sonuc === "eklendi") {
      bildir({
        body: `Sepete eklendi: ${name}`,
        uniqueID: "sepete-eklendi",
        endContent: <Button size="sm" variant="secondary" label="Sepete git" href="/sepet" />,
      });
    }
    if (zamanlayici.current) clearTimeout(zamanlayici.current);
    zamanlayici.current = setTimeout(() => setDurum(null), GERI_BILDIRIM_MS);
  };

  const hata = durum !== null && durum !== "eklendi" ? HATA_METNI[durum] : "";

  return (
    <HStack wrap="wrap" align="center" gap={2}>
      <MiktarSecici unit={unit} deger={miktar} onDegis={setMiktar} etiket={`${name} miktarı`} />

      <Button
        variant="primary"
        size="lg"
        label={`Sepete ekle — ${name}`}
        onClick={ekle}
        className="min-w-[120px] flex-1 text-14 font-semibold"
      >
        {durum === "eklendi" ? "Eklendi" : "Sepete ekle"}
      </Button>

      <Text as="p" aria-live="polite" className={hata ? "w-full text-12 text-discount" : "sr-only"}>
        {hata}
      </Text>
    </HStack>
  );
}
