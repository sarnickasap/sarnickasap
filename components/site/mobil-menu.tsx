"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { KapatIkonu, MenuIkonu } from "@/components/icons";

/* ──────────────────────────────────────────────────────────────────────────
   Mobil menü — TASARIMDA YOK (onaylı sapma #1, karar K-18).

   Neden: 390px'te tasarımın 6 nav linkinden yalnızca ~1,5'i görünüyor,
   kalanı görsel göstergesi olmayan yatay kaydırmada kalıyordu.

   Görsel dil tamamen tasarımdan: #0a0a0a zemin, #1f1f1f kenarlık,
   #a3a3a3 link, #171717 hover, r8, 768px'te kapanır.

   Erişilebilirlik: odak tuzağı, Escape ile kapanma, gövde kaydırma kilidi,
   kapanınca odağın düğmeye dönmesi, aria-expanded/controls.
   ────────────────────────────────────────────────────────────────────────── */

type Baglanti = { href: string; label: string };

export function MobilMenu({ baglantilar }: { baglantilar: readonly Baglanti[] }) {
  const [acik, setAcik] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dugmeRef = useRef<HTMLButtonElement>(null);

  const kapat = useCallback(() => setAcik(false), []);

  useEffect(() => {
    if (!acik) return;

    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const odaklanabilir = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) ?? [],
      );

    odaklanabilir()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        kapat();
        return;
      }
      if (e.key !== "Tab") return;

      // Odak tuzağı: Tab panelin dışına çıkmasın
      const ogeler = odaklanabilir();
      if (ogeler.length === 0) return;
      const ilk = ogeler[0];
      const son = ogeler[ogeler.length - 1];
      if (e.shiftKey && document.activeElement === ilk) {
        e.preventDefault();
        son.focus();
      } else if (!e.shiftKey && document.activeElement === son) {
        e.preventDefault();
        ilk.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oncekiOverflow;
      dugmeRef.current?.focus();
    };
  }, [acik, kapat]);

  /* 768px'e çıkıldığında menü açık kalmasın — masaüstü nav zaten görünür. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setAcik(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        ref={dugmeRef}
        type="button"
        onClick={() => setAcik(true)}
        aria-label="Menüyü aç"
        aria-expanded={acik}
        aria-controls="mobil-menu"
        className="flex h-40 w-40 flex-none items-center justify-center rounded-8 text-body transition-colors duration-150 ease-out-soft hover:bg-hover md:hidden"
      >
        <MenuIkonu size={20} />
      </button>

      {acik && (
        <div
          id="mobil-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
          className="fixed inset-0 z-50 bg-ink md:hidden motion-safe:animate-[menu-ac_200ms_ease-out]"
        >
          <div ref={panelRef} className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-line px-24 py-10">
              <span className="font-display text-16 font-bold text-cream">
                Sarnıç Kasap
              </span>
              <button
                type="button"
                onClick={kapat}
                aria-label="Menüyü kapat"
                className="flex h-40 w-40 items-center justify-center rounded-8 text-body transition-colors duration-150 ease-out-soft hover:bg-hover"
              >
                <KapatIkonu size={20} />
              </button>
            </div>

            <nav aria-label="Ana menü" className="flex flex-col gap-4 p-24">
              {baglantilar.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={kapat}
                  className="rounded-8 px-12 py-14 text-18 font-medium text-muted transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-body"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
