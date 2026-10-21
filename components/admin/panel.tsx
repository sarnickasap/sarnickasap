"use client";

import { useState } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar, type SekmeAnahtari } from "./admin-sidebar";
import { UrunlerSekmesi, type AdminUrun } from "./urunler-sekmesi";
import { kayitDurumMetni } from "@/lib/kaydet";
import { varsayilanaDon } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Panel kabuğu — vault "Admin Sidebar" notundaki gövde düzeni:
     max-w 1280 · w-full · mx-auto · p 24px 20px 64px
     flex · flex-wrap · gap24 · items-start
     main → flex:999 1 560px · min-w-0 · flex-col · gap16
   ────────────────────────────────────────────────────────────────────────── */

export type PanelVerisi = {
  urunler: AdminUrun[];
  kategoriler: { id: number; name: string }[];
  firsatSayisi: number;
  galeriSayisi: number;
  yorumSayisi: number;
};

export function Panel({ veri }: { veri: PanelVerisi }) {
  const [sekme, setSekme] = useState<SekmeAnahtari>("urunler");
  const [sonKayit, setSonKayit] = useState<Date | null>(null);

  const kaydedildi = () => setSonKayit(new Date());

  async function sifirla() {
    if (
      !confirm("Tüm değişiklikler silinip varsayılan verilere dönülsün mü?")
    )
      return;
    await varsayilanaDon();
    kaydedildi();
    location.reload();
  }

  return (
    <div className="tema-admin flex min-h-screen flex-col bg-admin-bg text-black">
      <AdminHeader durumMetni={kayitDurumMetni(sonKayit)} />

      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-start gap-24 px-20 pt-24 pb-64">
        <AdminSidebar
          secili={sekme}
          onSec={setSekme}
          sayaclar={{
            urunler: veri.urunler.length,
            kampanyalar: veri.firsatSayisi,
            galeri: veri.galeriSayisi,
            yorumlar: veri.yorumSayisi,
          }}
          onSifirla={sifirla}
        />

        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-16">
          {sekme === "urunler" && (
            <UrunlerSekmesi
              urunler={veri.urunler}
              kategoriler={veri.kategoriler}
              onDegisti={kaydedildi}
            />
          )}
          {sekme !== "urunler" && (
            <p className="m-0 text-14 text-admin-muted">
              Bu sekme sıradaki adımda eklenecek.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
