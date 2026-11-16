"use client";

import { useState } from "react";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { FileInput } from "@astryxdesign/core/FileInput";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
  AnaButon,
  DurumMesaji,
  DurumToggle,
  Kart,
  SayfaBasligi,
  SilButonu,
} from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import {
  logoYukle,
  markaEkle,
  markaGuncelle,
  markaSil,
} from "@/lib/actions/markalar";

/* ──────────────────────────────────────────────────────────────────────────
   Markalar sekmesi — TASARIMDA YOK (K-31).
   Galeri kartının yapısı örnek alındı (Astryx Card + TextInput).
   `main .grid > div` e2e testlerinin kart seçicisi — kartlar ızgaranın
   doğrudan çocuğu kalmalı.

   Önizleme Astryx AspectRatio (16:9), yükleme Astryx FileInput (kompakt;
   seçilen dosya hemen yüklenir, alan değeri hep boş kalır).

   Logo YÜKLEMELİ (galeri URL alanıyla yetiniyordu). Sebep: kullanıcının
   elinde logo dosyası var, barındıracak yeri yok. Vercel Blob'a yükleniyor.
   ────────────────────────────────────────────────────────────────────────── */

export type AdminMarka = {
  id: number;
  name: string;
  logoUrl: string;
  linkUrl: string;
  visible: boolean;
};

export function MarkalarSekmesi({
  markalar,
  onDegisti,
}: {
  markalar: AdminMarka[];
  onDegisti: () => void;
}) {
  const [liste, setListe] = useState(markalar);
  const [yukleniyor, setYukleniyor] = useState<number | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const gecikmeli = useGecikmeliKayit();

  function yaz(id: number, alan: Partial<AdminMarka>, hemen = false) {
    setListe((l) => l.map((m) => (m.id === id ? { ...m, ...alan } : m)));
    const calistir = () => markaGuncelle({ id, ...alan }).then(onDegisti);
    // `hemen` yolu da aynı sarmalıdan geçmeli — yoksa hatası yutulur
    if (hemen) gecikmeli(`marka-${id}-${Object.keys(alan)[0]}`, calistir, true);
    else gecikmeli(`marka-${id}-${Object.keys(alan)[0]}`, calistir);
  }

  async function ekle() {
    const yeni = await markaEkle();
    if (yeni) setListe((l) => [...l, yeni as AdminMarka]);
    onDegisti();
  }

  async function sil(m: AdminMarka) {
    if (!confirm(`${m.name} silinsin mi? Logo dosyası da silinir.`)) return;
    setListe((l) => l.filter((x) => x.id !== m.id));
    await markaSil(m.id);
    onDegisti();
  }

  async function dosyaSecildi(id: number, dosya: File) {
    setHata(null);
    setYukleniyor(id);
    const fd = new FormData();
    fd.set("id", String(id));
    fd.set("logo", dosya);
    const sonuc = await logoYukle({}, fd);
    setYukleniyor(null);
    if (sonuc.hata) {
      setHata(sonuc.hata);
      return;
    }
    if (sonuc.url) {
      setListe((l) => l.map((m) => (m.id === id ? { ...m, logoUrl: sonuc.url! } : m)));
      onDegisti();
    }
  }

  return (
    <>
      <SayfaBasligi
        baslik="Çalıştığımız üreticiler"
        altMetin="Logolar sitede Hakkımızda bölümünün altında akan şeritte görünür."
        aksiyon={<AnaButon etiket="Marka ekle" onClick={ekle} />}
      />

      {hata && <DurumMesaji tur="hata" metin={hata} />}

      {liste.length === 0 && (
        <EmptyState
          title="Henüz marka yok."
          description="“Marka ekle” ile başlayın — logosu olmayan markalar sitede gösterilmez."
          headingLevel={2}
        />
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-12">
        {liste.map((m) => (
          <Kart key={m.id} className="flex flex-col gap-8 p-10">
            {/* Önizleme koyu zeminde — sitede de koyu zeminde duracak */}
            <AspectRatio
              ratio={16 / 9}
              fit="cover"
              className="rounded-[var(--radius-element)]"
            >
              <div className="flex items-center justify-center bg-ink p-12">
                {m.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.logoUrl}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="font-mono text-12 text-muted-dark">logo yok</span>
                )}
              </div>
            </AspectRatio>

            <TextInput
              label="Marka adı"
              isLabelHidden
              aria-label="Marka adı"
              placeholder="Marka adı"
              value={m.name}
              onChange={(v) => yaz(m.id, { name: v })}
            />

            <TextInput
              type="url"
              label="Marka bağlantısı"
              isLabelHidden
              aria-label="Marka bağlantısı"
              placeholder="https://… (isteğe bağlı)"
              value={m.linkUrl}
              onChange={(v) => yaz(m.id, { linkUrl: v })}
            />

            <HStack gap={1.5} vAlign="center">
              <FileInput
                label="Logo yükle"
                isLabelHidden
                placeholder={
                  yukleniyor === m.id
                    ? "Yükleniyor…"
                    : m.logoUrl
                      ? "Logoyu değiştir"
                      : "Logo yükle"
                }
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                value={null}
                onChange={(d) => {
                  const dosya = Array.isArray(d) ? d[0] : d;
                  if (dosya) void dosyaSecildi(m.id, dosya);
                }}
                isLoading={yukleniyor === m.id}
                containerClassName="min-w-0 flex-1"
              />
              <SilButonu kucuk onClick={() => sil(m)} etiket={`${m.name} markasını sil`} />
            </HStack>

            <DurumToggle
              acik={m.visible}
              acikMetin="Yayında"
              kapaliMetin="Gizli"
              onChange={() => yaz(m.id, { visible: !m.visible }, true)}
            />
          </Kart>
        ))}
      </div>

      <Text type="supporting" as="p">
        Site zemini koyu olduğu için <strong>şeffaf arka planlı, açık renk</strong>{" "}
        logolar en iyi görünür. PNG, SVG, JPG veya WEBP · en fazla 1 MB.
      </Text>
    </>
  );
}
