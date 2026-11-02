"use client";

import { useRef, useState } from "react";
import { Kart } from "./ui";
import { paylasimGorseliKaldir, paylasimGorseliYukle } from "@/lib/actions/paylasim-gorseli";
import { GorselKucultmeHatasi, gorseliKucultOlculu } from "@/lib/gorsel-kucult";
import {
  PAYLASIM_IPUCU,
  PAYLASIM_MAKS_BAYT,
  PAYLASIM_MAKS_KENAR,
  paylasimOlcusuOku,
} from "@/lib/paylasim-gorseli-kurali";
import { guvenliGorselUrl } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   SEO sekmesi → "Paylaşım görseli" kartı. TASARIMDA YOK; dil galeri
   kartından (kesikli boş kutu, "Görsel yükle" düğmesi, `role="alert"`).

   Önizleme kutusu 1200:630 oranında (Facebook/WhatsApp geniş kartı);
   görsel `object-contain` ile tamamı görünür, gerçek ölçü altta yazılı.
   Fotoğraf yüklemeden önce tarayıcıda JPEG'e küçültülür (uzun kenar
   1200 px): sunucu eylemi gövde sınırı + WhatsApp'ın WEBP önizlemesi.
   ────────────────────────────────────────────────────────────────────────── */

const DUGME =
  "h-34 cursor-pointer rounded-8 border border-admin-border bg-admin-card px-12 text-13 font-medium text-black transition-colors duration-150 ease-out-soft hover:bg-admin-row disabled:cursor-not-allowed disabled:opacity-60";
const KUTU = "aspect-[1200/630] w-full max-w-[480px] rounded-8";
const YUKLEME_HATASI = "Görsel yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.";
const HATA_ID = "paylasim-gorseli-hata";

/** Sunucunun döndürdüğü, kullanıcıya gösterilebilir hata. */
class IslemHatasi extends Error {}

function Onizleme({ url }: { url: string | null }) {
  const guvenli = guvenliGorselUrl(url);
  if (guvenli)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={guvenli} alt="Paylaşım görseli önizlemesi" className={`${KUTU} block bg-admin-off object-contain`} />;
  return (
    <div
      className={`${KUTU} flex items-center justify-center border border-dashed border-admin-dash bg-admin-bg p-12 text-center font-mono text-12 text-faint-light`}
    >
      {url ? "bu görsel sitede kullanılamıyor — yükleyerek değiştirin" : "görsel yok — site logosu kullanılıyor"}
    </div>
  );
}

async function yukle(dosya: File): Promise<{ hata?: string; url?: string }> {
  const kucuk = await gorseliKucultOlculu(dosya, PAYLASIM_MAKS_BAYT, {
    maksKenar: PAYLASIM_MAKS_KENAR,
    yalnizJpeg: true,
  });
  const fd = new FormData();
  fd.set("gorsel", kucuk.dosya);
  fd.set("genislik", String(kucuk.genislik));
  fd.set("yukseklik", String(kucuk.yukseklik));
  return paylasimGorseliYukle(fd);
}

export function PaylasimGorseli({
  ogImageUrl,
  onDegisti,
}: {
  ogImageUrl: string | null;
  onDegisti: () => void;
}) {
  const [url, setUrl] = useState(ogImageUrl);
  const [hata, setHata] = useState<string | null>(null);
  const [mesgul, setMesgul] = useState(false);
  const giris = useRef<HTMLInputElement>(null);
  const olcu = url ? paylasimOlcusuOku(url) : null;

  async function calistir(is: () => Promise<string | null>) {
    setHata(null);
    setMesgul(true);
    try {
      setUrl(await is());
      onDegisti();
    } catch (e) {
      setHata(e instanceof GorselKucultmeHatasi || e instanceof IslemHatasi ? e.message : YUKLEME_HATASI);
    } finally {
      setMesgul(false);
    }
  }

  const dosyaSecildi = (dosya: File) =>
    calistir(async () => {
      const sonuc = await yukle(dosya);
      if (!sonuc.url) throw new IslemHatasi(sonuc.hata ?? YUKLEME_HATASI);
      return sonuc.url;
    });

  const kaldir = () => {
    if (!confirm("Paylaşım görseli kaldırılsın mı? Yerine site logosu kullanılır.")) return;
    void calistir(async () => {
      await paylasimGorseliKaldir();
      return null;
    });
  };

  return (
    <Kart className="flex flex-col gap-10 p-20">
      <span className="text-13 font-medium text-black">Paylaşım görseli</span>
      <p className="m-0 text-12 leading-15 text-admin-muted">{PAYLASIM_IPUCU}</p>
      <Onizleme url={url} />
      {olcu && (
        <span className="text-12 text-admin-muted">
          {olcu.genislik}×{olcu.yukseklik} px
        </span>
      )}

      <input
        ref={giris}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const d = e.target.files?.[0];
          if (d) void dosyaSecildi(d);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-8">
        <button
          type="button"
          onClick={() => giris.current?.click()}
          disabled={mesgul}
          aria-describedby={hata ? HATA_ID : undefined}
          className={DUGME}
        >
          {mesgul ? "İşleniyor…" : url ? "Görseli değiştir (yükle)" : "Görsel yükle"}
        </button>
        {url && (
          <button type="button" onClick={kaldir} disabled={mesgul} className={DUGME}>
            Görseli kaldır
          </button>
        )}
      </div>

      {hata && (
        <p id={HATA_ID} role="alert" className="m-0 rounded-8 bg-danger-bg px-10 py-8 text-12 leading-15 text-danger">
          {hata}
        </p>
      )}
    </Kart>
  );
}
