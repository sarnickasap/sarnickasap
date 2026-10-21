"use client";

/* ──────────────────────────────────────────────────────────────────────────
   Admin Sidebar — vault "Admin Sidebar" notundan birebir.

     aside   flex:1 1 210px · max-w-full · flex-col · gap12
     nav     flex · flex-wrap · gap4
       buton flex:1 1 150px · justify-between · items-center · gap8
             h40 · px12 · r8 · border0 · font:inherit 14px/500 · text-left
       aktif bg #0a0a0a · beyaz · sayaç #a3a3a3
       pasif bg transparent · #404040 · sayaç #737373
             hover → bg #f0f0f0, #0a0a0a
     ayraç   div h1 bg #e5e5e5
     açıklama 12px · lh1.5 · #737373

   SAPMA (K-25): Tasarımdaki "Varsayılan verilere dön" butonu KALDIRILDI.
   Tasarımda localStorage'ı sıfırlıyordu — zararsızdı. Gerçek veritabanında
   dükkânın girdiği tüm ürün, fiyat, fırsat ve yorumları silerdi. Kullanıcı
   kaldırılmasını onayladı.

   SAPMA (onaylı #3/#4, K-19): tasarımda 6 sekme var; SEO ve Kullanıcılar
   eklenince 8 oluyor. Sekme bileşeninin stili aynen korundu.
   ────────────────────────────────────────────────────────────────────────── */

export type SekmeAnahtari =
  | "urunler"
  | "toplu"
  | "kampanyalar"
  | "galeri"
  | "markalar"
  | "yorumlar"
  | "iletisim"
  | "seo"
  | "kullanicilar";

export const SEKMELER: { anahtar: SekmeAnahtari; etiket: string; yeni?: boolean }[] = [
  { anahtar: "urunler", etiket: "Ürünler" },
  { anahtar: "toplu", etiket: "Toplu fiyat" },
  { anahtar: "kampanyalar", etiket: "Kampanyalar" },
  { anahtar: "galeri", etiket: "Galeri" },
  { anahtar: "markalar", etiket: "Markalar", yeni: true },
  { anahtar: "yorumlar", etiket: "Yorumlar" },
  { anahtar: "iletisim", etiket: "İletişim & saatler" },
  { anahtar: "seo", etiket: "SEO", yeni: true },
  { anahtar: "kullanicilar", etiket: "Kullanıcılar", yeni: true },
];

export function AdminSidebar({
  secili,
  onSec,
  sayaclar,
}: {
  secili: SekmeAnahtari;
  onSec: (a: SekmeAnahtari) => void;
  sayaclar: Partial<Record<SekmeAnahtari, number>>;
}) {
  return (
    <aside className="flex max-w-full flex-[1_1_210px] flex-col gap-12">
      <nav className="flex flex-wrap gap-4" aria-label="Panel bölümleri">
        {SEKMELER.map((s) => {
          const aktif = s.anahtar === secili;
          const sayac = sayaclar[s.anahtar];
          return (
            <button
              key={s.anahtar}
              type="button"
              onClick={() => onSec(s.anahtar)}
              aria-current={aktif ? "page" : undefined}
              className={
                "flex h-40 flex-[1_1_150px] cursor-pointer items-center justify-between gap-8 rounded-8 border-0 px-12 text-left text-14 font-medium " +
                (aktif
                  ? "bg-black text-white"
                  : "bg-transparent text-admin-tab transition-colors duration-150 ease-out-soft hover:bg-admin-row hover:text-black")
              }
            >
              <span>{s.etiket}</span>
              <span
                className={"text-12 " + (aktif ? "text-muted" : "text-admin-muted")}
              >
                {sayac ?? ""}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="h-1 bg-admin-border" />

      <p className="m-0 text-12 leading-15 text-admin-muted">
        Değişiklikler otomatik kaydedilir ve sitede anında görünür.
      </p>
    </aside>
  );
}
