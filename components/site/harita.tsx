"use client";

import { Button } from "@astryxdesign/core/Button";
import { useEffect, useRef, useState } from "react";
import { KonumIkonu } from "@/components/icons";
import { CERCEVELI } from "./siparis-stilleri";

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
   düzen kayması yok. Düğme Astryx Button, sitenin ikincil düğme dilinde
   (h40 · 1px #333333 · 14px/500). Tıklanınca odak iframe'e taşınır (düğme kaybolduğu için odak
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
          <Button
            size="lg"
            label="Haritayı göster"
            onClick={() => setGoster(true)}
            className={`h-40 px-16 text-14 ${CERCEVELI}`}
          />
          <p className="m-0 max-w-[280px] text-12 leading-15 text-muted-dark">
            Harita Google Haritalar’dan yüklenir.
          </p>
        </div>
      )}
    </div>
  );
}
