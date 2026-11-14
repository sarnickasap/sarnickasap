"use client";

import { ToggleButton } from "@astryxdesign/core/ToggleButton";
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

   Erişilebilirlik (K-08): Astryx ToggleButton (`aria-pressed`).
   `role="tablist"` değil — bunlar panel açan sekmeler değil, tek bir listeyi
   süzen filtre düğmeleri. Sonuç sayısı `aria-live` ile duyuruluyor.
   Pil görünümü (yukarıdaki ölçüler) className ile korunur.
   ────────────────────────────────────────────────────────────────────────── */

const TUMU = "Tümü";

const SEKME =
  "h-38 flex-none rounded-pill border border-edge bg-transparent px-16 text-14 font-medium whitespace-nowrap text-soft hover:text-white " +
  "aria-pressed:border-cream aria-pressed:bg-cream aria-pressed:font-semibold aria-pressed:text-ink";

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
        {sekmeler.map((k) => (
          <ToggleButton
            key={k}
            label={k}
            isPressed={k === secili}
            onPressedChange={() => setSecili(k)}
            className={SEKME}
          />
        ))}
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
