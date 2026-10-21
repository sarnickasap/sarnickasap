"use client";

import { useState } from "react";
import { GIRDI, Kart, SayfaBasligi } from "./ui";
import { fiyat } from "@/lib/format";
import { topluFiyat } from "@/lib/actions/admin";
import type { AdminUrun } from "./urunler-sekmesi";

/* ──────────────────────────────────────────────────────────────────────────
   Toplu fiyat güncelleme — vault "Toplu Fiyat Formu" notundan birebir.

     form kartı  bg #fff · 1px #e5e5e5 · r12 · p20
                 flex-wrap · gap16 · items-end
       Kategori    1 1 180px · select h38
       Değişim (%) 1 1 140px · number, placeholder "Örn. 10 veya -5"
       Yuvarlama   1 1 160px · select 1 ₺ / 5 ₺ / 10 ₺
       Uygula      0 0 auto · h38 px18 r8 · #b8222a · 14px/600 · hover #9e1c23
     label kalıbı flex-col gap6 · 13px/500, alan içinde font-weight 400

     önizleme    bg #fff · 1px #e5e5e5 · r12 · overflow-hidden
       başlık    p 12px 16px · alt kenarlık 1px #e5e5e5
                 12px/600 · #737373 · uppercase · ls .06em
                 sol "Önizleme" · sağ "Eski → yeni"
       satır     p 11px 16px · alt kenarlık 1px #f5f5f5 · 14px
                 sol: ad + " · kategori" (#a3a3a3, 400)
                 sağ: eski (#a3a3a3) + " → " + <strong>yeni</strong>

   Hesap tasarımdaki bulkCalc ile birebir:
     Math.max(0, Math.round(price * (1 + pct/100) / round) * round)
   Önizleme CANLI — kaydetmez.
   ────────────────────────────────────────────────────────────────────────── */

const TUMU = "Tümü";
const LABEL = "flex flex-col gap-6 text-13 font-medium text-black";

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
        <label className={`${LABEL} flex-[1_1_180px]`}>
          Kategori
          <select
            value={kat}
            onChange={(e) => setKat(e.target.value)}
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          >
            {[TUMU, ...kategoriler.map((k) => k.name)].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={`${LABEL} flex-[1_1_140px]`}>
          Değişim (%)
          <input
            type="number"
            value={yuzde}
            onChange={(e) => setYuzde(e.target.value)}
            placeholder="Örn. 10 veya -5"
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          />
        </label>

        <label className={`${LABEL} flex-[1_1_160px]`}>
          Yuvarlama
          <select
            value={yuvarlama}
            onChange={(e) => setYuvarlama(e.target.value)}
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          >
            <option value="1">1 ₺</option>
            <option value="5">5 ₺</option>
            <option value="10">10 ₺</option>
          </select>
        </label>

        <button
          type="button"
          onClick={uygula}
          disabled={calisiyor || hedef.length === 0}
          className="h-38 flex-[0_0_auto] cursor-pointer rounded-8 border-0 bg-brand px-18 text-14 font-semibold text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {calisiyor ? "Uygulanıyor…" : `${hedef.length} ürüne uygula`}
        </button>
      </Kart>

      <Kart className="overflow-hidden">
        <div className="flex justify-between border-b border-admin-border px-16 py-12 text-12 font-semibold tracking-table uppercase text-admin-muted">
          <span>Önizleme</span>
          <span>Eski → yeni</span>
        </div>
        {hedef.map((p) => (
          <div
            key={p.id}
            className="flex justify-between gap-12 border-b border-admin-hair px-16 py-11 text-14"
          >
            <span className="font-medium">
              {p.name}{" "}
              <span className="font-normal text-faint-light">
                · {katAdi(p.categoryId)}
              </span>
            </span>
            <span className="whitespace-nowrap">
              <span className="text-faint-light">{fiyat(p.price)}</span> →{" "}
              <strong>{fiyat(hesapla(p.price))}</strong>
            </span>
          </div>
        ))}
      </Kart>
    </>
  );
}
