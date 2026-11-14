"use client";

import { useState } from "react";
import { TextInput } from "@astryxdesign/core/TextInput";
import { ALAN, AnaButon, DurumToggle, Kart, SayfaBasligi, SilButonu } from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { firsatEkle, firsatGuncelle, firsatSil } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Kampanyalar sekmesi — fırsat başına bir kart.
     satır 1  başlık · süre · Yayında/Gizli · sil
     satır 2  açıklama · Eski fiyat · Yeni fiyat
   Fiyatlar YEREL `type=number`: her tuşta kaydediliyor (Astryx NumberInput
   değeri yalnız blur/Enter'da bildirir).

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
  "flex flex-[1_1_130px] items-center gap-6 text-13 text-[var(--color-text-secondary)]";
const FIYAT_ALANI = `${ALAN} flex-1 text-right`;

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
        aksiyon={<AnaButon etiket="Yeni fırsat" onClick={ekle} />}
      />

      {liste.map((d) => (
        <Kart key={d.id} className="flex flex-col gap-10 p-16">
          <div className="flex flex-wrap items-center gap-8">
            <TextInput
              label="Fırsat başlığı"
              isLabelHidden
              aria-label="Fırsat başlığı"
              placeholder="Başlık"
              value={d.title}
              onChange={(v) => yaz(d.id, { title: v })}
              containerClassName="flex-[2_1_200px]"
            />
            <TextInput
              label="Süre"
              isLabelHidden
              aria-label="Süre"
              placeholder="Süre (örn. Bu hafta)"
              value={d.until}
              onChange={(v) => yaz(d.id, { until: v })}
              containerClassName="flex-[1_1_150px]"
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
            <TextInput
              label="Fırsat açıklaması"
              isLabelHidden
              aria-label="Fırsat açıklaması"
              placeholder="Açıklama"
              value={d.description}
              onChange={(v) => yaz(d.id, { description: v })}
              containerClassName="flex-[3_1_240px]"
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
                className={FIYAT_ALANI}
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
                className={`${FIYAT_ALANI} font-semibold`}
              />
            </label>
          </div>
        </Kart>
      ))}
    </>
  );
}
