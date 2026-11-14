"use client";

import { useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { ALAN, ETIKET, Kart, SATIR_AYRACI, SayfaBasligi } from "./ui";
import { fiyat } from "@/lib/format";
import { topluFiyat } from "@/lib/actions/admin";
import type { AdminUrun } from "./urunler-sekmesi";

/* ──────────────────────────────────────────────────────────────────────────
   Toplu fiyat güncelleme.
     form kartı  Kategori · Değişim (%) · Yuvarlama · "N ürüne uygula"
                 Alanlar YEREL ve <label> içinde: e2e testi
                 `main label … select/input` ile buluyor, selectOption kullanıyor.
     önizleme    kart; ilk satır başlık, sonra ürün başına bir satır
                 (testler kartın doğrudan div çocuklarını sayıyor).

   Hesap tasarımdaki bulkCalc ile birebir:
     Math.max(0, Math.round(price * (1 + pct/100) / round) * round)
   Önizleme CANLI — kaydetmez.
   ────────────────────────────────────────────────────────────────────────── */

const TUMU = "Tümü";
const SECIM = `${ALAN} font-normal`;

export function TopluFiyatSekmesi({
  urunler,
  kategoriler,
  onUygulandi,
}: {
  urunler: AdminUrun[];
  kategoriler: { id: number; name: string }[];
  onUygulandi: () => void;
}) {
  const [kat, setKat] = useState(TUMU);
  const [yuzde, setYuzde] = useState("10");
  const [yuvarlama, setYuvarlama] = useState("5");
  const [calisiyor, setCalisiyor] = useState(false);

  const katAdi = (id: number) => kategoriler.find((k) => k.id === id)?.name ?? "";
  const hedef = urunler.filter((p) => kat === TUMU || katAdi(p.categoryId) === kat);

  const hesapla = (p: number) => {
    const r = Math.max(1, Math.round(Number(yuvarlama)) || 1);
    const pct = Number(yuzde) || 0;
    return Math.max(0, Math.round((p * (1 + pct / 100)) / r) * r);
  };

  async function uygula() {
    if (!hedef.length) return;
    if (!confirm(`${hedef.length} ürünün fiyatı %${yuzde} değiştirilsin mi?`))
      return;
    setCalisiyor(true);
    try {
      await topluFiyat(kat, Number(yuzde) || 0, Number(yuvarlama) || 1);
      onUygulandi();
      location.reload(); // Ürünler sekmesindeki liste tazelensin
    } finally {
      setCalisiyor(false);
    }
  }

  return (
    <>
      <SayfaBasligi
        baslik="Toplu fiyat güncelleme"
        altMetin="Bir kategorideki veya tüm ürünlerin fiyatını yüzde olarak artırın ya da azaltın."
      />

      <Kart className="flex flex-wrap items-end gap-16 p-20">
        <label className={`${ETIKET} flex-[1_1_180px]`}>
          Kategori
          <select
            value={kat}
            onChange={(e) => setKat(e.target.value)}
            className={SECIM}
          >
            {[TUMU, ...kategoriler.map((k) => k.name)].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={`${ETIKET} flex-[1_1_140px]`}>
          Değişim (%)
          <input
            type="number"
            value={yuzde}
            onChange={(e) => setYuzde(e.target.value)}
            placeholder="Örn. 10 veya -5"
            className={SECIM}
          />
        </label>

        <label className={`${ETIKET} flex-[1_1_160px]`}>
          Yuvarlama
          <select
            value={yuvarlama}
            onChange={(e) => setYuvarlama(e.target.value)}
            className={SECIM}
          >
            <option value="1">1 ₺</option>
            <option value="5">5 ₺</option>
            <option value="10">10 ₺</option>
          </select>
        </label>

        <Button
          label={`${hedef.length} ürüne uygula`}
          variant="primary"
          onClick={uygula}
          isLoading={calisiyor}
          isDisabled={hedef.length === 0}
          className="flex-[0_0_auto]"
        >
          {calisiyor ? "Uygulanıyor…" : `${hedef.length} ürüne uygula`}
        </Button>
      </Kart>

      <Kart className="overflow-hidden">
        <div className={`flex justify-between px-16 py-12 ${SATIR_AYRACI}`}>
          <Text type="label" color="secondary">Önizleme</Text>
          <Text type="label" color="secondary">Eski → yeni</Text>
        </div>
        {hedef.map((p) => (
          <div
            key={p.id}
            className={`flex justify-between gap-12 px-16 py-10 ${SATIR_AYRACI}`}
          >
            <Text weight="medium">
              {p.name}{" "}
              <Text color="secondary" weight="normal">
                · {katAdi(p.categoryId)}
              </Text>
            </Text>
            <Text hasTabularNumbers className="whitespace-nowrap">
              <Text color="secondary">{fiyat(p.price)}</Text> →{" "}
              <Text weight="semibold">{fiyat(hesapla(p.price))}</Text>
            </Text>
          </div>
        ))}
      </Kart>
    </>
  );
}
