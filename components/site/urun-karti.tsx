import { Badge } from "@astryxdesign/core/Badge";
import { IconButton } from "@astryxdesign/core/IconButton";
import { SagOkIkonu } from "@/components/icons";
import { fiyat, waLink, WA_MESAJ } from "@/lib/format";
import { birimSoneki } from "@/lib/miktar";
import type { Birim } from "@/lib/stok-sema";
import { yerelNitelikler } from "./astryx-yardimci";
import { SepeteEkle } from "./sepete-ekle";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün Kartı (ızgara hücresi) — vault "Urun Karti" notundan birebir.

     hücre  bg #0a0a0a · p22 · flex-col · gap14 · min-h 190
            KENDİ KENARLIĞI/YARIÇAPI YOK — ayrım ızgara gap:1px ile
     üst    justify-between · items-center · gap8
       kategori 12px/500 · #737373 (K-21 → #8a8a8a)
       rozet    Astryx Badge · 11px/600 · px8 · bg #262626 · #d4d4d4 · "Tükendi"
     metin  flex-col · gap4 · flex-1
       h3   DM Sans 20px/600 · ls -.01em · #f8efea
       p    13px · lh 1.45 · #a3a3a3   (not boşsa boş <p> yine render edilir)
     alt    items-center · justify-between · gap12
       fiyat items-baseline · gap4 → DM Sans 24px/700 beyaz + "/ kg" 13px
       ok    YALNIZCA stoktaysa · Astryx IconButton (bağlantı) · 36×36 ·
             1px #333333 · hover → bg+border #b8222a, beyaz

   Stok dışı davranış: kart soluklaşmaz, fiyat gizlenmez.
   Yalnızca rozet görünür ve ok butonu kaybolur.

   Stok programı kataloğu (K-37) — tasarımda YOK, kartın kendi diliyle:
     · birim soneki "/ kg" ya da "/ adet"
     · görsel YALNIZCA izinli Blob adresinden (lib/stok-sema.ts) —
       galerideki görselle aynı biçim (4/3 · r8 · #171717 zemin)
     · sipariş açıksa ve ürün stoktaysa miktar seçici + "Sepete ekle"
     · kampanyalı üründe (aşama 4) "Fırsat" rozeti — "Tükendi" rozetinin
       ölçüsünde, zemin #b8222a (fırsat bölümünün rengi) — ve fiyatın
       yanında üstü çizili eski fiyat (fırsat kartındaki gibi #8a8a8a)
   ────────────────────────────────────────────────────────────────────────── */

const ROZET = "rounded-pill px-8 text-11 font-semibold";

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
  /** Kampanya öncesi fiyat — yalnızca geçerli kampanyada (> price) dolu */
  listPrice: number | null;
  /** Kampanya son günü YYYY-MM-DD (dahil, Europe/Istanbul) */
  campaignUntil: string | null;
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
          // Gerçek boyut bilinmiyor; 4:3 oranı tarayıcıya önceden yer ayırtır (CLS yok)
          width={400}
          height={300}
          className="block aspect-[4/3] h-auto w-full rounded-8 bg-hover object-cover"
        />
      )}
      <div className="flex items-center justify-between gap-8">
        <span className="text-12 font-medium text-muted-dark">{urun.cat}</span>
        <div className="flex items-center gap-6">
          {urun.listPrice !== null && (
            <Badge label="Fırsat" className={`${ROZET} bg-brand text-white`} />
          )}
          {!urun.stock && (
            <Badge label="Tükendi" className={`${ROZET} bg-badge text-soft`} />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <h3 className="m-0 font-display text-20 font-semibold tracking-product text-cream break-words">
          {urun.name}
        </h3>
        <p className="m-0 text-13 leading-145 text-muted">{urun.note}</p>
      </div>

      <div className="flex items-center justify-between gap-12">
        <div className="flex flex-wrap items-baseline gap-4">
          <span className="font-display text-24 font-bold text-white">
            {fiyat(urun.price)}
          </span>
          <span className="text-13 text-muted-dark">{birimSoneki(urun.unit)}</span>
          {urun.listPrice !== null && (
            <span className="ml-4 text-13 text-muted-dark line-through">
              <span className="sr-only">Önceki fiyat: </span>
              {fiyat(urun.listPrice)}
            </span>
          )}
        </div>

        {urun.stock && (
          <IconButton
            href={waLink(whatsapp, WA_MESAJ.urun(urun.name))}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            label={`${urun.name} için WhatsApp’tan sor`}
            {...yerelNitelikler({ title: "WhatsApp’tan sor" })}
            icon={<SagOkIkonu size={16} />}
            className="h-36 w-36 border border-edge bg-transparent text-body hover:border-brand hover:bg-brand hover:text-white"
          />
        )}
      </div>

      {siparisAcik && urun.stock && urun.code && (
        <SepeteEkle code={urun.code} unit={urun.unit} name={urun.name} />
      )}
    </div>
  );
}
