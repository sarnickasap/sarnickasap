/* ──────────────────────────────────────────────────────────────────────────
   Açık/kapalı hesabı — tasarımın `renderVals()` mantığından aktarıldı.

   Tasarımdaki kod:
     const todayIdx = (new Date().getDay() + 6) % 7;          // Pazartesi = 0
     const hm = HH + ':' + MM;
     const openNow = !t.closed && hm >= t.open && hm < t.close;

   ⚠️  Tasarım bunu ziyaretçinin KENDİ saat diliminde hesaplıyor. Dükkân
   İzmir'de; Almanya'daki bir ziyaretçi saat 19:00'da (TR 20:00) "Şu an açık"
   görürdü — oysa dükkân kapanmış olurdu. Burada hesap açıkça
   Europe/Istanbul'a sabitlendi. Türkiye'deki ziyaretçi için sonuç
   tasarımla birebir aynı, yurt dışındaki için doğru.

   Saat karşılaştırması tasarımdaki gibi METİN karşılaştırması ("08:00" <
   "20:00"); sıfır dolgulu HH:MM biçiminde bu doğru çalışır.
   ────────────────────────────────────────────────────────────────────────── */

const GUN_INDEKSI: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export function istanbulSimdi(now: Date = new Date()) {
  const parcalar = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );

  return {
    gunIndeksi: GUN_INDEKSI[parcalar.weekday] ?? 0,
    hm: `${parcalar.hour}:${parcalar.minute}`,
  };
}

/** Europe/Istanbul'daki takvim yılı. Footer telif satırı için. */
export function istanbulYili(now: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
    }).format(now),
  );
}

export type Saat = {
  dayIndex: number;
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

export type BugunDurumu = {
  acik: boolean;
  /** Tasarımdaki `todayText` — birebir aynı metin */
  metin: string;
  gunIndeksi: number;
};

export function bugunDurumu(saatler: Saat[], now?: Date): BugunDurumu {
  const { gunIndeksi, hm } = istanbulSimdi(now);
  const t = saatler.find((s) => s.dayIndex === gunIndeksi);

  if (!t) return { acik: false, metin: "", gunIndeksi };

  const acik = !t.closed && hm >= t.open && hm < t.close;

  // Tasarım: en dash (–), tire değil. "Bugün 08:00–20:00"
  const metin = t.closed
    ? "Bugün kapalı"
    : (acik ? "Şu an açık · " : "Şu an kapalı · ") +
      "Bugün " +
      t.open +
      "–" +
      t.close;

  return { acik, metin, gunIndeksi };
}

/** Tasarım: closed ? 'Kapalı' : open + ' – ' + close
 *  (Burada en dash'in İKİ yanında da boşluk var — hero'dakinden farklı.) */
export function saatEtiketi(t: Saat): string {
  return t.closed ? "Kapalı" : `${t.open} – ${t.close}`;
}
