import { UrunKarti, type UrunVerisi } from "./urun-karti";

/* ──────────────────────────────────────────────────────────────────────────
   Ürün ızgarası — vault "Urunler Bolumu" (ana sayfa sekmeleri ve kategori
   sayfaları ortak kullanır; aşama 4'te urun-listesi.tsx'ten ayrıldı).

     auto-fill minmax(min(100%,260px),1fr) · gap 1px
     bg #1f1f1f · 1px #1f1f1f · r12 · overflow hidden
     ⚠️ Izgara çizgisi hilesi: hücre aralığı 1px ve kapsayıcı zemini #1f1f1f;
     kartların kendi zemini #0a0a0a. Kartların KENDİ KENARLIĞI YOK.
   ────────────────────────────────────────────────────────────────────────── */

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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-1 overflow-hidden rounded-12 border border-line bg-line">
      {urunler.map((u) => (
        <UrunKarti key={u.anahtar} urun={u} whatsapp={whatsapp} siparisAcik={siparisAcik} />
      ))}

      {/* Boş durum — tasarımda YOK (K-08). Admin'deki "Eşleşen ürün yok."
          metninin koyu tema karşılığı; yeni token icat edilmedi. */}
      {urunler.length === 0 && (
        <p className="col-span-full m-0 bg-ink p-32 text-center text-14 text-muted">
          Bu kategoride ürün yok.
        </p>
      )}
    </div>
  );
}
