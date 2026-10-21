"use client";

import { useMemo, useState } from "react";
import { UrunKarti, type UrunVerisi } from "./urun-karti";

/* ──────────────────────────────────────────────────────────────────────────
   Kategori sekmeleri + ürün ızgarası.

   Sekmeler — vault "Kategori Sekmesi":
     ortak   h38 · px16 · r999 · 14px · flex-none · whitespace-nowrap
     aktif   1px #f8efea · bg #f8efea · #0a0a0a · 600   (hover TANIMSIZ)
     pasif   1px #333333 · bg transparent · #d4d4d4 · 500
             hover → bg #171717, beyaz
   Şerit: flex · gap8 · overflow-x-auto · pb4 · scrollbar yok

   Izgara — vault "Urunler Bolumu":
     auto-fill minmax(min(100%,260px),1fr) · gap 1px
     bg #1f1f1f · 1px #1f1f1f · r12 · overflow hidden
     ⚠️ Izgara çizgisi hilesi: hücre aralığı 1px ve kapsayıcı zemini #1f1f1f;
     kartların kendi zemini #0a0a0a. Kartların KENDİ KENARLIĞI YOK.

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
}: {
  urunler: UrunVerisi[];
  kategoriler: string[];
  whatsapp: string;
}) {
  const [secili, setSecili] = useState(TUMU);
  const sekmeler = useMemo(() => [TUMU, ...kategoriler], [kategoriler]);

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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-1 overflow-hidden rounded-12 border border-line bg-line">
        {gorunen.map((u) => (
          <UrunKarti key={u.id} urun={u} whatsapp={whatsapp} />
        ))}

        {/* Boş durum — tasarımda YOK (K-08). Admin'deki "Eşleşen ürün yok."
            metninin koyu tema karşılığı; yeni token icat edilmedi. */}
        {gorunen.length === 0 && (
          <p className="col-span-full m-0 bg-ink p-32 text-center text-14 text-muted">
            Bu kategoride ürün yok.
          </p>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {gorunen.length} ürün listeleniyor
      </p>
    </>
  );
}
