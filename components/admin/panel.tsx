"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar, STOK_SEKMELERI, type SekmeAnahtari } from "./admin-sidebar";
import { UrunlerSekmesi, type AdminUrun } from "./urunler-sekmesi";
import { TopluFiyatSekmesi } from "./toplu-fiyat-sekmesi";
import { KampanyalarSekmesi, type AdminFirsat } from "./kampanyalar-sekmesi";
import { GaleriSekmesi, type AdminGaleri } from "./galeri-sekmesi";
import { MarkalarSekmesi, type AdminMarka } from "./markalar-sekmesi";
import { YorumlarSekmesi, type AdminYorum } from "./yorumlar-sekmesi";
import {
  IletisimSekmesi,
  type AdminBilgi,
  type AdminSaat,
} from "./iletisim-sekmesi";
import { SeoSekmesi } from "./seo-sekmesi";
import {
  KullanicilarSekmesi,
  type AdminKullanici,
} from "./kullanicilar-sekmesi";
import { kayitDurumMetni, kayitSonucuDinle } from "@/lib/kaydet";

/* ──────────────────────────────────────────────────────────────────────────
   Panel kabuğu — vault "Admin Sidebar" notundaki gövde düzeni:
     max-w 1280 · w-full · mx-auto · p 24px 20px 64px
     flex · flex-wrap · gap24 · items-start
     main → flex:999 1 560px · min-w-0 · flex-col · gap16
   ────────────────────────────────────────────────────────────────────────── */

export type PanelVerisi = {
  urunler: AdminUrun[];
  kategoriler: { id: number; name: string }[];
  firsatlar: AdminFirsat[];
  galeri: AdminGaleri[];
  markalar: AdminMarka[];
  yorumlar: AdminYorum[];
  bilgi: AdminBilgi;
  saatler: AdminSaat[];
  seo: { seoTitle: string; seoDescription: string; ogImageUrl: string | null };
  kullanicilar: AdminKullanici[];
  benimId: string;
  /** STOK_API_URL tanımlı → ürün/fiyat sekmeleri gizli (K-37) */
  stokYonetiyor: boolean;
};

export function Panel({ veri }: { veri: PanelVerisi }) {
  const [sekme, setSekme] = useState<SekmeAnahtari>(
    veri.stokYonetiyor ? "kampanyalar" : "urunler",
  );
  /* Gizli sekme hiçbir yoldan render edilmesin (K-37) */
  const gorunenSekme =
    veri.stokYonetiyor && STOK_SEKMELERI.includes(sekme) ? "kampanyalar" : sekme;
  const [sonKayit, setSonKayit] = useState<Date | null>(null);

  /* Kayıt durumu (K-34). Eskiden başarısız kayıt sessizdi: iyimser arayüz
     yeni değeri ekranda tutuyor, kullanıcı kaydedildi sanıyordu.
     Hata, tasarımın KENDİ durum metni alanında gösteriliyor — yeni arayüz
     öğesi eklenmedi.

     Hem başarı hem hata TEK yayından geliyor; hata yalnızca gerçekten
     çözülen bir kayıtla temizlenir (bkz. lib/kaydet.ts). */
  const [kayitHatasi, setKayitHatasi] = useState(false);
  useEffect(
    () =>
      kayitSonucuDinle((s) => {
        setKayitHatasi(!s.tamam);
        if (s.tamam) setSonKayit(new Date());
      }),
    [],
  );

  const kaydedildi = () => {
    setKayitHatasi(false);
    setSonKayit(new Date());
  };

  return (
    <div className="tema-admin flex min-h-screen flex-col bg-admin-bg text-black">
      <AdminHeader durumMetni={kayitDurumMetni(sonKayit, kayitHatasi)} />

      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-start gap-24 px-20 pt-24 pb-64">
        <AdminSidebar
          secili={gorunenSekme}
          onSec={setSekme}
          stokYonetiyor={veri.stokYonetiyor}
          sayaclar={{
            /* Tasarım: Kampanyalar = AKTİF fırsat sayısı,
               Yorumlar = GÖRÜNÜR yorum sayısı (listede hepsi var). */
            urunler: veri.urunler.length,
            kampanyalar: veri.firsatlar.filter((d) => d.active).length,
            galeri: veri.galeri.length,
            markalar: veri.markalar.filter((m) => m.visible).length,
            yorumlar: veri.yorumlar.filter((r) => r.visible).length,
            kullanicilar: veri.kullanicilar.length,
          }}
        />

        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-16">
          {gorunenSekme === "urunler" && (
            <UrunlerSekmesi
              urunler={veri.urunler}
              kategoriler={veri.kategoriler}
              onDegisti={kaydedildi}
            />
          )}
          {gorunenSekme === "toplu" && (
            <TopluFiyatSekmesi
              urunler={veri.urunler}
              kategoriler={veri.kategoriler}
              onUygulandi={kaydedildi}
            />
          )}
          {gorunenSekme === "kampanyalar" && (
            <KampanyalarSekmesi firsatlar={veri.firsatlar} onDegisti={kaydedildi} />
          )}
          {gorunenSekme === "galeri" && (
            <GaleriSekmesi ogeler={veri.galeri} onDegisti={kaydedildi} />
          )}
          {gorunenSekme === "markalar" && (
            <MarkalarSekmesi markalar={veri.markalar} onDegisti={kaydedildi} />
          )}
          {gorunenSekme === "yorumlar" && (
            <YorumlarSekmesi yorumlar={veri.yorumlar} onDegisti={kaydedildi} />
          )}
          {gorunenSekme === "iletisim" && (
            <IletisimSekmesi
              bilgi={veri.bilgi}
              saatler={veri.saatler}
              onDegisti={kaydedildi}
            />
          )}
          {gorunenSekme === "seo" && (
            <SeoSekmesi
              seoTitle={veri.seo.seoTitle}
              seoDescription={veri.seo.seoDescription}
              ogImageUrl={veri.seo.ogImageUrl}
              onDegisti={kaydedildi}
            />
          )}
          {gorunenSekme === "kullanicilar" && (
            <KullanicilarSekmesi
              kullanicilar={veri.kullanicilar}
              benimId={veri.benimId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
