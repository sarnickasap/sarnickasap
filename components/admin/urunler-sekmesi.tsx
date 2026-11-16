"use client";

import { useState } from "react";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { HStack } from "@astryxdesign/core/HStack";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
  ALAN,
  ALAN_KUTUSU,
  AnaButon,
  DurumToggle,
  Kart,
  SATIR_AYRACI,
  SayfaBasligi,
  SilButonu,
} from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { urunEkle, urunGuncelle, urunSil } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   Ürünler sekmesi.
     filtre  arama (Astryx TextInput) + kategori (yerel select)
     satır   ad · kategori · fiyat (₺/kg) · açıklama · stok · sil
     boş     Astryx EmptyState "Eşleşen ürün yok."

   Ad, kategori ve fiyat YEREL alan: e2e testi kategori select'ini ad
   input'unun doğrudan ebeveyninde arıyor, kategori filtresini
   `selectOption` ile seçiyor; fiyat her tuşta kaydediliyor (Astryx
   NumberInput yalnız blur/Enter'da değer bildirir).

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
        aksiyon={<AnaButon etiket="Yeni ürün" onClick={ekle} />}
      />

      <HStack wrap="wrap" gap={2}>
        <TextInput
          type="search"
          label="Ürün ara"
          isLabelHidden
          placeholder="Ürün ara"
          startIcon="search"
          value={arama}
          onChange={setArama}
          containerClassName="flex-[2_1_200px]"
        />
        <select
          value={filtre}
          onChange={(e) => setFiltre(e.target.value)}
          aria-label="Kategoriye göre süz"
          className={`${ALAN} flex-[1_1_160px]`}
        >
          {[TUMU, ...kategoriler.map((k) => k.name)].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </HStack>

      <Kart className="overflow-hidden">
        {gorunen.map((p) => (
          <HStack
            key={p.id}
            wrap="wrap"
            vAlign="center"
            gap={2}
            className={`px-14 py-12 ${SATIR_AYRACI}`}
          >
            <input
              value={p.name}
              onChange={(e) => yaz(p.id, { name: e.target.value })}
              placeholder="Ürün adı"
              aria-label="Ürün adı"
              className={`${ALAN} flex-[2_1_170px] font-medium`}
            />

            <select
              value={p.categoryId}
              onChange={(e) =>
                yaz(p.id, { categoryId: Number(e.target.value) }, true)
              }
              aria-label="Kategori"
              className={`${ALAN} flex-[1_1_140px]`}
            >
              {kategoriler.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>

            {/* Sayı + birim eki; odak göstergesi sarmalayıcıda (focus-within). */}
            <div className={`${ALAN_KUTUSU} flex min-w-110 flex-[0_1_130px] items-center overflow-hidden focus-within:border-[var(--color-accent)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-focus)]`}>
              <input
                type="number"
                min={0}
                value={p.price}
                onChange={(e) =>
                  yaz(p.id, { price: e.target.value === "" ? 0 : Number(e.target.value) })
                }
                aria-label="Kilo fiyatı"
                className="h-full w-full min-w-0 flex-1 border-0 bg-transparent px-8 text-right outline-none"
              />
              <span className="pr-8 pl-4 whitespace-nowrap text-[var(--color-text-secondary)]">
                ₺/kg
              </span>
            </div>

            <TextInput
              label="Açıklama"
              isLabelHidden
              aria-label="Açıklama"
              placeholder="Açıklama"
              value={p.note}
              onChange={(v) => yaz(p.id, { note: v })}
              containerClassName="flex-[2_1_170px]"
            />

            <DurumToggle
              acik={p.stock}
              acikMetin="Stokta"
              kapaliMetin="Tükendi"
              onChange={() => yaz(p.id, { stock: !p.stock }, true)}
            />

            <SilButonu onClick={() => sil(p)} etiket={`${p.name} ürününü sil`} />
          </HStack>
        ))}

        {gorunen.length === 0 && <EmptyState title="Eşleşen ürün yok." isCompact />}
      </Kart>
    </>
  );
}
