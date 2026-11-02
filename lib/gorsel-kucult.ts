/* ──────────────────────────────────────────────────────────────────────────
   Tarayıcıda fotoğraf küçültme (aşama 4, galeri yüklemesi) — yalnızca
   istemcide çağrılır.

   Neden: sunucu eylemi gövdesi 1 MB ile sınırlı ve telefon fotoğrafı
   3–8 MB. Ayrıca yeniden kodlama EXIF'i (konum dahil) siler ve sitede
   gereksiz büyük görsel sunulmaz.

   Uzun kenar en çok 1600 px; önce WEBP, tarayıcı WEBP kodlayamıyorsa
   (eski Safari PNG döndürür) JPEG. Sınırın altına inene kadar kalite
   kademeli düşürülür.
   ────────────────────────────────────────────────────────────────────────── */

const MAKS_KENAR_PX = 1600;
const KALITELER = [0.85, 0.72, 0.6] as const;

export class GorselKucultmeHatasi extends Error {}

function tuvaleCiz(kaynak: ImageBitmap): HTMLCanvasElement {
  const oran = Math.min(1, MAKS_KENAR_PX / Math.max(kaynak.width, kaynak.height));
  const tuval = document.createElement("canvas");
  tuval.width = Math.max(1, Math.round(kaynak.width * oran));
  tuval.height = Math.max(1, Math.round(kaynak.height * oran));
  const ctx = tuval.getContext("2d");
  if (!ctx) throw new GorselKucultmeHatasi("Tarayıcı görseli işleyemedi.");
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

/** Fotoğrafı küçültüp yeniden kodlar; `maksBayt` altına inemezse fırlatır. */
export async function gorseliKucult(dosya: File, maksBayt: number): Promise<File> {
  const kaynak = await createImageBitmap(dosya).catch(() => {
    throw new GorselKucultmeHatasi("Bu dosya görsel olarak açılamadı. JPG, PNG veya WEBP seçin.");
  });
  try {
    const tuval = tuvaleCiz(kaynak);
    for (const kalite of KALITELER) {
      const blob = await kodlaWebpYaDaJpeg(tuval, kalite);
      if (blob && blob.size <= maksBayt) {
        const uzanti = blob.type === "image/webp" ? "webp" : "jpg";
        return new File([blob], `galeri.${uzanti}`, { type: blob.type });
      }
    }
    throw new GorselKucultmeHatasi("Görsel yeterince küçültülemedi. Daha küçük bir fotoğraf deneyin.");
  } finally {
    kaynak.close();
  }
}
