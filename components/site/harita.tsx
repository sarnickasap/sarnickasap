"use client";

import { useEffect, useRef, useState } from "react";
import { KonumIkonu } from "@/components/icons";

/* ──────────────────────────────────────────────────────────────────────────
   Harita — TIKLAYINCA yüklenen yüz (facade). Aşama 4, K-26'nın devamı.

   K-26: tasarımdaki `loading="lazy"` iframe, harita 4468 px aşağıdayken
   bile açılışta 387 KB Google kaynağı indiriyordu. Önce IntersectionObserver
   ile 400 px kala yükleniyordu; bu, sayfayı sonuna kadar kaydıran her
   ziyaretçide yine ~387 KB ve Google'a istek demekti.

   Artık iframe yalnızca ziyaretçi "Haritayı göster"e basınca DOM'a girer.
   Yol tarifi isteyen çoğunluk için iletişim listesinde doğrudan Google
   Haritalar bağlantısı var (iletisim.tsx) — haritayı açmaya gerek yok.

   Kutu ölçüsü değişmedi (min-h 420, r12, 1px #1f1f1f, bg #171717) →
   düzen kayması yok. Düğme sitenin ikincil düğme dili (h40 · r8 ·
   1px #333333 · 14px/500); kutu zemini #171717 olduğu için hover zemini
   #0a0a0a. Tıklanınca odak iframe'e taşınır (düğme kaybolduğu için odak
   sayfanın başına düşmesin).
   ────────────────────────────────────────────────────────────────────────── */

export function Harita({ src }: { src: string }) {
  const [goster, setGoster] = useState(false);
  const cerceve = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (goster) cerceve.current?.focus();
  }, [goster]);

  return (
    <div className="flex min-h-420 flex-col overflow-hidden rounded-12 border border-line bg-hover">
      {goster ? (
        <iframe
          ref={cerceve}
          title="Sarnıç Kasap konumu — Google Haritalar"
          src={src}
          loading="lazy"
          className="map-filter block min-h-420 w-full flex-1 border-0"
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-12 p-24 text-center">
          <KonumIkonu size={28} className="text-brand-accent" />
          <button
            type="button"
            onClick={() => setGoster(true)}
            className="flex h-40 cursor-pointer items-center justify-center rounded-8 border border-edge bg-transparent px-16 text-14 font-medium text-body transition-colors duration-150 ease-out-soft hover:bg-ink hover:text-white"
          >
            Haritayı göster
          </button>
          <p className="m-0 max-w-[280px] text-12 leading-15 text-muted-dark">
            Harita Google Haritalar’dan yüklenir.
          </p>
        </div>
      )}
    </div>
  );
}
