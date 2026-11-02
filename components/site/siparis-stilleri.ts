/* ──────────────────────────────────────────────────────────────────────────
   Sepet / sipariş sayfalarının ortak sınıfları — TASARIMDA YOK (K-37).
   Hepsi sitenin mevcut tokenlarından türetildi; yeni renk/ölçü yok:
     kart     ürün ızgarasının çerçevesi (1px #1f1f1f · r12) + #0f0f0f zemin
     birincil hero birincil butonu (h48 · px22 · r8 · #b8222a · 15px/600)
     ikincil  hero ikincil butonu (h48 · 1px #333333 · 15px/500)
     girdi    1px #333333 · r8 · #0a0a0a · 15px · #fafafa
     etiket   13px/500 · #d4d4d4 (hero meta satırının tonu)
     hata     13px · #f87171 (indirim oranının rengi; koyu zeminde 6,4:1)
   ────────────────────────────────────────────────────────────────────────── */

export const KART = "flex flex-col gap-16 rounded-12 border border-line bg-ink-2 p-22";

export const BIRINCIL =
  "flex h-48 cursor-pointer items-center justify-center gap-10 rounded-8 border-0 bg-brand px-22 text-15 font-semibold text-white " +
  "transition-colors duration-150 ease-out-soft hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60";

export const IKINCIL =
  "flex h-48 items-center justify-center gap-10 rounded-8 border border-edge px-22 text-15 font-medium text-body " +
  "transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-white";

export const GIRDI =
  "w-full min-w-0 rounded-8 border border-edge bg-ink px-12 text-15 text-body aria-[invalid=true]:border-discount";

export const ETIKET = "text-13 font-medium text-soft";

export const HATA = "m-0 text-13 text-discount";

export const IPUCU = "m-0 text-13 leading-15 text-muted";
