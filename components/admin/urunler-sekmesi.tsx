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
import { urunEkle, urunGuncelle, urunSil } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Ürünler sekmesi — vault "Urun Satiri" notundan birebir.

     filtre  flex-wrap gap8 → arama (2 1 200px, h38 px12)
                              kategori select (1 1 160px, h38 px10)
     liste   bg #fff · 1px #e5e5e5 · r12 · overflow-hidden
     satır   flex-wrap gap8 items-center · p 12px 14px
             alt kenarlık 1px #f0f0f0  (SON SATIRDA DA var)
       1 ad       2 1 170px · h36 · 14px/500
       2 kategori 1 1 140px · h36 px8
       3 fiyat    0 1 130px (min 110) · h36 · sağa hizalı + "₺/kg" eki
       4 açıklama 2 1 170px · h36 · 13px #525252
       5 stok     92×36 toggle
       6 sil      36×36
     boş     p32 · ortalı · 14px · #737373 · "Eşleşen ürün yok."

   Arama Türkçe duyarlı: toLocaleLowerCase('tr')
   ────────────────────────────────────────────────────────────────────────── */

export type AdminUrun = {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  note: string;
  stock: boolean;
};

const TUMU = "Tümü";

export function UrunlerSekmesi({
  urunler,
  kategoriler,
  onDegisti,
}: {
  urunler: AdminUrun[];
  kategoriler: { id: number; name: string }[];
  onDegisti: () => void;
}) {
  const [liste, setListe] = useState(urunler);
  const [arama, setArama] = useState("");
  const [filtre, setFiltre] = useState(TUMU);
  const gecikmeli = useGecikmeliKayit();

  const katAdi = (id: number) => kategoriler.find((k) => k.id === id)?.name ?? "";

  const q = arama.toLocaleLowerCase("tr");
  const gorunen = liste.filter(
    (p) =>
      (filtre === TUMU || katAdi(p.categoryId) === filtre) &&
      (!q || p.name.toLocaleLowerCase("tr").includes(q)),
  );

  /** Yerel state'i hemen güncelle (anında tepki), yazmayı geciktir. */
  function yaz(id: number, alan: Partial<AdminUrun>, hemen = false) {
    setListe((l) => l.map((p) => (p.id === id ? { ...p, ...alan } : p)));
    const calistir = () => urunGuncelle({ id, ...alan }).then(onDegisti);
    // `hemen` yolu da aynı sarmalıdan geçmeli — yoksa hatası yutulur
    if (hemen) gecikmeli(`urun-${id}-${Object.keys(alan)[0]}`, calistir, true);
    else gecikmeli(`urun-${id}-${Object.keys(alan)[0]}`, calistir);
  }

  async function ekle() {
    const yeni = await urunEkle(filtre !== TUMU ? filtre : null);
    if (yeni) setListe((l) => [yeni as AdminUrun, ...l]);
    onDegisti();
  }

  async function sil(p: AdminUrun) {
    if (!confirm("Silinsin mi?")) return;
    setListe((l) => l.filter((x) => x.id !== p.id));
    await urunSil(p.id);
    onDegisti();
  }

  return (
    <>
      <SayfaBasligi
        baslik="Ürünler"
        altMetin="Ad, kategori, kilo fiyatı ve stok durumunu düzenleyin."
        aksiyon={
          <SiyahButon tip="arti" onClick={ekle}>
            Yeni ürün
          </SiyahButon>
        }
      />

      <div className="flex flex-wrap gap-8">
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ürün ara"
          aria-label="Ürün ara"
          className={`${GIRDI} h-38 flex-[2_1_200px] px-12 text-14 font-normal text-form`}
        />
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          aria-label="Kategoriye göre süz"
          className={`${GIRDI} h-38 flex-[1_1_160px] px-10 text-14 font-normal text-form`}
        >
          {[TUMU, ...kategoriler.map((k) => k.name)].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <Kart className="overflow-hidden">
        {gorunen.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-8 border-b border-admin-row px-14 py-12"
          >
            <input
              value={p.name}
              onChange={(e) => yaz(p.id, { name: e.target.value })}
              placeholder="Ürün adı"
              aria-label="Ürün adı"
              className={`${GIRDI} h-36 flex-[2_1_170px] px-10 text-14 font-medium text-form`}
            />

            <select
              value={p.categoryId}
              onChange={(e) =>
                yaz(p.id, { categoryId: Number(e.target.value) }, true)
              }
              aria-label="Kategori"
              className={`${GIRDI} h-36 flex-[1_1_140px] px-8 text-14 text-form`}
            >
              {kategoriler.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>

            {/* Sayı + birim eki. Tasarımda iç input'ta outline:none var →
                sarmalayıcıda odak göstergesi yok. focus-within ile erişilebilir
                hale getirildi (K-08); görünüm odaklanmadıkça değişmiyor. */}
            <div className="flex h-36 min-w-110 flex-[0_1_130px] items-center overflow-hidden rounded-8 border border-admin-border bg-admin-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black">
              <input
                type="number"
                min={0}
                value={p.price}
                onChange={(e) =>
                  yaz(p.id, { price: e.target.value === "" ? 0 : Number(e.target.value) })
                }
                aria-label="Kilo fiyatı"
                className="h-full w-full min-w-0 flex-1 border-0 px-8 text-right text-14 text-form outline-none"
              />
              <span className="pr-10 pl-4 text-13 whitespace-nowrap text-admin-muted">
                ₺/kg
              </span>
            </div>

            <input
              value={p.note}
              onChange={(e) => yaz(p.id, { note: e.target.value })}
              placeholder="Açıklama"
              aria-label="Açıklama"
              className={`${GIRDI} h-36 flex-[2_1_170px] px-10 text-13 text-admin-2nd`}
            />

            <DurumToggle
              acik={p.stock}
              acikMetin="Stokta"
              kapaliMetin="Tükendi"
              onChange={() => yaz(p.id, { stock: !p.stock }, true)}
            />

            <SilButonu onClick={() => sil(p)} etiket={`${p.name} ürününü sil`} />
          </div>
        ))}

        {gorunen.length === 0 && (
          <div className="p-32 text-center text-14 text-admin-muted">
            Eşleşen ürün yok.
          </div>
        )}
      </Kart>
    </>
  );
}
