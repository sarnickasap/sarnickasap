import { SagOkIkonu } from "@/components/icons";
import { fiyat, waLink, WA_MESAJ } from "@/lib/format";
import { birimSoneki } from "@/lib/miktar";
import type { Birim } from "@/lib/stok-sema";
import { SepeteEkle } from "./sepete-ekle";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün Kartı (ızgara hücresi) — vault "Urun Karti" notundan birebir.

     hücre  bg #0a0a0a · p22 · flex-col · gap14 · min-h 190
            KENDİ KENARLIĞI/YARIÇAPI YOK — ayrım ızgara gap:1px ile
     üst    justify-between · items-center · gap8
       kategori 12px/500 · #737373 (K-21 → #8a8a8a)
       rozet    11px/600 · py3 px8 · r999 · bg #262626 · #d4d4d4 · "Tükendi"
     metin  flex-col · gap4 · flex-1
       h3   DM Sans 20px/600 · ls -.01em · #f8efea
       p    13px · lh 1.45 · #a3a3a3   (not boşsa boş <p> yine render edilir)
     alt    items-center · justify-between · gap12
       fiyat items-baseline · gap4 → DM Sans 24px/700 beyaz + "/ kg" 13px
       ok    YALNIZCA stoktaysa · 36×36 · r8 · 1px #333333
             hover → bg+border #b8222a, beyaz

   Stok dışı davranış: kart soluklaşmaz, fiyat gizlenmez.
   Yalnızca rozet görünür ve ok butonu kaybolur.

   Stok programı kataloğu (K-37) — tasarımda YOK, kartın kendi diliyle:
     · birim soneki "/ kg" ya da "/ adet"
     · görsel YALNIZCA izinli Blob adresinden (lib/stok-sema.ts) —
       galerideki görselle aynı biçim (4/3 · r8 · #171717 zemin)
     · sipariş açıksa ve ürün stoktaysa miktar seçici + "Sepete ekle"
   ────────────────────────────────────────────────────────────────────────── */

export type UrunVerisi = {
  /** React anahtarı: stok kodu ya da DB kimliği */
  anahtar: string;
  /** Stok programı ürün kodu; DB yedeğinde null (sipariş yok) */
  code: string | null;
  name: string;
  cat: string;
  price: number;
  note: string;
  stock: boolean;
  unit: Birim;
  imageUrl: string | null;
};

export function UrunKarti({
  urun,
  whatsapp,
  siparisAcik,
}: {
  urun: UrunVerisi;
  whatsapp: string;
  siparisAcik: boolean;
}) {
  return (
    <div className="flex min-h-190 flex-col gap-14 bg-ink p-22">
      {urun.imageUrl && (
        // Blob görseli — galeriyle aynı gerekçe: next/image uzak alan adı ister.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urun.imageUrl}
          alt={urun.name}
          loading="lazy"
          decoding="async"
          className="block aspect-[4/3] w-full rounded-8 bg-hover object-cover"
        />
      )}
      <div className="flex items-center justify-between gap-8">
        <span className="text-12 font-medium text-muted-dark">{urun.cat}</span>
        {!urun.stock && (
          <span className="rounded-pill bg-badge px-8 py-3 text-11 font-semibold text-soft">
            Tükendi
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <h3 className="m-0 font-display text-20 font-semibold tracking-product text-cream break-words">
          {urun.name}
        </h3>
        <p className="m-0 text-13 leading-145 text-muted">{urun.note}</p>
      </div>

      <div className="flex items-center justify-between gap-12">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-24 font-bold text-white">
            {fiyat(urun.price)}
          </span>
          <span className="text-13 text-muted-dark">{birimSoneki(urun.unit)}</span>
        </div>

        {urun.stock && (
          <a
            href={waLink(whatsapp, WA_MESAJ.urun(urun.name))}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp’tan sor"
            aria-label={`${urun.name} için WhatsApp’tan sor`}
            className="flex h-36 w-36 items-center justify-center rounded-8 border border-edge text-body transition-colors duration-150 ease-out-soft hover:border-brand hover:bg-brand hover:text-white"
          >
            <SagOkIkonu size={16} />
          </a>
        )}
      </div>

      {siparisAcik && urun.stock && urun.code && (
        <SepeteEkle code={urun.code} unit={urun.unit} name={urun.name} />
      )}
    </div>
  );
}
