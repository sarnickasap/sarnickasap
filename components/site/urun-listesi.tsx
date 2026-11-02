"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { kategoriOzetleri } from "@/lib/urun-kaynagi";
import type { UrunVerisi } from "./urun-karti";
import { UrunIzgarasi } from "./urun-izgarasi";

/* ──────────────────────────────────────────────────────────────────────────
   Kategori sekmeleri + ürün ızgarası.

   Sekmeler — vault "Kategori Sekmesi":
     ortak   h38 · px16 · r999 · 14px · flex-none · whitespace-nowrap
     aktif   1px #f8efea · bg #f8efea · #0a0a0a · 600   (hover TANIMSIZ)
     pasif   1px #333333 · bg transparent · #d4d4d4 · 500
             hover → bg #171717, beyaz
   Şerit: flex · gap8 · overflow-x-auto · pb4 · scrollbar yok

   Izgara — urun-izgarasi.tsx (kategori sayfalarıyla ortak).

   Aşama 4: bir kategori seçiliyken ızgaranın altında sağa yaslı
   "Tüm <kategori> ürünleri →" bağlantısı (/urunler/<slug>). "Tümü"
   seçiliyken HİÇ render edilmez — varsayılan görünüm tasarımla aynı.
     14px/500 · #f8efea · alt çizgi · hover beyaz (iletişimdeki
     "Yol tarifi al" ile aynı dil)

   Erişilebilirlik (K-08): tasarımda düz <button>'lardı.
   `role="tablist"` yerine `aria-pressed` seçildi — bunlar panel açan sekmeler
   değil, tek bir listeyi süzen filtre düğmeleri. Sonuç sayısı `aria-live`
   ile duyuruluyor. Görünüm değişmiyor.
   ────────────────────────────────────────────────────────────────────────── */

const TUMU = "Tümü";

export function UrunListesi({
  urunler,
  kategoriler,
  whatsapp,
  siparisAcik,
}: {
  urunler: UrunVerisi[];
  kategoriler: string[];
  whatsapp: string;
  siparisAcik: boolean;
}) {
  const [secili, setSecili] = useState(TUMU);
  const sekmeler = useMemo(() => [TUMU, ...kategoriler], [kategoriler]);

  const slugMap = useMemo(
    () => new Map(kategoriOzetleri(kategoriler).map((k) => [k.ad, k.slug])),
    [kategoriler],
  );
  const seciliSlug = secili === TUMU ? undefined : slugMap.get(secili);

  const gorunen = useMemo(
    () => (secili === TUMU ? urunler : urunler.filter((u) => u.cat === secili)),
    [urunler, secili],
  );

  return (
    <>
      <div
        role="group"
        aria-label="Kategori filtresi"
        className="no-scrollbar flex gap-8 overflow-x-auto pb-4"
      >
        {sekmeler.map((k) => {
          const aktif = k === secili;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setSecili(k)}
              aria-pressed={aktif}
              className={
                "h-38 flex-none cursor-pointer rounded-pill border px-16 text-14 whitespace-nowrap " +
                (aktif
                  ? "border-cream bg-cream font-semibold text-ink"
                  : "border-edge bg-transparent font-medium text-soft transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-white")
              }
            >
              {k}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-12">
        <UrunIzgarasi urunler={gorunen} whatsapp={whatsapp} siparisAcik={siparisAcik} />

        {seciliSlug && (
          <Link
            href={`/urunler/${seciliSlug}`}
            className="self-end text-14 font-medium text-cream underline underline-offset-2 transition-colors duration-150 ease-out-soft hover:text-white"
          >
            Tüm {secili.toLocaleLowerCase("tr-TR")} ürünleri →
          </Link>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {gorunen.length} ürün listeleniyor
      </p>
    </>
  );
}
