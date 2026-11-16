import { StatusDot } from "@astryxdesign/core/StatusDot";
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

/** Astryx StatusDot. Tasarım: 8px yuvarlak — açık #22c55e, kapalı #737373;
 *  renkler token sınıfıyla korunur (StatusDot'un success/neutral tonları
 *  koyu temada tasarımdan farklı). Hemen yanında görünür metin var
 *  ("Şu an açık …"), bu yüzden nokta ekran okuyucudan gizli — `label`
 *  StatusDot'ta zorunlu ama ikinci kez okunmasın diye aria-hidden. */
function Nokta({ acik }: { acik: boolean }) {
  return (
    <StatusDot
      variant={acik ? "success" : "neutral"}
      label={acik ? "Açık" : "Kapalı"}
      aria-hidden="true"
      className={`h-8 w-8 flex-none ${acik ? "bg-open" : "bg-dot-kapali"}`}
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
 *
 *  Genişlik, beklenen en uzun metnin KENDİSİYLE ölçülüyor ama metin DOM'da
 *  değil, `::before` içeriğinde: eskiden görünmez bir <span> metniydi ve
 *  tarayıcılar/arama motorları statik kabukta "Şu an kapalı · Bugün
 *  08:00–20:00" diye GERÇEK metin okuyordu. Sözde öğe içeriği metin
 *  düğümü değildir; aynı font ve boyutla çizildiği için genişlik birebir
 *  aynı kalır, CLS sıfır. */
export function AcikKapaliIskelet() {
  return (
    <>
      <Nokta acik={false} />
      <span
        aria-hidden
        className="invisible inline-block before:content-['Şu_an_kapalı_·_Bugün_08:00–20:00']"
      />
    </>
  );
}
