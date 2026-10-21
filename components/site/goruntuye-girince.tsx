"use client";

import { useEffect, useRef } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Bölüm giriş animasyonu — karar K-20, madde 2:
   "görünüme girince opacity 0→1 + translateY 12px→0, 400ms, sırayla"

   TASARIMDA YOK (K-10: kullanıcı "animasyon olursa iyi olur" dedi).

   ⚠️ Üç koruma:
   1. `prefers-reduced-motion: reduce` → animasyon hiç kurulmaz.
   2. JavaScript çalışmazsa içerik GİZLİ KALMAZ: başlangıç durumu CSS'te
      değil, yalnız efekt çalışınca DOM'a yazılıyor.
   3. Gözlemci bir kez tetiklenip bağlantıyı kesiyor.

   React state'i KULLANILMIYOR: efekt içinde senkron setState zincirleme
   render tetikliyor (eslint react-hooks uyarısı). Burada yapılan iş zaten
   "harici bir sistemi (DOM) güncellemek" — efektin asıl amacı bu.
   ────────────────────────────────────────────────────────────────────────── */

export function GoruntuyeGirince({
  children,
  gecikmeMs = 0,
}: {
  children: React.ReactNode;
  gecikmeMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gecis =
      "opacity 400ms var(--ease-out-soft), transform 400ms var(--ease-out-soft)";

    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = gecis;
    if (gecikmeMs) el.style.transitionDelay = `${gecikmeMs}ms`;

    const gozlemci = new IntersectionObserver(
      ([giris]) => {
        if (!giris.isIntersecting) return;
        el.style.opacity = "1";
        el.style.transform = "none";
        gozlemci.disconnect();
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.05 },
    );

    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, [gecikmeMs]);

  return <div ref={ref}>{children}</div>;
}
