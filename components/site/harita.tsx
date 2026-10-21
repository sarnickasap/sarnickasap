"use client";

import { useEffect, useRef, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Harita — görünüme yaklaşana kadar yüklenmez.

   Tasarımda iframe `loading="lazy"` ile doğrudan yazılıydı. Ölçüldü:
   Chromium'un lazy eşiği çok geniş ve harita 4468px aşağıdayken bile
   sayfa açılışında **387 KB** Google kaynağı indiriliyordu. Ziyaretçilerin
   çoğu oraya hiç inmiyor; ayrıca her ziyaretçi için Google'a anında istek
   gidiyordu.

   Bu bileşen iframe'i ancak 400px yaklaşınca DOM'a ekliyor. Yer tutucu
   kutusu birebir aynı ölçüde (min-h 420, r12, 1px #1f1f1f, bg #171717),
   dolayısıyla düzen kayması YOK — zaten harita yüklenene kadar görünen
   şey de aynı gri kutuydu.
   ────────────────────────────────────────────────────────────────────────── */

export function Harita({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [yukle, setYukle] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const gozlemci = new IntersectionObserver(
      ([giris]) => {
        if (!giris.isIntersecting) return;
        setYukle(true);
        gozlemci.disconnect();
      },
      { rootMargin: "400px" },
    );

    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="min-h-420 overflow-hidden rounded-12 border border-line bg-hover"
    >
      {yukle && (
        <iframe
          title="Sarnıç Kasap konum"
          src={src}
          loading="lazy"
          className="map-filter block h-full min-h-420 w-full border-0"
        />
      )}
    </div>
  );
}
