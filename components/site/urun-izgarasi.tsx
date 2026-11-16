import { Grid } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { UrunKarti, type UrunVerisi } from "./urun-karti";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün ızgarası — vault "Urunler Bolumu" (ana sayfa sekmeleri ve kategori
   sayfaları ortak kullanır; aşama 4'te urun-listesi.tsx'ten ayrıldı).

     auto-fill minmax(min(100%,260px),1fr) · gap 1px
     bg #1f1f1f · 1px #1f1f1f · r12 · overflow hidden
     ⚠️ Izgara çizgisi hilesi: hücre aralığı 1px ve kapsayıcı zemini #1f1f1f;
     kartların kendi zemini #0a0a0a. Kartların KENDİ KENARLIĞI YOK.

   Astryx Grid: `max` verilince şablon `min(100%, 260px)` tabanlı olur
   (telefonda taşmaz). 1px aralık Astryx ölçeğinde yok → className.
   `grid` sınıfı e2e seçicisi için (`#urunler .grid > div`).
   ────────────────────────────────────────────────────────────────────────── */

const EN_COK_SUTUN = 5;

export function UrunIzgarasi({
  urunler,
  whatsapp,
  siparisAcik,
}: {
  urunler: UrunVerisi[];
  whatsapp: string;
  siparisAcik: boolean;
}) {
  return (
    <Grid
      columns={{ minWidth: 260, max: EN_COK_SUTUN }}
      className="grid gap-1 overflow-hidden rounded-12 border border-line bg-line"
    >
      {urunler.map((u) => (
        <UrunKarti key={u.anahtar} urun={u} whatsapp={whatsapp} siparisAcik={siparisAcik} />
      ))}

      {/* Boş durum — tasarımda YOK (K-08). Admin'deki "Eşleşen ürün yok."
          metninin koyu tema karşılığı; yeni token icat edilmedi. */}
      {urunler.length === 0 && (
        <Text as="p" color="secondary" justify="center" className="col-span-full bg-ink p-32 text-14">
          Bu kategoride ürün yok.
        </Text>
      )}
    </Grid>
  );
}
