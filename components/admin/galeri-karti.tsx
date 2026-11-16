"use client";

import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { FileInput } from "@astryxdesign/core/FileInput";
import { HStack } from "@astryxdesign/core/HStack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { DurumMesaji, Kart, SilButonu } from "./ui";
import { GALERI_BLOB_DISI_UYARISI } from "@/lib/galeri-kurali";
import { guvenliGorselUrl } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri düzenleme kartı (Astryx Card).
     görsel   Astryx AspectRatio 4/3 · cover; yoksa kesikli kutuda "görsel yok"
     alanlar  alt yazı · bağlantı (+ sil) — Astryx TextInput
     yükleme  Astryx FileInput (kompakt); seçilen dosya hemen yüklenir,
              alan değeri hep boş kalır (dosya adı değil önizleme gösterilir)
     Blob dışı eski bağlantı: önizleme yerine kesikli kutuda uyarı
       (CSP o görseli zaten engelliyor; kırık görsel yerine neden gösterilir)
     URL/yükleme hatası kartın altında, `role="alert"`
   ────────────────────────────────────────────────────────────────────────── */

export type AdminGaleri = { id: number; url: string; caption: string };

const BOS_KUTU =
  "flex items-center justify-center rounded-[var(--radius-element)] border border-dashed border-[var(--color-border-emphasized)] bg-[var(--color-background-muted)] p-12 text-center";

function Onizleme({ url }: { url: string }) {
  const guvenli = guvenliGorselUrl(url || null);
  return (
    <AspectRatio
      ratio={4 / 3}
      fit="cover"
      className="rounded-[var(--radius-element)] bg-[var(--color-background-muted)]"
    >
      {guvenli ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={guvenli} alt="" />
      ) : url ? (
        <div
          className={`${BOS_KUTU} text-12 leading-15 font-medium text-[var(--color-text-error)]`}
          role="note"
        >
          {GALERI_BLOB_DISI_UYARISI}
        </div>
      ) : (
        <div className={`${BOS_KUTU} font-mono text-12 text-[var(--color-text-secondary)]`}>
          görsel yok
        </div>
      )}
    </AspectRatio>
  );
}

export function GaleriKarti({
  oge,
  yukleniyor,
  hata,
  onAltYazi,
  onUrl,
  onDosya,
  onSil,
}: {
  oge: AdminGaleri;
  yukleniyor: boolean;
  hata: string | null;
  onAltYazi: (deger: string) => void;
  onUrl: (deger: string) => void;
  onDosya: (dosya: File) => void;
  onSil: () => void;
}) {
  const hataId = `galeri-${oge.id}-hata`;

  return (
    <Kart className="flex flex-col gap-8 p-10">
      <Onizleme url={oge.url} />

      <TextInput
        label="Alt yazı"
        isLabelHidden
        aria-label="Alt yazı"
        placeholder="Alt yazı"
        value={oge.caption}
        onChange={onAltYazi}
      />

      <HStack gap={1.5} vAlign="center">
        <TextInput
          type="url"
          label="Görsel bağlantısı"
          isLabelHidden
          aria-label="Görsel bağlantısı"
          placeholder="https://…"
          value={oge.url}
          onChange={(v) => onUrl(v.trim())}
          status={hata ? { type: "error" } : undefined}
          aria-describedby={hata ? hataId : undefined}
          containerClassName="min-w-0 flex-1"
        />
        <SilButonu kucuk onClick={onSil} etiket="Görseli sil" />
      </HStack>

      <FileInput
        label="Görsel yükle"
        isLabelHidden
        placeholder={
          yukleniyor
            ? "Yükleniyor…"
            : oge.url
              ? "Görseli değiştir (yükle)"
              : "Görsel yükle"
        }
        accept="image/png,image/jpeg,image/webp"
        value={null}
        onChange={(d) => {
          const dosya = Array.isArray(d) ? d[0] : d;
          if (dosya) onDosya(dosya);
        }}
        isLoading={yukleniyor}
      />

      {hata && <DurumMesaji tur="hata" metin={hata} id={hataId} />}
    </Kart>
  );
}
