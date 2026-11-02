import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";
import { MesajIkonu } from "@/components/icons";
import { AltSayfa } from "@/components/site/alt-sayfa";
import { SepetiTemizle } from "@/components/site/sepeti-temizle";
import { BIRINCIL, IKINCIL, IPUCU, KART } from "@/components/site/siparis-stilleri";
import { siteBilgisiGetir } from "@/lib/data";
import { fiyat, WA_MESAJ, waLink } from "@/lib/format";
import { gunMetni } from "@/lib/teslimat";

/* ──────────────────────────────────────────────────────────────────────────
   Sipariş alındı (K-37) — arama motorlarına kapalı.
   Sorgu dizgisi yalnızca GÖSTERİM içindir (server action yazar); yine de
   zod ile doğrulanır, uymayan değer gösterilmez.
   ────────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Siparişiniz alındı",
  robots: { index: false, follow: false },
};

const SorguSema = z.object({
  no: z.string().regex(/^[A-Za-z0-9-]{1,32}$/),
  tutar: z.coerce.number().nonnegative().optional(),
  ucret: z.coerce.number().nonnegative().optional(),
  tip: z.enum(["pickup", "delivery"]).optional(),
  tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  aralik: z.string().regex(/^\d{2}:\d{2}–\d{2}:\d{2}$/).optional(),
});

type SorguParametreleri = Promise<Record<string, string | string[] | undefined>>;

export default function SiparisTamamSayfasi({ searchParams }: { searchParams: SorguParametreleri }) {
  return (
    <AltSayfa ust="Online sipariş" baslik="Siparişiniz alındı">
      <SepetiTemizle />
      <Suspense fallback={<div className="min-h-190" aria-busy="true" />}>
        <Ozet searchParams={searchParams} />
      </Suspense>
    </AltSayfa>
  );
}

async function Ozet({ searchParams }: { searchParams: SorguParametreleri }) {
  const [ham, info] = await Promise.all([searchParams, siteBilgisiGetir()]);
  const s = SorguSema.safeParse(ham);
  const wa = waLink(info.whatsapp, s.success ? WA_MESAJ.siparisNo(s.data.no) : WA_MESAJ.genelSiparis);

  return (
    <div className={KART}>
      {s.success ? <Ayrinti {...s.data} /> : <p className="m-0 text-16 text-read">Siparişiniz dükkâna iletildi.</p>}
      <p className={IPUCU}>Ödeme teslimde nakit veya kartla yapılır. Tartılı ürünlerde tutar teslimde kesinleşir.</p>
      <div className="flex flex-wrap gap-12">
        <a href={wa} target="_blank" rel="noopener noreferrer" className={BIRINCIL}>
          <MesajIkonu size={18} />
          WhatsApp’tan yazın
        </a>
        <Link href="/" className={IKINCIL}>Ana sayfaya dön</Link>
      </div>
    </div>
  );
}

function Ayrinti(d: z.infer<typeof SorguSema>) {
  const teslim = d.tip === "delivery" ? "Eve teslim" : d.tip === "pickup" ? "Gel-al" : null;
  const zaman = [d.tarih && gunMetni(d.tarih), d.aralik].filter(Boolean).join(" · ");

  return (
    <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-16 gap-y-10 text-15">
      <dt className="text-soft">Sipariş no</dt>
      <dd className="m-0 font-display text-20 font-bold text-white">{d.no}</dd>
      {d.tutar !== undefined && (
        <>
          <dt className="text-soft">Tahmini tutar</dt>
          <dd className="m-0 text-read">{fiyat(d.tutar)}</dd>
        </>
      )}
      {d.ucret ? (
        <>
          <dt className="text-soft">Teslimat ücreti</dt>
          <dd className="m-0 text-read">{fiyat(d.ucret)}</dd>
        </>
      ) : null}
      {teslim && (
        <>
          <dt className="text-soft">Teslim</dt>
          <dd className="m-0 text-read">{zaman ? `${teslim} · ${zaman}` : teslim}</dd>
        </>
      )}
    </dl>
  );
}
