"use client";

import { useState } from "react";
import {
  DurumToggle,
  GIRDI,
  Kart,
  SayfaBasligi,
  SilButonu,
  SiyahButon,
} from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { firsatEkle, firsatGuncelle, firsatSil } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Kampanyalar sekmesi — vault "Firsat Duzenleme Karti" notundan birebir.

     kart    bg #fff · 1px #e5e5e5 · r12 · p16 · flex-col · gap10
             (main içinde doğrudan sıralanır, ayrı kapsayıcı yok)
     satır 1 flex-wrap · gap8 · items-center
       başlık  2 1 200px · h36 · 15px/600
       süre    1 1 150px · h36 · 14px · ph "Süre (örn. Bu hafta)"
       toggle  92×36 · Yayında / Gizli
       sil     36×36
     satır 2 flex-wrap · gap8 · items-center
       açıklama 3 1 240px · h36 · 14px · #525252
       Eski     1 1 130px · label YATAY (gap6, 12px #737373) · sağa hizalı
       Yeni     1 1 130px · aynı ama input 600 ağırlık, #b8222a

   Admin'de TÜM fırsatlar listelenir (gizli olanlar dahil);
   sitede yalnızca yayındakiler görünür.
   ────────────────────────────────────────────────────────────────────────── */

export type AdminFirsat = {
  id: number;
  title: string;
  description: string;
  oldPrice: number;
  newPrice: number;
  until: string;
  active: boolean;
};

const FIYAT_LABEL =
  "flex flex-[1_1_130px] items-center gap-6 text-12 text-admin-muted";

export function KampanyalarSekmesi({
  firsatlar,
  onDegisti,
}: {
  firsatlar: AdminFirsat[];
  onDegisti: () => void;
}) {
  const [liste, setListe] = useState(firsatlar);
  const gecikmeli = useGecikmeliKayit();

  function yaz(id: number, alan: Partial<AdminFirsat>, hemen = false) {
    setListe((l) => l.map((d) => (d.id === id ? { ...d, ...alan } : d)));
    const calistir = () => firsatGuncelle({ id, ...alan }).then(onDegisti);
    // `hemen` yolu da aynı sarmalıdan geçmeli — yoksa hatası yutulur
    if (hemen) gecikmeli(`firsat-${id}-${Object.keys(alan)[0]}`, calistir, true);
    else gecikmeli(`firsat-${id}-${Object.keys(alan)[0]}`, calistir);
  }

  async function ekle() {
    const yeni = await firsatEkle();
    if (yeni) setListe((l) => [yeni as AdminFirsat, ...l]);
    onDegisti();
  }

  async function sil(d: AdminFirsat) {
    if (!confirm("Silinsin mi?")) return;
    setListe((l) => l.filter((x) => x.id !== d.id));
    await firsatSil(d.id);
    onDegisti();
  }

  return (
    <>
      <SayfaBasligi
        baslik="Kampanya ve fırsatlar"
        altMetin="Aktif fırsatlar sitedeki kırmızı bölümde gösterilir."
        aksiyon={
          <SiyahButon tip="arti" onClick={ekle}>
            Yeni fırsat
          </SiyahButon>
        }
      />

      {liste.map((d) => (
        <Kart key={d.id} className="flex flex-col gap-10 p-16">
          <div className="flex flex-wrap items-center gap-8">
            <input
              value={d.title}
              onChange={(e) => yaz(d.id, { title: e.target.value })}
              placeholder="Başlık"
              aria-label="Fırsat başlığı"
              className={`${GIRDI} h-36 flex-[2_1_200px] px-10 text-15 font-semibold text-form`}
            />
            <input
              value={d.until}
              onChange={(e) => yaz(d.id, { until: e.target.value })}
              placeholder="Süre (örn. Bu hafta)"
              aria-label="Süre"
              className={`${GIRDI} h-36 flex-[1_1_150px] px-10 text-14 text-form`}
            />
            <DurumToggle
              acik={d.active}
              acikMetin="Yayında"
              kapaliMetin="Gizli"
              onChange={() => yaz(d.id, { active: !d.active }, true)}
            />
            <SilButonu onClick={() => sil(d)} etiket={`${d.title} fırsatını sil`} />
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <input
              value={d.description}
              onChange={(e) => yaz(d.id, { description: e.target.value })}
              placeholder="Açıklama"
              aria-label="Fırsat açıklaması"
              className={`${GIRDI} h-36 flex-[3_1_240px] px-10 text-14 text-admin-2nd`}
            />

            <label className={FIYAT_LABEL}>
              Eski
              <input
                type="number"
                value={d.oldPrice}
                onChange={(e) =>
                  yaz(d.id, {
                    oldPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
                className={`${GIRDI} h-36 flex-1 px-8 text-right text-14 text-black`}
              />
            </label>

            <label className={FIYAT_LABEL}>
              Yeni
              <input
                type="number"
                value={d.newPrice}
                onChange={(e) =>
                  yaz(d.id, {
                    newPrice: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
                className={`${GIRDI} h-36 flex-1 px-8 text-right text-14 font-semibold text-brand`}
              />
            </label>
          </div>
        </Kart>
      ))}
    </>
  );
}
