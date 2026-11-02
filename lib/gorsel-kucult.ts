/* ──────────────────────────────────────────────────────────────────────────
   Tarayıcıda fotoğraf küçültme (aşama 4, galeri yüklemesi) — yalnızca
   istemcide çağrılır.

   Neden: sunucu eylemi gövdesi 1 MB ile sınırlı ve telefon fotoğrafı
   3–8 MB. Ayrıca yeniden kodlama EXIF'i (konum dahil) siler ve sitede
   gereksiz büyük görsel sunulmaz.

   Uzun kenar en çok 1600 px; önce WEBP, tarayıcı WEBP kodlayamıyorsa
   (eski Safari PNG döndürür) JPEG. Sınırın altına inene kadar kalite
   kademeli düşürülür.

   Paylaşım görseli (og:image) aynı yolu `{ maksKenar: 1200, yalnizJpeg }`
   ile kullanır: WhatsApp/Facebook önizlemesinde WEBP desteği güvenilir
   değil; JPEG'de saydam alan siyah çıkmasın diye zemin beyaz boyanır.
   ────────────────────────────────────────────────────────────────────────── */

const MAKS_KENAR_PX = 1600;
const KALITELER = [0.85, 0.72, 0.6] as const;
const JPEG_ZEMIN = "#ffffff";

export class GorselKucultmeHatasi extends Error {}

export type KucultmeAyari = {
  /** Uzun kenar üst sınırı (px); varsayılan 1600 */
  maksKenar?: number;
  /** true → WEBP denenmez, doğrudan JPEG (beyaz zemin) */
  yalnizJpeg?: boolean;
};

export type KucultulmusGorsel = { dosya: File; genislik: number; yukseklik: number };

function tuvaleCiz(kaynak: ImageBitmap, maksKenar: number, zemin: string | null): HTMLCanvasElement {
  const oran = Math.min(1, maksKenar / Math.max(kaynak.width, kaynak.height));
  const tuval = document.createElement("canvas");
  tuval.width = Math.max(1, Math.round(kaynak.width * oran));
  tuval.height = Math.max(1, Math.round(kaynak.height * oran));
  const ctx = tuval.getContext("2d");
  if (!ctx) throw new GorselKucultmeHatasi("Tarayıcı görseli işleyemedi.");
  if (zemin) {
    ctx.fillStyle = zemin;
    ctx.fillRect(0, 0, tuval.width, tuval.height);
  }
  ctx.drawImage(kaynak, 0, 0, tuval.width, tuval.height);
  return tuval;
}

function kodla(tuval: HTMLCanvasElement, tip: string, kalite: number): Promise<Blob | null> {
  return new Promise((coz) => tuval.toBlob(coz, tip, kalite));
}

async function kodlaWebpYaDaJpeg(tuval: HTMLCanvasElement, kalite: number): Promise<Blob | null> {
  const webp = await kodla(tuval, "image/webp", kalite);
  if (webp?.type === "image/webp") return webp;
  return kodla(tuval, "image/jpeg", kalite);
}

/** Küçültür, yeniden kodlar ve son ölçüyü döndürür; `maksBayt` altına inemezse fırlatır. */
export async function gorseliKucultOlculu(
  dosya: File,
  maksBayt: number,
  ayar: KucultmeAyari = {},
): Promise<KucultulmusGorsel> {
  const kaynak = await createImageBitmap(dosya).catch(() => {
    throw new GorselKucultmeHatasi("Bu dosya görsel olarak açılamadı. JPG, PNG veya WEBP seçin.");
  });
  try {
    const tuval = tuvaleCiz(kaynak, ayar.maksKenar ?? MAKS_KENAR_PX, ayar.yalnizJpeg ? JPEG_ZEMIN : null);
    for (const kalite of KALITELER) {
      const blob = ayar.yalnizJpeg
        ? await kodla(tuval, "image/jpeg", kalite)
        : await kodlaWebpYaDaJpeg(tuval, kalite);
      if (blob && blob.size <= maksBayt) {
        const uzanti = blob.type === "image/webp" ? "webp" : "jpg";
        const yeni = new File([blob], `gorsel.${uzanti}`, { type: blob.type });
        return { dosya: yeni, genislik: tuval.width, yukseklik: tuval.height };
      }
    }
    throw new GorselKucultmeHatasi("Görsel yeterince küçültülemedi. Daha küçük bir fotoğraf deneyin.");
  } finally {
    kaynak.close();
  }
}

/** Galeri: küçültülmüş dosya (ölçü gerekmiyor). */
export async function gorseliKucult(dosya: File, maksBayt: number): Promise<File> {
  return (await gorseliKucultOlculu(dosya, maksBayt)).dosya;
}
