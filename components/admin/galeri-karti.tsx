"use client";

import { useRef } from "react";
import { GIRDI, Kart, SilButonu } from "./ui";
import { GALERI_BLOB_DISI_UYARISI } from "@/lib/galeri-kurali";
import { guvenliGorselUrl } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Galeri düzenleme kartı — vault "Galeri Duzenleme Karti" notundan birebir.

     kart    bg #fff · 1px #e5e5e5 · r12 · p10 · flex-col · gap8
       görsel  aspect 4/3 · r8 · object-cover · bg #f5f5f5
       yoksa   aspect 4/3 · r8 · 1px dashed #d4d4d4 · bg #fafafa
               mono 12px #a3a3a3 · "görsel yok"
       altyazı h34 · 13px/500
       url     flex gap6 → input flex-1 h34 12px #525252 ph "https://…"
               + sil 34×34 (ikon 15px)

   Aşama 4 eklemeleri (tasarımda yok; marka kartındaki dil):
     · "Görsel yükle" düğmesi — Markalar sekmesindeki "Logo yükle" ile aynı
     · Blob dışı eski bağlantı: önizleme yerine kesikli kutuda uyarı
       (CSP o görseli zaten engelliyor; kırık görsel yerine neden gösterilir)
     · URL hatası kartın altında, `role="alert"`
   ────────────────────────────────────────────────────────────────────────── */

export type AdminGaleri = { id: number; url: string; caption: string };

const BOS_KUTU =
  "flex aspect-[4/3] items-center justify-center rounded-8 border border-dashed border-admin-dash bg-admin-bg p-12 text-center";

function Onizleme({ url }: { url: string }) {
  const guvenli = guvenliGorselUrl(url || null);
  if (guvenli)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={guvenli} alt="" className="block aspect-[4/3] w-full rounded-8 bg-admin-off object-cover" />;
  if (url)
    return (
      <div className={`${BOS_KUTU} text-12 leading-15 font-medium text-danger`} role="note">
        {GALERI_BLOB_DISI_UYARISI}
      </div>
    );
  return <div className={`${BOS_KUTU} font-mono text-12 text-faint-light`}>görsel yok</div>;
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

      <input
        value={oge.caption}
        onChange={(e) => onAltYazi(e.target.value)}
        placeholder="Alt yazı"
        aria-label="Alt yazı"
        className={`${GIRDI} h-34 px-10 text-13 font-medium text-form`}
      />

      <div className="flex gap-6">
        <input
          value={oge.url}
          onChange={(e) => onUrl(e.target.value.trim())}
          placeholder="https://…"
          aria-label="Görsel bağlantısı"
          aria-invalid={hata ? true : undefined}
          aria-describedby={hata ? hataId : undefined}
          className={`${GIRDI} h-34 flex-1 px-10 text-12 text-admin-2nd`}
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
      <button
        type="button"
        onClick={() => dosyaGirisi.current?.click()}
        disabled={yukleniyor}
        className="h-34 cursor-pointer rounded-8 border border-admin-border bg-admin-card px-10 text-13 font-medium text-black transition-colors duration-150 ease-out-soft hover:bg-admin-row disabled:cursor-not-allowed disabled:opacity-60"
      >
        {yukleniyor ? "Yükleniyor…" : oge.url ? "Görseli değiştir (yükle)" : "Görsel yükle"}
      </button>

      {hata && (
        <p id={hataId} role="alert" className="m-0 rounded-8 bg-danger-bg px-10 py-8 text-12 leading-15 text-danger">
          {hata}
        </p>
      )}
    </Kart>
  );
}
