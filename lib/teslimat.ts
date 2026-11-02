import type { Teslimat } from "@/lib/stok-sema";

/* ──────────────────────────────────────────────────────────────────────────
   Teslim/alım günü ve saat aralığı üretimi — Europe/Istanbul'a sabit
   (lib/saatler.ts ile aynı gerekçe: dükkân İzmir'de).

   Kurallar stok programının `delivery` ayarlarından gelir:
     · ilk aralık openTime'da başlar, son aralık closeTime'da BİTER
     · en erken aralık = şimdi + leadHours
     · closedWeekdays (0 = Pazartesi) günleri listelenmez
     · bugün dahil en fazla maxDaysAhead gün sonrası
   Saf fonksiyonlar: `simdi` dışarıdan verilir (istemcide mount sonrası,
   sunucuda istek anında) — prerender'a sabitlenen bir `new Date()` yok.
   ────────────────────────────────────────────────────────────────────────── */

const ISTANBUL = "Europe/Istanbul";
const SAAT_MS = 3_600_000;
const GUN_MS = 86_400_000;

type IstanbulAni = { tarih: string; dakika: number };

function istanbulAni(an: Date): IstanbulAni {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: ISTANBUL,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(an)
      .map((x) => [x.type, x.value]),
  );
  return {
    tarih: `${p.year}-${p.month}-${p.day}`,
    dakika: Number(p.hour) * 60 + Number(p.minute),
  };
}

function utcGun(tarih: string): Date {
  const [y, m, d] = tarih.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function gunEkle(tarih: string, n: number): string {
  return new Date(utcGun(tarih).getTime() + n * GUN_MS).toISOString().slice(0, 10);
}

/** 0 = Pazartesi … 6 = Pazar (sözleşmedeki closedWeekdays ile aynı) */
function haftaGunu(tarih: string): number {
  return (utcGun(tarih).getUTCDay() + 6) % 7;
}

function dakikaya(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

export function saatMetni(dakika: number): string {
  const h = String(Math.floor(dakika / 60)).padStart(2, "0");
  const m = String(dakika % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** Bir günün tüm aralık başlangıçları (dakika). */
function aralikBaslangiclari(d: Teslimat): number[] {
  const bitis = dakikaya(d.closeTime);
  const sonuc: number[] = [];
  for (let s = dakikaya(d.openTime); s + d.slotMinutes <= bitis; s += d.slotMinutes) {
    sonuc.push(s);
  }
  return sonuc;
}

/** Seçilen gün için uygun aralıklar ("HH:MM" başlangıçları). */
export function uygunAraliklar(d: Teslimat, tarih: string, simdi: Date): string[] {
  if (d.closedWeekdays.includes(haftaGunu(tarih))) return [];
  const enErken = istanbulAni(new Date(simdi.getTime() + d.leadHours * SAAT_MS));
  if (tarih < enErken.tarih) return [];
  const hepsi = aralikBaslangiclari(d);
  const uygun = tarih === enErken.tarih ? hepsi.filter((s) => s >= enErken.dakika) : hepsi;
  return uygun.map(saatMetni);
}

/** "10:00" → "10:00–11:00" */
export function aralikEtiketi(d: Teslimat, baslangic: string): string {
  return `${baslangic}–${saatMetni(dakikaya(baslangic) + d.slotMinutes)}`;
}

const GUN_BICIMI = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  weekday: "long",
});

/** "2026-11-03" → "3 Kasım Salı" */
export function gunMetni(tarih: string): string {
  return GUN_BICIMI.format(utcGun(tarih));
}

export type GunSecenegi = { deger: string; etiket: string };

/** Bugünden maxDaysAhead'e, en az bir uygun aralığı olan günler. */
export function uygunGunler(d: Teslimat, simdi: Date): GunSecenegi[] {
  const bugun = istanbulAni(simdi).tarih;
  const sonuc: GunSecenegi[] = [];
  for (let i = 0; i <= d.maxDaysAhead; i++) {
    const tarih = gunEkle(bugun, i);
    if (uygunAraliklar(d, tarih, simdi).length === 0) continue;
    const onEk = i === 0 ? "Bugün, " : i === 1 ? "Yarın, " : "";
    sonuc.push({ deger: tarih, etiket: onEk + gunMetni(tarih) });
  }
  return sonuc;
}
