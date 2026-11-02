import { birimSoneki } from "@/lib/miktar";
import type { UrunVerisi } from "./urun-karti";
import { AyirtBaglantisi, FirsatCercevesi } from "./firsat-karti";
import { SepeteEkle } from "./sepete-ekle";

/* ──────────────────────────────────────────────────────────────────────────
   Stok programı kampanyası (aşama 4) — `listPrice` dolu ürün.
   Görünüm panel fırsatıyla birebir aynı çerçeve; farklar:
     · pil "Son gün: 9 Kasım" (campaignUntil, dahil)
     · yeni fiyatın yanında "/ kg" ya da "/ adet"
     · sipariş açıksa miktar seçici + "Sepete ekle", değilse "Ayırt"
   ────────────────────────────────────────────────────────────────────────── */

export type KatalogFirsati = UrunVerisi & {
  code: string;
  listPrice: number;
  /** Biçimlenmiş son gün metni; tarih yoksa null */
  sonGun: string | null;
};

export function KatalogFirsatKarti({
  firsat,
  whatsapp,
  siparisAcik,
}: {
  firsat: KatalogFirsati;
  whatsapp: string;
  siparisAcik: boolean;
}) {
  return (
    <FirsatCercevesi
      etiket={firsat.sonGun ? `Son gün: ${firsat.sonGun}` : "Kampanya"}
      baslik={firsat.name}
      aciklama={firsat.note}
      yeniFiyat={firsat.price}
      eskiFiyat={firsat.listPrice}
      sonek={birimSoneki(firsat.unit)}
    >
      {siparisAcik ? (
        <SepeteEkle code={firsat.code} unit={firsat.unit} name={firsat.name} />
      ) : (
        <AyirtBaglantisi whatsapp={whatsapp} baslik={firsat.name} />
      )}
    </FirsatCercevesi>
  );
}
