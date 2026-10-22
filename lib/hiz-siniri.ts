import "server-only";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { loginAttempts } from "@/lib/db/schema";

/* ──────────────────────────────────────────────────────────────────────────
   Giriş hız sınırı — kaba kuvvet koruması (K-32).

   Önce hiç yoktu: saldırgan sınırsız şifre deneyebiliyordu. bcrypt cost 12
   her denemeyi ~250 ms yapıyor ama bu tek başına yeterli değil; paralel
   isteklerle sözlük saldırısı hâlâ mümkün.

   Neden veritabanı, bellek değil?
   Sunucusuz ortamda her istek başka bir örneğe düşebilir; bellekteki sayaç
   saldırganın lehine sıfırlanır.

   İKİ anahtarla sayılır:
   · e-posta → tek hesaba yoğunlaşan saldırıyı durdurur
   · IP      → çok sayıda hesabı tarayan saldırıyı durdurur
   Hangisi önce dolarsa giriş reddedilir.
   ────────────────────────────────────────────────────────────────────────── */

/** Pencere içinde izin verilen başarısız deneme sayısı. */
const SINIR_EPOSTA = 8;
const SINIR_IP = 20;
const PENCERE_DK = 15;

function pencereBasi() {
  return new Date(Date.now() - PENCERE_DK * 60_000);
}

async function say(anahtar: string): Promise<number> {
  const [satir] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(loginAttempts)
    .where(
      and(eq(loginAttempts.anahtar, anahtar), gt(loginAttempts.zaman, pencereBasi())),
    );
  return satir?.n ?? 0;
}

export type SinirDurumu = { engelli: boolean; kalanDk?: number };

/** Giriş denemesinden ÖNCE çağrılır. */
export async function girisSiniriKontrol(
  eposta: string,
  ip: string,
): Promise<SinirDurumu> {
  const [epostaSayi, ipSayi] = await Promise.all([
    say(`e:${eposta}`),
    say(`i:${ip}`),
  ]);

  if (epostaSayi >= SINIR_EPOSTA || ipSayi >= SINIR_IP) {
    return { engelli: true, kalanDk: PENCERE_DK };
  }
  return { engelli: false };
}

/** Başarısız denemeden SONRA çağrılır. */
export async function basarisizDenemeKaydet(eposta: string, ip: string) {
  await db.insert(loginAttempts).values([
    { anahtar: `e:${eposta}` },
    { anahtar: `i:${ip}` },
  ]);

  // Fırsat buldukça eski kayıtları temizle — ayrı bir cron'a gerek kalmasın
  await db
    .delete(loginAttempts)
    .where(lt(loginAttempts.zaman, new Date(Date.now() - 24 * 60 * 60_000)));
}

/** Başarılı girişten sonra o e-postanın sayacı sıfırlanır. */
export async function denemeleriTemizle(eposta: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.anahtar, `e:${eposta}`));
}
