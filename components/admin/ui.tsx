"use client";

import { ArtiIkonu, CopIkonu } from "@/components/icons";

/* ──────────────────────────────────────────────────────────────────────────
   Admin form primitifleri — vault "Admin Form Elemanlari", "Durum Toggle
   Butonu", "Sil Butonu", "Admin Sayfa Basligi" notlarından birebir.

   Ortak: 1px #e5e5e5 · r8 · bg #ffffff · font:inherit · min-w-0
   Odak: global `:focus-visible` (bkz. globals.css) — tasarımın
   `2px solid #a3a3a3` kuralı beyaz üstünde 2,52:1 ile WCAG 1.4.11'in
   istediği 3:1'in altındaydı.
   ────────────────────────────────────────────────────────────────────────── */

export const GIRDI_TABAN =
  "rounded-8 border border-admin-border bg-admin-card text-black min-w-0";

/** h38 · px10 · 14px/400 — iletişim formu, filtreler */
export const GIRDI_38 = `${GIRDI_TABAN} h-38 px-10 text-14 font-normal`;
/** h36 · px10 · 14px — satır içi alanlar */
export const GIRDI_36 = `${GIRDI_TABAN} h-36 px-10 text-14`;
/** h34 · px10 · 13px — galeri kartı */
export const GIRDI_34 = `${GIRDI_TABAN} h-34 px-10 text-13`;

export function SiyahButon({
  children,
  onClick,
  tip = "buton",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tip?: "buton" | "arti";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-38 cursor-pointer items-center gap-6 rounded-8 border-0 bg-black px-14 text-14 font-medium text-white transition-colors duration-150 ease-out-soft hover:bg-admin-ink-hover"
    >
      {tip === "arti" && <ArtiIkonu size={16} />}
      {children}
    </button>
  );
}

/** Tasarım: flex-wrap · justify-between · items-end · gap12
 *  Sol blok flex-col gap4 → h1 DM Sans 28/700 ls-.02em + p 14 #737373 */
export function SayfaBasligi({
  baslik,
  altMetin,
  aksiyon,
}: {
  baslik: string;
  altMetin: string;
  aksiyon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-12">
      <div className="flex flex-col gap-4">
        <h1 className="m-0 font-display text-28 font-bold tracking-admin-h1 text-black">
          {baslik}
        </h1>
        <p className="m-0 text-14 text-admin-muted">{altMetin}</p>
      </div>
      {aksiyon}
    </div>
  );
}

/**
 * Durum toggle — 3 yerde aynı ölçüler, farklı metinler.
 * Açık : 1px #bbf7d0 · bg #f0fdf4 · #15803d
 * Kapalı: 1px #e5e5e5 · bg #f5f5f5 · #737373
 * Tasarımda hover tanımlı DEĞİL.
 */
export function DurumToggle({
  acik,
  acikMetin,
  kapaliMetin,
  onChange,
}: {
  acik: boolean;
  acikMetin: string;
  kapaliMetin: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={acik}
      className={
        "h-36 w-92 flex-none cursor-pointer rounded-8 border text-13 font-medium " +
        (acik
          ? "border-ok-border bg-ok-bg text-ok-text"
          : "border-admin-border bg-admin-off text-admin-muted")
      }
    >
      {acik ? acikMetin : kapaliMetin}
    </button>
  );
}

/** Sil butonu. Galeri varyantı 34×34 + 15px ikon. */
export function SilButonu({
  onClick,
  kucuk = false,
  etiket,
}: {
  onClick: () => void;
  kucuk?: boolean;
  etiket: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Sil"
      aria-label={etiket}
      className={
        "flex flex-none cursor-pointer items-center justify-center rounded-8 border-0 bg-transparent text-admin-muted transition-colors duration-150 ease-out-soft hover:bg-danger-bg hover:text-danger " +
        (kucuk ? "h-34 w-34" : "h-36 w-36")
      }
    >
      <CopIkonu size={kucuk ? 15 : 16} />
    </button>
  );
}

/** Beyaz kart: bg #ffffff · 1px #e5e5e5 · r12 */
export function Kart({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-12 border border-admin-border bg-admin-card ${className}`}
    >
      {children}
    </div>
  );
}
