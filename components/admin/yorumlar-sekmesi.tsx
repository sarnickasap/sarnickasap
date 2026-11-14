"use client";

import { useState } from "react";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { ALAN, AnaButon, DurumToggle, Kart, SayfaBasligi, SilButonu } from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { yorumEkle, yorumGuncelle, yorumSil } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Yorumlar sekmesi — yorum başına bir kart.
     satır 1  ad · puan (yerel select: e2e testi selectOption kullanıyor)
              · Yayında/Gizli · sil
     satır 2  yorum metni (TextArea, 2 satır)

   Admin'de TÜM yorumlar listelenir; sitede yalnızca yayındakiler görünür.
   ────────────────────────────────────────────────────────────────────────── */

export type AdminYorum = {
  id: number;
  name: string;
  text: string;
  rating: number;
  visible: boolean;
};

export function YorumlarSekmesi({
  yorumlar,
  onDegisti,
}: {
  yorumlar: AdminYorum[];
  onDegisti: () => void;
}) {
  const [liste, setListe] = useState(yorumlar);
  const gecikmeli = useGecikmeliKayit();

  function yaz(id: number, alan: Partial<AdminYorum>, hemen = false) {
    setListe((l) => l.map((r) => (r.id === id ? { ...r, ...alan } : r)));
    const calistir = () => yorumGuncelle({ id, ...alan }).then(onDegisti);
    // `hemen` yolu da aynı sarmalıdan geçmeli — yoksa hatası yutulur
    if (hemen) gecikmeli(`yorum-${id}-${Object.keys(alan)[0]}`, calistir, true);
    else gecikmeli(`yorum-${id}-${Object.keys(alan)[0]}`, calistir);
  }

  async function ekle() {
    const yeni = await yorumEkle();
    if (yeni) setListe((l) => [yeni as AdminYorum, ...l]);
    onDegisti();
  }

  async function sil(r: AdminYorum) {
    if (!confirm("Silinsin mi?")) return;
    setListe((l) => l.filter((x) => x.id !== r.id));
    await yorumSil(r.id);
    onDegisti();
  }

  return (
    <>
      <SayfaBasligi
        baslik="Müşteri yorumları"
        altMetin="Yalnızca yayındaki yorumlar sitede görünür."
        aksiyon={<AnaButon etiket="Yorum ekle" onClick={ekle} />}
      />

      {liste.length === 0 && (
        /* Şu an gerçek yorum olmadığı için bu ekran boş açılıyor (K-15). */
        <EmptyState
          title="Henüz yorum yok."
          description="Google yorumlarından eklemek için “Yorum ekle”ye basın."
          headingLevel={2}
        />
      )}

      {liste.map((r) => (
        <Kart key={r.id} className="flex flex-col gap-10 p-16">
          <div className="flex flex-wrap items-center gap-8">
            <TextInput
              label="Müşteri adı"
              isLabelHidden
              aria-label="Müşteri adı"
              placeholder="Ad"
              value={r.name}
              onChange={(v) => yaz(r.id, { name: v })}
              containerClassName="flex-[2_1_160px]"
            />
            <select
              value={r.rating}
              onChange={(e) => yaz(r.id, { rating: Number(e.target.value) }, true)}
              aria-label="Puan"
              className={`${ALAN} flex-[0_0_120px]`}
            >
              <option value="5">★★★★★</option>
              <option value="4">★★★★</option>
              <option value="3">★★★</option>
              <option value="2">★★</option>
              <option value="1">★</option>
            </select>
            <DurumToggle
              acik={r.visible}
              acikMetin="Yayında"
              kapaliMetin="Gizli"
              onChange={() => yaz(r.id, { visible: !r.visible }, true)}
            />
            <SilButonu onClick={() => sil(r)} etiket="Yorumu sil" />
          </div>

          <TextArea
            label="Yorum metni"
            isLabelHidden
            aria-label="Yorum metni"
            placeholder="Yorum"
            rows={2}
            value={r.text}
            onChange={(v) => yaz(r.id, { text: v })}
          />
        </Kart>
      ))}
    </>
  );
}
