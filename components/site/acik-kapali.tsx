import { connection } from "next/server";
import { bugunDurumu, type Saat } from "@/lib/saatler";

/* ──────────────────────────────────────────────────────────────────────────
   Hero meta satırı: durum noktası + "Şu an açık · Bugün 08:00–20:00"

   Neden istek zamanında (connection) ve Suspense içinde?
   Sayfanın geri kalanı `use cache` ile statik sunuluyor. Açık/kapalı durumu
   önbelleğe alınsaydı dükkân kapandıktan sonra bir süre "Şu an açık" yazabilir,
   müşteri boşuna yola çıkabilirdi. Bu küçük parça her istekte taze hesaplanır,
   sayfanın kalanı statik kalır (PPR).

   İlk denemede bunu istemci bileşeni yapmıştım; Next 16 haklı olarak
   reddetti: `new Date()` prerender sırasında SABİTLENİRDİ
   (blocking-prerender-current-time-client).

   Tasarım bu hesabı tarayıcıda, ziyaretçinin saat diliminde yapıyordu.
   Burada Europe/Istanbul'a sabit — bkz. lib/saatler.ts.
   ────────────────────────────────────────────────────────────────────────── */

/** Tasarım: width:8px;height:8px;border-radius:50% — açık #22c55e, kapalı #737373 */
function Nokta({ acik }: { acik: boolean }) {
  return (
    <span
      className={`h-8 w-8 flex-none rounded-full ${acik ? "bg-open" : "bg-dot-kapali"}`}
      aria-hidden
    />
  );
}

export async function AcikKapali({ saatler }: { saatler: Saat[] }) {
  await connection();
  const durum = bugunDurumu(saatler);

  return (
    <>
      <Nokta acik={durum.acik} />
      <span>{durum.metin}</span>
    </>
  );
}

/** Suspense yedeği — yer kaplasın ki durum akınca satır kaymasın (CLS).
 *  Görünmez metin, beklenen en uzun değerle aynı uzunlukta. */
export function AcikKapaliIskelet() {
  return (
    <>
      <Nokta acik={false} />
      <span className="invisible" aria-hidden>
        Şu an kapalı · Bugün 08:00–20:00
      </span>
    </>
  );
}
