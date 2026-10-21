"use client";

import { useRef, useState } from "react";
import { DurumToggle, GIRDI, Kart, SayfaBasligi, SilButonu, SiyahButon } from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import {
  logoYukle,
  markaEkle,
  markaGuncelle,
  markaSil,
} from "@/lib/actions/markalar";

/* ──────────────────────────────────────────────────────────────────────────
   Markalar sekmesi — TASARIMDA YOK (K-31).
   Görsel dil admin panelinden; galeri kartının yapısı örnek alındı.

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
    if (hemen) void calistir();
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
        aksiyon={
          <SiyahButon tip="arti" onClick={ekle}>
            Marka ekle
          </SiyahButon>
        }
      />

      {hata && (
        <p role="alert" className="m-0 rounded-8 bg-danger-bg px-10 py-8 text-13 text-danger">
          {hata}
        </p>
      )}

      {liste.length === 0 && (
        <p className="m-0 text-14 text-admin-muted">
          Henüz marka yok. “Marka ekle” ile başlayın — logosu olmayan markalar
          sitede gösterilmez.
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-12">
        {liste.map((m) => (
          <Kart key={m.id} className="flex flex-col gap-8 p-10">
            {/* Önizleme koyu zeminde — sitede de koyu zeminde duracak */}
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-8 bg-ink p-12">
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

            <input
              value={m.name}
              onChange={(e) => yaz(m.id, { name: e.target.value })}
              placeholder="Marka adı"
              aria-label="Marka adı"
              className={`${GIRDI} h-34 px-10 text-13 font-medium text-form`}
            />

            <input
              value={m.linkUrl}
              onChange={(e) => yaz(m.id, { linkUrl: e.target.value })}
              placeholder="https://… (isteğe bağlı)"
              aria-label="Marka bağlantısı"
              className={`${GIRDI} h-34 px-10 text-12 text-admin-2nd`}
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
              <button
                type="button"
                onClick={() => girisler.current.get(m.id)?.click()}
                disabled={yukleniyor === m.id}
                className="h-34 flex-1 cursor-pointer rounded-8 border border-admin-border bg-admin-card px-10 text-13 font-medium text-black transition-colors duration-150 ease-out-soft hover:bg-admin-row disabled:cursor-not-allowed disabled:opacity-60"
              >
                {yukleniyor === m.id
                  ? "Yükleniyor…"
                  : m.logoUrl
                    ? "Logoyu değiştir"
                    : "Logo yükle"}
              </button>
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

      <p className="m-0 text-13 leading-15 text-admin-muted">
        Site zemini koyu olduğu için <strong>şeffaf arka planlı, açık renk</strong>{" "}
        logolar en iyi görünür. PNG, SVG, JPG veya WEBP · en fazla 1 MB.
      </p>
    </>
  );
}
