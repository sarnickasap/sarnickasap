"use client";

import { useState } from "react";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { Kart, SayfaBasligi } from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { bilgiGuncelle } from "@/lib/actions/admin";
import { PaylasimGorseli } from "./paylasim-gorseli";

/* ──────────────────────────────────────────────────────────────────────────
   SEO sekmesi — TASARIMDA YOK (onaylı sapma #4, K-11/K-19).
   Kullanıcı isteği: "seo olsun başlık admin panelinden değiştirilebilsin".

   Alanlar Astryx TextInput/TextArea; karakter sayacı alanın açıklaması
   (aria-describedby ile okunur), sınır aşılınca uyarı durumu.
   Önizleme, Google sonuç kartının sade bir taklidi — gerçek arama sonucu
   değil, yalnızca uzunluk ve okunuş hissi versin diye.

   Uzunluk eşikleri sektör pratiği: başlık ~60, açıklama ~155 karakter
   sonrası Google kırpar. Eşik aşılınca uyarı gösteriliyor, ENGELLENMİYOR.
   ────────────────────────────────────────────────────────────────────────── */

const BASLIK_SINIR = 60;
const ACIKLAMA_SINIR = 155;

/** Sayaç metni + sınır aşıldıysa uyarı durumu (engellemez). */
function sayac(uzunluk: number, sinir: number) {
  const asti = uzunluk > sinir;
  return {
    description: `${uzunluk} / ${sinir} karakter${asti ? " — Google kırpabilir" : ""}`,
    status: asti ? ({ type: "warning" } as const) : undefined,
  };
}

export function SeoSekmesi({
  seoTitle,
  seoDescription,
  ogImageUrl,
  onDegisti,
}: {
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string | null;
  onDegisti: () => void;
}) {
  const [baslik, setBaslik] = useState(seoTitle);
  const [aciklama, setAciklama] = useState(seoDescription);
  const gecikmeli = useGecikmeliKayit();

  function yazBaslik(v: string) {
    setBaslik(v);
    gecikmeli("seo-baslik", () =>
      bilgiGuncelle({ seoTitle: v }).then(onDegisti),
    );
  }

  function yazAciklama(v: string) {
    setAciklama(v);
    gecikmeli("seo-aciklama", () =>
      bilgiGuncelle({ seoDescription: v }).then(onDegisti),
    );
  }

  return (
    <>
      <SayfaBasligi
        baslik="SEO"
        altMetin="Sitenin arama sonuçlarında ve paylaşımlarda nasıl görüneceğini belirler."
      />

      <Kart className="flex flex-col gap-14 p-20">
        <TextInput
          label="Sayfa başlığı"
          value={baslik}
          onChange={yazBaslik}
          {...sayac(baslik.length, BASLIK_SINIR)}
        />

        <TextArea
          label="Açıklama"
          rows={3}
          value={aciklama}
          onChange={yazAciklama}
          {...sayac(aciklama.length, ACIKLAMA_SINIR)}
        />
      </Kart>

      <Kart className="flex flex-col gap-10 p-20">
        <Text type="label" color="secondary">
          Google’da böyle görünür
        </Text>
        {/* Sade bir taklit — gerçek arama sonucu değil. */}
        <VStack gap={0.5}>
          <Text type="supporting">sarnickasap.com</Text>
          <span className="text-18 leading-15 text-[#1a0dab]">
            {baslik.slice(0, BASLIK_SINIR) || "Başlık girilmedi"}
            {baslik.length > BASLIK_SINIR && "…"}
          </span>
          <Text type="supporting">
            {aciklama.slice(0, ACIKLAMA_SINIR) || "Açıklama girilmedi"}
            {aciklama.length > ACIKLAMA_SINIR && "…"}
          </Text>
        </VStack>
      </Kart>

      <PaylasimGorseli ogImageUrl={ogImageUrl} onDegisti={onDegisti} />

      <Text type="supporting" as="p">
        Not: Dükkân adı, adres, telefon ve çalışma saatleri “İletişim &amp;
        saatler” sekmesinden alınıp arama motorlarına otomatik bildirilir.
      </Text>
    </>
  );
}
