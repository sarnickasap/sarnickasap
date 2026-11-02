"use client";

import { useState } from "react";
import { SayfaBasligi, SiyahButon } from "./ui";
import { GaleriKarti, type AdminGaleri } from "./galeri-karti";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { galeriEkle, galeriGorselYukle, galeriGuncelle, galeriSil } from "@/lib/actions/galeri";
import { GALERI_MAKS_BAYT, GALERI_URL_HATASI, galeriUrlKabul } from "@/lib/galeri-kurali";
import { GorselKucultmeHatasi, gorseliKucult } from "@/lib/gorsel-kucult";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri sekmesi — vault "Galeri Duzenleme Karti" notundan birebir.

     ızgara  auto-fill minmax(min(100%,240px),1fr) · gap12
     kart    → galeri-karti.tsx

   Yeni görsel listenin SONUNA eklenir (push) — diğer sekmelerden farklı.

   Aşama 4: görsel YÜKLEME (sitenin Blob deposu; tarayıcıda küçültülür)
   ve URL alanında yalnızca Blob adresi. Geçersiz URL kaydedilmez, kartta
   hata gösterilir; sunucu da aynı kuralı uygular (lib/galeri-kurali.ts).
   ────────────────────────────────────────────────────────────────────────── */

export type { AdminGaleri } from "./galeri-karti";

const YUKLEME_HATASI = "Görsel yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.";

export function GaleriSekmesi({
  ogeler,
  onDegisti,
}: {
  ogeler: AdminGaleri[];
  onDegisti: () => void;
}) {
  const [liste, setListe] = useState(ogeler);
  const [hatalar, setHatalar] = useState<ReadonlyMap<number, string>>(new Map());
  const [yukleniyor, setYukleniyor] = useState<number | null>(null);
  const gecikmeli = useGecikmeliKayit();

  const hataYaz = (id: number, hata: string | null) =>
    setHatalar((h) => {
      const yeni = new Map(h);
      if (hata) yeni.set(id, hata);
      else yeni.delete(id);
      return yeni;
    });

  const yereldeYaz = (id: number, alan: Partial<AdminGaleri>) =>
    setListe((l) => l.map((g) => (g.id === id ? { ...g, ...alan } : g)));

  function yaz(id: number, alan: Partial<AdminGaleri>) {
    yereldeYaz(id, alan);
    gecikmeli(`galeri-${id}-${Object.keys(alan)[0]}`, () =>
      galeriGuncelle({ id, ...alan }).then(onDegisti),
    );
  }

  function urlYaz(id: number, url: string) {
    if (!galeriUrlKabul(url)) {
      yereldeYaz(id, { url }); // ekranda kalsın ama KAYDEDİLMESİN
      hataYaz(id, GALERI_URL_HATASI);
      return;
    }
    hataYaz(id, null);
    yaz(id, { url });
  }

  async function dosyaSecildi(id: number, dosya: File) {
    hataYaz(id, null);
    setYukleniyor(id);
    try {
      const kucuk = await gorseliKucult(dosya, GALERI_MAKS_BAYT);
      const fd = new FormData();
      fd.set("id", String(id));
      fd.set("gorsel", kucuk);
      const sonuc = await galeriGorselYukle({}, fd);
      if (sonuc.hata) hataYaz(id, sonuc.hata);
      if (sonuc.url) {
        yereldeYaz(id, { url: sonuc.url });
        onDegisti();
      }
    } catch (e) {
      hataYaz(id, e instanceof GorselKucultmeHatasi ? e.message : YUKLEME_HATASI);
    } finally {
      setYukleniyor(null);
    }
  }

  async function ekle() {
    const yeni = await galeriEkle();
    if (yeni) setListe((l) => [...l, yeni as AdminGaleri]);
    onDegisti();
  }

  async function sil(g: AdminGaleri) {
    if (!confirm("Silinsin mi?")) return;
    setListe((l) => l.filter((x) => x.id !== g.id));
    hataYaz(g.id, null);
    await galeriSil(g.id);
    onDegisti();
  }

  return (
    <>
      <SayfaBasligi
        baslik="Galeri"
        altMetin="Görsel yükleyin ve alt yazı girin. Boş bırakılanlar yer tutucu olarak görünür."
        aksiyon={
          <SiyahButon tip="arti" onClick={ekle}>
            Görsel ekle
          </SiyahButon>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-12">
        {liste.map((g) => (
          <GaleriKarti
            key={g.id}
            oge={g}
            yukleniyor={yukleniyor === g.id}
            hata={hatalar.get(g.id) ?? null}
            onAltYazi={(caption) => yaz(g.id, { caption })}
            onUrl={(url) => urlYaz(g.id, url)}
            onDosya={(d) => void dosyaSecildi(g.id, d)}
            onSil={() => void sil(g)}
          />
        ))}
      </div>

      <p className="m-0 text-13 leading-15 text-admin-muted">
        JPG, PNG veya WEBP. Fotoğraf yüklemeden önce otomatik küçültülür (uzun kenar
        1600 px). Bağlantı alanına yalnızca bu siteye yüklenmiş görsellerin adresi yazılabilir.
      </p>
    </>
  );
}
