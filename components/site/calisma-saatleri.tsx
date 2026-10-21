import { connection } from "next/server";
import { SaatIkonu } from "@/components/icons";
import { istanbulSimdi, saatEtiketi, type Saat } from "@/lib/saatler";

/* ──────────────────────────────────────────────────────────────────────────
   Çalışma Saatleri Tablosu — vault "Calisma Saatleri Tablosu" notundan birebir.

     kutu     flex-col · 1px #1f1f1f · r12 · overflow-hidden
     başlık   p 14px 20px · alt kenarlık 1px #1f1f1f
              14px/600 · #fafafa · flex items-center gap10 + saat ikonu 16px
     bugün    p 11px 20px · 14px · bg #171717 · beyaz · 600
     diğer    p 11px 20px · 14px · #a3a3a3
     etiket   "08:00 – 20:00"  ← en dash, İKİ yanında boşluk
              (hero'daki "08:00–20:00" boşluksuz — farklı!)

   Vurgulu gün saate bağlı → hero'daki gibi istek zamanında hesaplanır,
   yoksa önbellekte donup yanlış günü vurgulardı.
   ────────────────────────────────────────────────────────────────────────── */

function Satir({ s, bugun }: { s: Saat; bugun: boolean }) {
  return (
    <div
      className={
        "flex justify-between px-20 py-11 text-14 " +
        (bugun ? "bg-hover font-semibold text-white" : "text-muted")
      }
      aria-current={bugun ? "date" : undefined}
    >
      <span>{s.day}</span>
      <span>{saatEtiketi(s)}</span>
    </div>
  );
}

function Kutu({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-12 border border-line">
      <div className="flex items-center gap-10 border-b border-line px-20 py-14 text-14 font-semibold text-body">
        <SaatIkonu size={16} />
        Çalışma saatleri
      </div>
      {children}
    </div>
  );
}

export async function CalismaSaatleri({ saatler }: { saatler: Saat[] }) {
  await connection();
  const { gunIndeksi } = istanbulSimdi();
  return (
    <Kutu>
      {saatler.map((s) => (
        <Satir key={s.dayIndex} s={s} bugun={s.dayIndex === gunIndeksi} />
      ))}
    </Kutu>
  );
}

/** Suspense yedeği — hiçbir gün vurgulanmadan, aynı yüksekliği kaplar. */
export function CalismaSaatleriIskelet({ saatler }: { saatler: Saat[] }) {
  return (
    <Kutu>
      {saatler.map((s) => (
        <Satir key={s.dayIndex} s={s} bugun={false} />
      ))}
    </Kutu>
  );
}
