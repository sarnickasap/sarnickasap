"use client";

import { useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Icon } from "@astryxdesign/core/Icon";
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
  const girisler = useRef(new Map<number, HTMLInputElement | null>());

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
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[var(--radius-element)] bg-ink p-12">
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

            <div className="flex items-center gap-6">
              <input
                ref={(el) => {
                  girisler.current.set(m.id, el);
                }}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const d = e.target.files?.[0];
                  if (d) void dosyaSecildi(m.id, d);
                  e.target.value = "";
                }}
              />
              <Button
                label={m.logoUrl ? "Logoyu değiştir" : "Logo yükle"}
                icon={<Icon icon="upload" />}
                onClick={() => girisler.current.get(m.id)?.click()}
                isLoading={yukleniyor === m.id}
                className="flex-1"
              >
                {yukleniyor === m.id ? "Yükleniyor…" : undefined}
              </Button>
              <SilButonu kucuk onClick={() => sil(m)} etiket={`${m.name} markasını sil`} />
            </div>

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
