import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { MesajIkonu, SepetIkonu, TelefonIkonu } from "@/components/icons";
import type { Saat } from "@/lib/saatler";
import { AcikKapali, AcikKapaliIskelet } from "./acik-kapali";
import { CTA, CTA_IKINCIL } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   Hero — vault "Hero" notundan birebir.

     section  max-w 1280 · mx-auto · padding 72px 24px 96px
              grid auto-fit minmax(min(100%,420px),1fr) · gap 48 · items-center
     sol      flex-col · gap 28
     meta     flex · items-center · gap 10 · 13px/500 · #d4d4d4
     H1       DM Sans 700 · clamp(44px,7vw,84px) · lh .98 · ls -.035em
              · #f8efea · text-wrap balance
     alt      max-w 520 · 18px · lh 1.6 · #a3a3a3 · text-wrap pretty
     butonlar flex-wrap · gap 12 · Astryx Button (bağlantı)
       birincil primary · h48 · px22 · gap10 · 15px/600
       ikincil  h48 · px22 · gap10 · 1px #333333 · 15px/500 · #fafafa
     sağ      flex · justify-center → img w-full max-w-500 h-auto

   Astryx: Heading (h1), Text (alt metin, meta), VStack/HStack, Button.
   İki sütunlu ızgara Tailwind'de kaldı: Astryx Grid `minmax(420px,…)`
   telefonda taşar, `max` sınırlı biçimi de 48px aralıkla tek sütuna düşer.
   ────────────────────────────────────────────────────────────────────────── */

export function Hero({
  heroTitle,
  heroSub,
  phone,
  waLink,
  telLink,
  saatler,
  siparisAcik = false,
}: {
  heroTitle: string;
  heroSub: string;
  phone: string;
  waLink: string;
  telLink: string;
  saatler: Saat[];
  siparisAcik?: boolean;
}) {
  return (
    <section
      id="top"
      className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-48 px-24 pt-72 pb-96"
    >
      <VStack className="gap-28">
        <HStack align="center" className="gap-10 text-13 font-medium text-soft">
          <Suspense fallback={<AcikKapaliIskelet />}>
            <AcikKapali saatler={saatler} />
          </Suspense>
          <Text color="inherit" type="inherit" className="text-dot">·</Text>
          <Text color="inherit" type="inherit">Gaziemir, İzmir</Text>
        </HStack>

        <Heading level={1} textWrap="balance" className="font-display text-h1 leading-h1 font-bold tracking-h1 text-cream">
          {heroTitle}
        </Heading>

        <Text as="p" color="secondary" textWrap="pretty" className="max-w-[520px] text-18 leading-16">
          {heroSub}
        </Text>

        <HStack wrap="wrap" gap={3}>
          {siparisAcik && (
            <Button
              variant="primary"
              size="lg"
              label="Online sipariş ver"
              href="#urunler"
              icon={<SepetIkonu size={18} />}
              className={CTA}
            />
          )}
          {/* Apostrof U+2019 — tasarımdaki karakterin aynısı */}
          <Button
            variant={siparisAcik ? "secondary" : "primary"}
            size="lg"
            label={siparisAcik ? "WhatsApp’tan yaz" : "WhatsApp’tan sipariş ver"}
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            icon={<MesajIkonu size={18} />}
            className={siparisAcik ? CTA_IKINCIL : CTA}
          />
          <Button
            size="lg"
            label={phone}
            href={telLink}
            icon={<TelefonIkonu size={18} />}
            className={CTA_IKINCIL}
          />
        </HStack>
      </VStack>

      {/* Telefonda büyük logo gizli: başlıkta zaten var, ürünler bir ekran yukarı gelir. */}
      <div className="hidden justify-center md:flex">
        <Logo
          genislik={1420}
          yukseklik={1350}
          alt="Sarnıç Kasap logosu"
          className="block h-auto w-full max-w-[500px]"
        />
      </div>
    </section>
  );
}
