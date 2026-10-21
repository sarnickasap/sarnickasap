import Image from "next/image";
import { Suspense } from "react";
import { MesajIkonu, TelefonIkonu } from "@/components/icons";
import type { Saat } from "@/lib/saatler";
import { AcikKapali, AcikKapaliIskelet } from "./acik-kapali";

/* ──────────────────────────────────────────────────────────────────────────
   Hero — vault "Hero" notundan birebir.

     section  max-w 1280 · mx-auto · padding 72px 24px 96px
              grid auto-fit minmax(min(100%,420px),1fr) · gap 48 · items-center
     sol      flex-col · gap 28
     meta     flex · items-center · gap 10 · 13px/500 · #d4d4d4
     H1       DM Sans 700 · clamp(44px,7vw,84px) · lh .98 · ls -.035em
              · #f8efea · text-wrap balance
     alt      max-w 520 · 18px · lh 1.6 · #a3a3a3 · text-wrap pretty
     butonlar flex-wrap · gap 12
       birincil h48 · px22 · gap10 · r8 · #b8222a · 15px/600 · beyaz
       ikincil  h48 · px22 · gap10 · r8 · 1px #333333 · 15px/500 · #fafafa
     sağ      flex · justify-center → img w-full max-w-500 h-auto
   ────────────────────────────────────────────────────────────────────────── */

export function Hero({
  heroTitle,
  heroSub,
  phone,
  waLink,
  telLink,
  saatler,
}: {
  heroTitle: string;
  heroSub: string;
  phone: string;
  waLink: string;
  telLink: string;
  saatler: Saat[];
}) {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-48 px-24 pt-72 pb-96"
    >
      <div className="flex flex-col gap-28">
        <div className="flex items-center gap-10 text-13 font-medium text-soft">
          <Suspense fallback={<AcikKapaliIskelet />}>
            <AcikKapali saatler={saatler} />
          </Suspense>
          <span className="text-dot">·</span>
          <span>Gaziemir, İzmir</span>
        </div>

        <h1 className="m-0 font-display text-h1 leading-h1 font-bold tracking-h1 text-balance text-cream">
          {heroTitle}
        </h1>

        <p className="m-0 max-w-[520px] text-18 leading-16 text-pretty text-muted">
          {heroSub}
        </p>

        <div className="flex flex-wrap gap-12">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-48 items-center gap-10 rounded-8 bg-brand px-22 text-15 font-semibold text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover"
          >
            <MesajIkonu size={18} />
            {/* Apostrof U+2019 — tasarımdaki karakterin aynısı */}
            WhatsApp’tan sipariş ver
          </a>

          <a
            href={telLink}
            className="flex h-48 items-center gap-10 rounded-8 border border-edge px-22 text-15 font-medium text-body transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-white"
          >
            <TelefonIkonu size={18} />
            {phone}
          </a>
        </div>
      </div>

      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Sarnıç Kasap logosu"
          /* Gerçek iç boyutlar — oran tam doğru olsun diye.
             500×475 yazmıştım; doğrusu 475,35 ve bu yuvarlama hatası
             `height:auto` ile ölçeklenince taban kenarında kayma yaratıyordu.
             Tasarım: width:100%;max-width:500px;height:auto */
          width={1420}
          height={1350}
          priority
          /* unoptimized — header'daki sebep: tasarım ham PNG'yi tarayıcıda
             ölçekliyor, yeniden kodlama görünür yumuşama yaratıyor. */
          unoptimized
          className="block h-auto w-full max-w-[500px]"
        />
      </div>
    </section>
  );
}
