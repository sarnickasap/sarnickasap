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
import { yorumEkle, yorumGuncelle, yorumSil } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Yorumlar sekmesi — vault "Yorum Duzenleme Karti" notundan birebir.

     kart    bg #fff · 1px #e5e5e5 · r12 · p16 · flex-col · gap10
     satır 1 flex-wrap gap8 items-center
       ad      2 1 160px · h36 · 14px/600
       puan    0 0 120px · h36 px8 · yıldız karakterleriyle
       toggle  92×36 · Yayında / Gizli
       sil     36×36
     satır 2 textarea rows=2 · p 8px 10px · 14px · lh1.5 · #404040
             resize-vertical · ph "Yorum"

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
        aksiyon={
          <SiyahButon tip="arti" onClick={ekle}>
            Yorum ekle
          </SiyahButon>
        }
      />

      {liste.length === 0 && (
        /* Boş durum — tasarımda YOK (K-08).
           Şu an gerçek yorum olmadığı için bu ekran boş açılıyor (K-15). */
        <p className="m-0 text-14 text-admin-muted">
          Henüz yorum yok. Google yorumlarından eklemek için “Yorum ekle”ye basın.
        </p>
      )}

      {liste.map((r) => (
        <Kart key={r.id} className="flex flex-col gap-10 p-16">
          <div className="flex flex-wrap items-center gap-8">
            <input
              value={r.name}
              onChange={(e) => yaz(r.id, { name: e.target.value })}
              placeholder="Ad"
              aria-label="Müşteri adı"
              className={`${GIRDI} h-36 flex-[2_1_160px] px-10 text-14 font-semibold text-form`}
            />
            <select
              value={r.rating}
              onChange={(e) => yaz(r.id, { rating: Number(e.target.value) }, true)}
              aria-label="Puan"
              className={`${GIRDI} h-36 flex-[0_0_120px] px-8 text-14 text-form`}
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

          <textarea
            value={r.text}
            onChange={(e) => yaz(r.id, { text: e.target.value })}
            rows={2}
            placeholder="Yorum"
            aria-label="Yorum metni"
            className="resize-y rounded-8 border border-admin-border bg-admin-card px-10 py-8 text-14 leading-15 text-admin-tab"
          />
        </Kart>
      ))}
    </>
  );
}
