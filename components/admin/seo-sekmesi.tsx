"use client";

import { useState } from "react";
import { GIRDI, Kart, SayfaBasligi } from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { bilgiGuncelle } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   SEO sekmesi — TASARIMDA YOK (onaylı sapma #4, K-11/K-19).
   Kullanıcı isteği: "seo olsun başlık admin panelinden değiştirilebilsin".

   Görsel dil admin panelinden; yeni token icat edilmedi.
   Önizleme, Google sonuç kartının sade bir taklidi — gerçek arama sonucu
   değil, yalnızca uzunluk ve okunuş hissi versin diye.

   Uzunluk eşikleri sektör pratiği: başlık ~60, açıklama ~155 karakter
   sonrası Google kırpar. Eşik aşılınca uyarı gösteriliyor, ENGELLENMİYOR.
   ────────────────────────────────────────────────────────────────────────── */

const LABEL = "flex flex-col gap-6 text-13 font-medium text-black";
const BASLIK_SINIR = 60;
const ACIKLAMA_SINIR = 155;

function Sayac({ uzunluk, sinir }: { uzunluk: number; sinir: number }) {
  const asti = uzunluk > sinir;
  return (
    <span
      className={
        "text-12 font-normal " + (asti ? "text-danger" : "text-admin-muted")
      }
    >
      {uzunluk} / {sinir} karakter
      {asti && " — Google kırpabilir"}
    </span>
  );
}

export function SeoSekmesi({
  seoTitle,
  seoDescription,
  onDegisti,
}: {
  seoTitle: string;
  seoDescription: string;
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
        <label className={LABEL}>
          <span className="flex flex-wrap items-baseline justify-between gap-8">
            Sayfa başlığı
            <Sayac uzunluk={baslik.length} sinir={BASLIK_SINIR} />
          </span>
          <input
            value={baslik}
            onChange={(e) => yazBaslik(e.target.value)}
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          />
        </label>

        <label className={LABEL}>
          <span className="flex flex-wrap items-baseline justify-between gap-8">
            Açıklama
            <Sayac uzunluk={aciklama.length} sinir={ACIKLAMA_SINIR} />
          </span>
          <textarea
            value={aciklama}
            onChange={(e) => yazAciklama(e.target.value)}
            rows={3}
            className={`${GIRDI} resize-y px-10 py-8 text-14 leading-15 font-normal text-form`}
          />
        </label>
      </Kart>

      <Kart className="flex flex-col gap-10 p-20">
        <span className="text-12 font-semibold tracking-table uppercase text-admin-muted">
          Google’da böyle görünür
        </span>
        {/* Sade bir taklit — gerçek arama sonucu değil. */}
        <div className="flex flex-col gap-2">
          <span className="text-12 text-admin-muted">sarnickasap.com</span>
          <span className="text-18 leading-15 text-[#1a0dab]">
            {baslik.slice(0, BASLIK_SINIR) || "Başlık girilmedi"}
            {baslik.length > BASLIK_SINIR && "…"}
          </span>
          <span className="text-13 leading-15 text-admin-2nd">
            {aciklama.slice(0, ACIKLAMA_SINIR) || "Açıklama girilmedi"}
            {aciklama.length > ACIKLAMA_SINIR && "…"}
          </span>
        </div>
      </Kart>

      <p className="m-0 text-13 leading-15 text-admin-muted">
        Not: Dükkân adı, adres, telefon ve çalışma saatleri “İletişim &amp;
        saatler” sekmesinden alınıp arama motorlarına otomatik bildirilir.
      </p>
    </>
  );
}
