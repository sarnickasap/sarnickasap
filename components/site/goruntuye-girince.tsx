"use client";

import { useEffect, useRef, useState } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Bölüm giriş animasyonu — karar K-20, madde 2:
   "görünüme girince opacity 0→1 + translateY 12px→0, 400ms, sırayla"

   TASARIMDA YOK (K-10: kullanıcı "animasyon olursa iyi olur" dedi).

   ⚠️ İki koruma:
   1. `prefers-reduced-motion: reduce` → animasyon hiç kurulmaz, içerik
      doğrudan görünür. (globals.css'teki genel kural da ayrıca var.)
   2. JavaScript çalışmazsa içerik GİZLİ KALMAMALI. Bu yüzden başlangıç
      durumu CSS'te değil, yalnız JS etkinse uygulanıyor — `useEffect`
      çalışmazsa öğe zaten görünür olur.
   ────────────────────────────────────────────────────────────────────────── */

export function GoruntuyeGirince({
  children,
  gecikmeMs = 0,
}: {
  children: React.ReactNode;
  gecikmeMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hazir, setHazir] = useState(false);
  const [gorundu, setGorundu] = useState(false);

  useEffect(() => {
    const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (azHareket.matches) return;

    // JS çalışıyor → animasyonu devreye al
    setHazir(true);

    const el = ref.current;
    if (!el) return;

    const gozlemci = new IntersectionObserver(
      ([giris]) => {
        if (giris.isIntersecting) {
          setGorundu(true);
          gozlemci.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.05 },
    );
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={
        hazir
          ? {
              opacity: gorundu ? 1 : 0,
              transform: gorundu ? "none" : "translateY(12px)",
              transition:
                "opacity 400ms var(--ease-out-soft), transform 400ms var(--ease-out-soft)",
              transitionDelay: gorundu ? `${gecikmeMs}ms` : "0ms",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
