"use client";

import { useState } from "react";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Button } from "@astryxdesign/core/Button";
import { FileInput } from "@astryxdesign/core/FileInput";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { DurumMesaji, Kart } from "./ui";
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
   SEO sekmesi → "Paylaşım görseli" kartı. Galeri kartının dili:
   kesikli boş kutu, Astryx FileInput, `role="alert"` hata.

   Önizleme Astryx AspectRatio 1200:630 (Facebook/WhatsApp geniş kartı);
   görsel `object-contain` ile tamamı görünür, gerçek ölçü altta yazılı.
   Fotoğraf yüklemeden önce tarayıcıda JPEG'e küçültülür (uzun kenar
   1200 px): sunucu eylemi gövde sınırı + WhatsApp'ın WEBP önizlemesi.
   ────────────────────────────────────────────────────────────────────────── */

const YUKLEME_HATASI = "Görsel yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.";
const HATA_ID = "paylasim-gorseli-hata";

/** Sunucunun döndürdüğü, kullanıcıya gösterilebilir hata. */
class IslemHatasi extends Error {}

function Onizleme({ url }: { url: string | null }) {
  const guvenli = guvenliGorselUrl(url);
  return (
    <div className="w-full max-w-[480px]">
      <AspectRatio
        ratio={1200 / 630}
        fit="contain"
        className="rounded-[var(--radius-element)] bg-[var(--color-background-muted)]"
      >
        {guvenli ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guvenli} alt="Paylaşım görseli önizlemesi" />
        ) : (
          <div className="flex items-center justify-center rounded-[var(--radius-element)] border border-dashed border-[var(--color-border-emphasized)] p-12 text-center font-mono text-12 text-[var(--color-text-secondary)]">
            {url
              ? "bu görsel sitede kullanılamıyor — yükleyerek değiştirin"
              : "görsel yok — site logosu kullanılıyor"}
          </div>
        )}
      </AspectRatio>
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
      <Text type="label">Paylaşım görseli</Text>
      <Text type="supporting" as="p">
        {PAYLASIM_IPUCU}
      </Text>
      <Onizleme url={url} />
      {olcu && (
        <Text type="supporting" hasTabularNumbers>
          {olcu.genislik}×{olcu.yukseklik} px
        </Text>
      )}

      <HStack gap={2} wrap="wrap" vAlign="center">
        <FileInput
          label="Görsel yükle"
          isLabelHidden
          placeholder={mesgul ? "İşleniyor…" : url ? "Görseli değiştir (yükle)" : "Görsel yükle"}
          accept="image/png,image/jpeg,image/webp"
          value={null}
          onChange={(d) => {
            const dosya = Array.isArray(d) ? d[0] : d;
            if (dosya) void dosyaSecildi(dosya);
          }}
          isLoading={mesgul}
          aria-describedby={hata ? HATA_ID : undefined}
          containerClassName="min-w-0 flex-[1_1_220px] max-w-[320px]"
        />
        {url && (
          <Button label="Görseli kaldır" variant="ghost" onClick={kaldir} isDisabled={mesgul} />
        )}
      </HStack>

      {hata && <DurumMesaji tur="hata" metin={hata} id={HATA_ID} />}
    </Kart>
  );
}
