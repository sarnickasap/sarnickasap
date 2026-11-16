"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Divider } from "@astryxdesign/core/Divider";
import { SideNav, SideNavItem } from "@astryxdesign/core/SideNav";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

/* ──────────────────────────────────────────────────────────────────────────
   Admin Sidebar — Astryx SideNav (aside içinde, tam genişlik).
     sekme  SideNavItem · seçili olan aria-current="page" · sağda sayaç
     altında Divider + açıklama metni

   SAPMA (K-25): Tasarımdaki "Varsayılan verilere dön" butonu KALDIRILDI.
   Tasarımda localStorage'ı sıfırlıyordu — zararsızdı. Gerçek veritabanında
   dükkânın girdiği tüm ürün, fiyat, fırsat ve yorumları silerdi. Kullanıcı
   kaldırılmasını onayladı.

   SAPMA (onaylı #3/#4, K-19): tasarımda 6 sekme var; SEO ve Kullanıcılar
   eklenince 8 oluyor.

   K-37: STOK_API_URL tanımlıyken ürün ve fiyatlar stok programından
   yönetiliyor — "Ürünler" ve "Toplu fiyat" sekmeleri GİZLENİR (kod
   silinmedi) ve yerlerine kısa bir bilgi notu çıkar. Panelden yazılan
   fiyat sitede görünmeyeceği için sekmeyi açık bırakmak yanıltıcıydı.
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

/** Stok programı yönetirken gizlenen sekmeler (K-37). */
export const STOK_SEKMELERI: readonly SekmeAnahtari[] = ["urunler", "toplu"];

export function AdminSidebar({
  secili,
  onSec,
  sayaclar,
  stokYonetiyor = false,
}: {
  secili: SekmeAnahtari;
  onSec: (a: SekmeAnahtari) => void;
  sayaclar: Partial<Record<SekmeAnahtari, number>>;
  stokYonetiyor?: boolean;
}) {
  const sekmeler = stokYonetiyor
    ? SEKMELER.filter((s) => !STOK_SEKMELERI.includes(s.anahtar))
    : SEKMELER;

  /* `aside button` e2e testlerinin sekme seçicisi — SideNavItem href'siz
     olduğunda <button> render eder, metni etiketle başlar. */
  return (
    <VStack as="aside" gap={3} className="max-w-full flex-[1_1_210px]">
      {stokYonetiyor && (
        <Banner status="info" title="Ürünler ve fiyatlar stok programından yönetiliyor" />
      )}
      <SideNav aria-label="Panel bölümleri" className="h-auto w-full">
        {sekmeler.map((s) => {
          const sayac = sayaclar[s.anahtar];
          return (
            <SideNavItem
              key={s.anahtar}
              label={s.etiket}
              isSelected={s.anahtar === secili}
              onClick={() => onSec(s.anahtar)}
              endContent={
                sayac == null ? undefined : (
                  <Text type="supporting" hasTabularNumbers>
                    {sayac}
                  </Text>
                )
              }
            />
          );
        })}
      </SideNav>

      <Divider />

      <Text type="supporting" as="p">
        Değişiklikler otomatik kaydedilir ve sitede anında görünür.
      </Text>
    </VStack>
  );
}
