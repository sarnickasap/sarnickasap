import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SITE_TAG } from "@/lib/data";
import { suresiDolanKampanyalariKaldir } from "@/lib/kampanya-suresi";
import { istanbulGunu } from "@/lib/saatler";
import {
  KatalogSema,
  SiparisYanitSema,
  type Katalog,
  type SiparisYaniti,
} from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Stok programı istemcisi (K-37).

   Ürün, fiyat, birim, stok, kategori ve teslimat ayarlarının TEK doğru
   kaynağı stok programı. Tarayıcı stok programıyla asla konuşmaz; her
   çağrı burada, sunucuda ve token ile yapılır.

   Hata politikası: sayfaya ASLA hata fırlatılmaz. Katalog alınamazsa
   `null` döner, ana sayfa veritabanındaki ürünlere düşer ve sipariş
   kapanır (yalnızca WhatsApp).

   "Son başarılı katalog" davranışı: önbellekli iç fonksiyon hata
   durumunda FIRLATIR — böylece hata önbelleğe yazılmaz ve arka plan
   tazelemesi başarısız olursa önceki başarılı kayıt sunulmaya devam eder.
   Dış sarmalayıcı hatayı yakalayıp `null`a çevirir.
   ────────────────────────────────────────────────────────────────────────── */

const KATALOG_ZAMAN_ASIMI_MS = 5_000;
const SIPARIS_ZAMAN_ASIMI_MS = 10_000;
/** ~5 dk tazeleme; stok programı değişiklikte ayrıca bildirim atıyor. */
const KATALOG_ONBELLEK = { stale: 300, revalidate: 300, expire: 86_400 } as const;

type Baglanti = { url: string; token: string };

function baglantiAl(): Baglanti | null {
  const url = process.env.STOK_API_URL?.trim().replace(/\/+$/, "");
  const token = process.env.STOK_API_TOKEN?.trim();
  if (!url || !token) return null;
  const guvenliAdres =
    url.startsWith("https://") || url.startsWith("http://localhost");
  return guvenliAdres ? { url, token } : null;
}

/** Stok programı yapılandırılmış mı? (panelde sekme gizleme için) */
export function stokProgramiTanimli(): boolean {
  return Boolean(process.env.STOK_API_URL?.trim());
}

/* Token önbellek anahtarına girmesin diye argüman olarak verilmiyor;
   bağlantı önbellekli kapsamın İÇİNDE okunuyor. */
async function katalogCek(): Promise<Katalog> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife(KATALOG_ONBELLEK);

  const b = baglantiAl();
  if (!b) throw new Error("STOK_API_URL / STOK_API_TOKEN tanımlı değil");
  const { url, token } = b;

  const yanit = await fetch(`${url}/api/web/katalog`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    signal: AbortSignal.timeout(KATALOG_ZAMAN_ASIMI_MS),
    cache: "no-store",
  });
  if (!yanit.ok) throw new Error(`Katalog HTTP ${yanit.status}`);

  const sonuc = KatalogSema.safeParse(await yanit.json());
  if (!sonuc.success) throw new Error("Katalog sözleşmeye uymuyor");

  return {
    ...sonuc.data,
    products: [...sonuc.data.products].sort((a, b) => a.sort - b.sort),
  };
}

/* "Bugün" (Europe/Istanbul) — süresi dolan kampanya koruması için (K-39).

   Prerender'da çıplak `new Date()` derlemeyi düşürür (Cache Components);
   footer yılındaki gibi `use cache` içinde okunur. Ömrü katalogla AYNI:
   kampanya bitişi en geç bir katalog tazeleme turu (~5 dk) gecikmeyle
   yansır, sayfalar statik kalır (daha kısa ömür sayfayı dinamiğe çevirirdi).
   `SITE_TAG` ile stok bildirimi / panel kaydı da tarihi tazeler. */
async function bugunGetir(): Promise<string> {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife(KATALOG_ONBELLEK);
  return istanbulGunu();
}

/** Güncel katalog; alınamazsa `null` (sayfa yedek veriye düşer).
 *  Süresi dolmuş kampanyalar normal fiyata döndürülmüş olarak gelir. */
export async function katalogGetir(): Promise<Katalog | null> {
  if (!baglantiAl()) return null;
  try {
    const [katalog, bugun] = await Promise.all([katalogCek(), bugunGetir()]);
    return suresiDolanKampanyalariKaldir(katalog, bugun);
  } catch (e) {
    console.error("Stok kataloğu alınamadı:", e instanceof Error ? e.message : e);
    return null;
  }
}

const GENEL_HATA =
  "Sipariş şu an iletilemedi. Lütfen biraz sonra tekrar deneyin ya da WhatsApp’tan yazın.";

/** Siparişi stok programına iletir. Hiçbir durumda fırlatmaz. */
export async function siparisGonder(govde: unknown): Promise<SiparisYaniti> {
  const b = baglantiAl();
  if (!b) return { ok: false, error: GENEL_HATA };

  try {
    const yanit = await fetch(`${b.url}/api/web/siparis`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${b.token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(govde),
      signal: AbortSignal.timeout(SIPARIS_ZAMAN_ASIMI_MS),
      cache: "no-store",
    });
    return await yanitiCoz(yanit);
  } catch (e) {
    console.error("Sipariş iletilemedi:", e instanceof Error ? e.message : e);
    return { ok: false, error: GENEL_HATA };
  }
}

/** Kullanıcıya yalnızca iş kuralı mesajları (400/422/429) gösterilir;
 *  401/500 gibi iç hatalar genel mesaja çevrilir. */
async function yanitiCoz(yanit: Response): Promise<SiparisYaniti> {
  const sonuc = SiparisYanitSema.safeParse(await yanit.json().catch(() => null));
  if (!sonuc.success) {
    console.error(`Sipariş yanıtı çözülemedi (HTTP ${yanit.status})`);
    return { ok: false, error: GENEL_HATA };
  }
  if (sonuc.data.ok) return sonuc.data;

  const kullaniciyaGosterilir = [400, 422, 429].includes(yanit.status);
  if (!kullaniciyaGosterilir) {
    console.error(`Sipariş reddedildi (HTTP ${yanit.status}): ${sonuc.data.error}`);
  }
  return { ok: false, error: kullaniciyaGosterilir ? sonuc.data.error : GENEL_HATA };
}
