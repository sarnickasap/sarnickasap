"use client";

import { useRef } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { TextInput } from "@astryxdesign/core/TextInput";
import { DurumMesaji, Kart, SilButonu } from "./ui";
import { GALERI_BLOB_DISI_UYARISI } from "@/lib/galeri-kurali";
import { guvenliGorselUrl } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri düzenleme kartı (Astryx Card).
     görsel   aspect 4/3 · object-cover; yoksa kesikli kutuda "görsel yok"
     alanlar  alt yazı · bağlantı (+ sil) — Astryx TextInput
     yükleme  "Görsel yükle" düğmesi (gizli dosya girişini tetikler)
     Blob dışı eski bağlantı: önizleme yerine kesikli kutuda uyarı
       (CSP o görseli zaten engelliyor; kırık görsel yerine neden gösterilir)
     URL/yükleme hatası kartın altında, `role="alert"`
   ────────────────────────────────────────────────────────────────────────── */

export type AdminGaleri = { id: number; url: string; caption: string };

const BOS_KUTU =
  "flex aspect-[4/3] items-center justify-center rounded-[var(--radius-element)] border border-dashed border-[var(--color-border-emphasized)] bg-[var(--color-background-muted)] p-12 text-center";

function Onizleme({ url }: { url: string }) {
  const guvenli = guvenliGorselUrl(url || null);
  if (guvenli)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={guvenli} alt="" className="block aspect-[4/3] w-full rounded-[var(--radius-element)] bg-[var(--color-background-muted)] object-cover" />;
  if (url)
    return (
      <div className={`${BOS_KUTU} text-12 leading-15 font-medium text-[var(--color-text-error)]`} role="note">
        {GALERI_BLOB_DISI_UYARISI}
      </div>
    );
  return <div className={`${BOS_KUTU} font-mono text-12 text-[var(--color-text-secondary)]`}>görsel yok</div>;
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
  const dosyaGirisi = useRef<HTMLInputElement>(null);
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

      <div className="flex items-center gap-6">
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
          containerClassName="flex-1"
        />
        <SilButonu kucuk onClick={onSil} etiket="Görseli sil" />
      </div>

      <input
        ref={dosyaGirisi}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const d = e.target.files?.[0];
          if (d) onDosya(d);
          e.target.value = "";
        }}
      />
      <Button
        label={oge.url ? "Görseli değiştir (yükle)" : "Görsel yükle"}
        icon={<Icon icon="upload" />}
        onClick={() => dosyaGirisi.current?.click()}
        isLoading={yukleniyor}
        width="100%"
      >
        {yukleniyor ? "Yükleniyor…" : undefined}
      </Button>

      {hata && <DurumMesaji tur="hata" metin={hata} id={hataId} />}
    </Kart>
  );
}
