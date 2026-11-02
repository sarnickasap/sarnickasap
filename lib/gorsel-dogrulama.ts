import "server-only";
import { del } from "@vercel/blob";
import { guvenliGorselUrl } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Yüklenen görsel dosyası doğrulaması — marka logosu (K-31/K-32) ve
   galeri (aşama 4) aynı kuralları buradan okur.

   · Uzantı YALNIZCA doğrulanmış MIME tipinden türetilir; tarayıcıdan gelen
     dosya adı hiç kullanılmaz (K-32: `logo.noext` → `markalar/5.noext`).
   · SVG yalnızca açıkça izin verilen yerde (logo) ve içerik denetiminden
     geçerse kabul edilir. Galeri fotoğrafında SVG'ye gerek yok.

   `"use server"` dosyaları yalnızca async fonksiyon dışa aktarabildiği için
   ortak sabitler ve yardımcılar burada, eylem dosyalarının dışında.
   ────────────────────────────────────────────────────────────────────────── */

const MIME_UZANTI: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

/* ── SVG içerik denetimi (K-32) ──
   Vercel Blob SVG'yi `inline` sunuyor; doğrudan açılırsa içindeki <script>
   çalışır (origin farklı olduğu için etkisi düşük). Tam bir sanitizer
   DEĞİL, derinlemesine savunma: logolar bu yapıların hiçbirine ihtiyaç
   duymaz, dolayısıyla meşru dosya engellenmez. */
const SVG_YASAK = /<script|<foreignObject|<iframe|\son\w+\s*=|javascript:|<!ENTITY|<use[^>]+href\s*=\s*["']?(?:https?:)?\/\//i;

export type GorselKurali = {
  /** İzin verilen MIME tipleri (MIME_UZANTI anahtarlarından) */
  izinli: readonly string[];
  maksBayt: number;
  /** Hata metninde gösterilecek tip listesi, ör. "PNG, JPG veya WEBP" */
  tipMetni: string;
};

export type GorselDogrulamaSonucu = { hata: string } | { uzanti: string; dosya: File };

function boyutMetni(bayt: number): string {
  return bayt >= 1024 * 1024
    ? `${(bayt / (1024 * 1024)).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB`
    : `${Math.round(bayt / 1024)} KB`;
}

/** Dosya tipini, boyutunu ve (SVG ise) içeriğini doğrular. */
export async function gorselDosyasiniDogrula(
  dosya: FormDataEntryValue | null,
  kural: GorselKurali,
): Promise<GorselDogrulamaSonucu> {
  if (!(dosya instanceof File) || dosya.size === 0) return { hata: "Dosya seçilmedi." };

  const uzanti = kural.izinli.includes(dosya.type) ? MIME_UZANTI[dosya.type] : undefined;
  if (!uzanti) return { hata: `Yalnızca ${kural.tipMetni} yüklenebilir.` };

  if (dosya.size > kural.maksBayt)
    return {
      hata: `Dosya ${boyutMetni(kural.maksBayt)}'tan küçük olmalı (şu an ${boyutMetni(dosya.size)}).`,
    };

  if (dosya.type === "image/svg+xml" && SVG_YASAK.test(await dosya.text()))
    return {
      hata: "Bu SVG betik veya dış kaynak içeriyor; güvenlik için reddedildi. PNG olarak yükleyin.",
    };

  return { uzanti, dosya };
}

/**
 * Sitenin yüklediği bir blob'u siler — yalnızca izinli Blob adresinde ve
 * verilen klasör önekinde (ör. "/galeri/"). Elle yapıştırılmış başka bir
 * adres (stok programının deposu vb.) hiç denenmez. Silme hatası işlemi
 * durdurmaz: yetim dosya veri kaybından iyidir, ama günlüğe yazılır.
 */
export async function yuklenenBlobuSil(url: string | null | undefined, onek: string): Promise<void> {
  const guvenli = guvenliGorselUrl(url ?? null);
  if (!guvenli || !new URL(guvenli).pathname.startsWith(onek)) return;
  await del(guvenli).catch((e: unknown) => {
    console.error("Blob silinemedi:", e instanceof Error ? e.message : e);
  });
}
