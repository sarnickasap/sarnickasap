"use client";

import { IconButton } from "@astryxdesign/core/IconButton";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { KapatIkonu, MenuIkonu } from "@/components/icons";

/* Çekmece kodu ilk açılışta yüklenir — ana sayfa paketine girmez. */
const Drawer = dynamic(() => import("@astryxdesign/core/Drawer").then((m) => m.Drawer), { ssr: false });

/* ──────────────────────────────────────────────────────────────────────────
   Mobil menü — TASARIMDA YOK (onaylı sapma #1, karar K-18).

   Neden: 390px'te tasarımın 6 nav linkinden yalnızca ~1,5'i görünüyor,
   kalanı görsel göstergesi olmayan yatay kaydırmada kalıyordu.

   Astryx Drawer (modal <dialog>): odak tuzağı, Escape/scrim ile kapanma,
   kaydırma kilidi ve top-layer yerleşimi bileşenden gelir. 640px altında
   tam ekran (eski tam ekran menünün yerini tutar), 768px'te kapanır.
   Görsel dil tasarımdan: #0a0a0a zemin, #1f1f1f kenarlık, #a3a3a3 link,
   #171717 hover, r8.

   Çekmece yalnız açıkken DOM'da: kapalı <dialog> <header> içinde kalırsa
   `header nav a` iki kez sayılır (testler ve ekran okuyucu gezintisi).
   Kaldırılınca odak elle menü düğmesine döner.
   ────────────────────────────────────────────────────────────────────────── */

type Baglanti = { href: string; label: string };

const MENU_GENISLIGI = 360;

export function MobilMenu({ baglantilar }: { baglantilar: readonly Baglanti[] }) {
  const [acik, setAcik] = useState(false);
  const dugmeRef = useRef<HTMLButtonElement>(null);

  const kapat = useCallback(() => setAcik(false), []);

  /* Kapanınca odak düğmeye döner. Temizlik, <dialog> DOM'dan kalktıktan
     sonra çalışır — düğme artık `inert` değildir. Ref efekt içinde
     kopyalanır: temizlik anında başka bir düğümü gösteriyor olabilir. */
  useEffect(() => {
    if (!acik) return;
    const dugme = dugmeRef.current;
    return () => dugme?.focus();
  }, [acik]);

  /* 768px'e çıkıldığında menü açık kalmasın — masaüstü nav zaten görünür. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => mq.matches && setAcik(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <IconButton
        ref={dugmeRef}
        variant="ghost"
        size="lg"
        label="Menüyü aç"
        icon={<MenuIkonu size={20} />}
        onClick={() => setAcik(true)}
        aria-expanded={acik}
        aria-controls="mobil-menu"
        className="h-40 w-40 flex-none md:hidden"
      />

      {acik && (
        <Drawer
          id="mobil-menu"
          role="dialog"
          isOpen
          onOpenChange={(yeni) => !yeni && kapat()}
          label="Menü"
          width={MENU_GENISLIGI}
          padding={0}
          experimental={{ isFullWidthOnMobile: true }}
          className="bg-ink"
        >
          <div className="flex items-center justify-between border-b border-line px-24 py-10">
            <span className="font-display text-16 font-bold text-cream">Sarnıç Kasap</span>
            <IconButton
              data-autofocus
              variant="ghost"
              size="lg"
              label="Menüyü kapat"
              icon={<KapatIkonu size={20} />}
              onClick={kapat}
              className="h-40 w-40"
            />
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
        </Drawer>
      )}
    </>
  );
}
