import { connection } from "next/server";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Table, TableBody, TableCell, TableRow } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
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

   Astryx: Card (kutu) · HStack + Icon "clock" + Text (başlık) · Table
   (gün/saat satırları — veri gerçekten tablo: iki sütun, yedi satır).
   Bugünün satırı `aria-current="date"` taşır (site-butunluk testi sayar).

   Vurgulu gün saate bağlı → hero'daki gibi istek zamanında hesaplanır,
   yoksa önbellekte donup yanlış günü vurgulardı.
   ────────────────────────────────────────────────────────────────────────── */

const BASLIK_ID = "calisma-saatleri-baslik";
const HUCRE = "px-20 py-11 text-14";

function Satir({ s, bugun }: { s: Saat; bugun: boolean }) {
  const renk = bugun ? "bg-hover font-semibold text-white" : "text-muted";
  return (
    <TableRow aria-current={bugun ? "date" : undefined}>
      <TableCell className={`${HUCRE} ${renk}`}>{s.day}</TableCell>
      <TableCell className={`${HUCRE} ${renk} text-right`}>{saatEtiketi(s)}</TableCell>
    </TableRow>
  );
}

function Kutu({ children }: { children: React.ReactNode }) {
  return (
    <Card padding={0} className="overflow-hidden">
      <HStack vAlign="center" className="gap-10 border-b border-line px-20 py-14">
        <Icon icon="clock" size="sm" />
        <Text id={BASLIK_ID} weight="semibold" className="text-14 text-body">
          Çalışma saatleri
        </Text>
      </HStack>
      <Table dividers="none" density="compact" aria-labelledby={BASLIK_ID}>
        <TableBody>{children}</TableBody>
      </Table>
    </Card>
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
