"use client";

import { useState } from "react";
import { GIRDI, Kart, SayfaBasligi, SilButonu, SiyahButon } from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { galeriEkle, galeriGuncelle, galeriSil } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri sekmesi — vault "Galeri Duzenleme Karti" notundan birebir.

     ızgara  auto-fill minmax(min(100%,240px),1fr) · gap12
     kart    bg #fff · 1px #e5e5e5 · r12 · p10 · flex-col · gap8
       görsel  aspect 4/3 · r8 · object-cover · bg #f5f5f5
       yoksa   aspect 4/3 · r8 · 1px dashed #d4d4d4 · bg #fafafa
               mono 12px #a3a3a3 · "görsel yok"
               ⚠️ Sitedeki yer tutucudan FARKLI (orada r12, #333333, şerit)
       altyazı h34 · 13px/500
       url     flex gap6 → input flex-1 h34 12px #525252 ph "https://…"
               + sil 34×34 (ikon 15px)

   Yeni görsel listenin SONUNA eklenir (push) — diğer sekmelerden farklı.
   ────────────────────────────────────────────────────────────────────────── */

export type AdminGaleri = { id: number; url: string; caption: string };

export function GaleriSekmesi({
  ogeler,
  onDegisti,
}: {
  ogeler: AdminGaleri[];
  onDegisti: () => void;
}) {
  const [liste, setListe] = useState(ogeler);
  const gecikmeli = useGecikmeliKayit();

  function yaz(id: number, alan: Partial<AdminGaleri>) {
    setListe((l) => l.map((g) => (g.id === id ? { ...g, ...alan } : g)));
    gecikmeli(`galeri-${id}-${Object.keys(alan)[0]}`, () =>
      galeriGuncelle({ id, ...alan }).then(onDegisti),
    );
  }

  async function ekle() {
    const yeni = await galeriEkle();
    if (yeni) setListe((l) => [...l, yeni as AdminGaleri]);
    onDegisti();
  }

  async function sil(g: AdminGaleri) {
    if (!confirm("Silinsin mi?")) return;
    setListe((l) => l.filter((x) => x.id !== g.id));
    await galeriSil(g.id);
    onDegisti();
  }

  return (
    <>
      <SayfaBasligi
        baslik="Galeri"
        altMetin="Görsel bağlantısı (URL) ve alt yazı girin. Boş bırakılanlar yer tutucu olarak görünür."
        aksiyon={
          <SiyahButon tip="arti" onClick={ekle}>
            Görsel ekle
          </SiyahButon>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-12">
        {liste.map((g) => (
          <Kart key={g.id} className="flex flex-col gap-8 p-10">
            {g.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.url}
                alt=""
                className="block aspect-[4/3] w-full rounded-8 bg-admin-off object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-8 border border-dashed border-admin-dash bg-admin-bg font-mono text-12 text-faint-light">
                görsel yok
              </div>
            )}

            <input
              value={g.caption}
              onChange={(e) => yaz(g.id, { caption: e.target.value })}
              placeholder="Alt yazı"
              aria-label="Alt yazı"
              className={`${GIRDI} h-34 px-10 text-13 font-medium text-form`}
            />

            <div className="flex gap-6">
              <input
                value={g.url}
                onChange={(e) => yaz(g.id, { url: e.target.value })}
                placeholder="https://…"
                aria-label="Görsel bağlantısı"
                className={`${GIRDI} h-34 flex-1 px-10 text-12 text-admin-2nd`}
              />
              <SilButonu kucuk onClick={() => sil(g)} etiket="Görseli sil" />
            </div>
          </Kart>
        ))}
      </div>
    </>
  );
}
