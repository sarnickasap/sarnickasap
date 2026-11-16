import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { TopNav, TopNavItem } from "@astryxdesign/core/TopNav";
import { MesajIkonu } from "@/components/icons";
import { Logo } from "@/components/logo";
import { gorunurNavBaglantilari } from "./nav-baglantilari";
import { MobilMenu } from "./mobil-menu";
import { SepetDugmesi } from "./sepet-dugmesi";
import { CTA_ORTA } from "./siparis-stilleri";

/* ──────────────────────────────────────────────────────────────────────────
   Site Header — vault "Site Header" notundan birebir.

   Tasarım (masaüstü) aynen korundu:
     header  sticky top-0 z-20 · rgba(10,10,10,0.88) · blur(10px)
             border-bottom 1px #1f1f1f
     iç      max-w 1280 · mx-auto · padding 10px 24px · flex · gap 24
     logo    48×46 · object-contain · flex-none
     nav     flex · gap 4 · flex-1 · min-w-0 · overflow-x-auto · scrollbar yok
     link    padding 8px 12px · r8 · 14px/500 · #a3a3a3
             hover → bg #171717, color #fafafa
     CTA     Astryx Button primary · h40 · px16 · gap8 · 14px/600

   Astryx: nav = TopNav (yalnız bağlantılar — logo ve CTA nav DIŞINDA kalır,
   `header nav a` yalnızca bölüm bağlantılarını saymalı), bağlantılar
   TopNavItem, logo bağlantısı Link, satır HStack. Ölçüler className ile.

   SAPMA (onaylı #1, K-18): 768px altında nav gizlenir, hamburger açılır.
   Breakpoint uydurulmadı, ÖLÇÜLDÜ: tasarımın nav'ı 493px yer kaplıyor,
   768px'te kullanılabilir alan 496px — yani tasarımın kendi navigasyonu
   tam burada sığmaz oluyor. 768px ve üstü tasarımla birebir aynı.

   Sepet (K-37): yalnızca online sipariş açıkken. Sepet düğmesi ve CTA tek
   bir gap-8 grubunda — başlığın gap-24'ü iki kez eklenirse 390px'te satır
   taşıyordu. Sipariş kapalıyken düzen öncekiyle birebir aynı.
   ────────────────────────────────────────────────────────────────────────── */

const NAV_LINK =
  "h-auto rounded-8 px-12 py-8 text-14 font-medium whitespace-nowrap text-muted " +
  "transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-body";

export function SiteHeader({
  waLink,
  firsatVar,
  yorumVar,
  galeriVar,
  sepetVar = false,
}: {
  waLink: string;
  firsatVar: boolean;
  yorumVar: boolean;
  galeriVar: boolean;
  sepetVar?: boolean;
}) {
  const baglantilar = gorunurNavBaglantilari({ firsatVar, yorumVar, galeriVar });

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-[rgba(10,10,10,0.88)] backdrop-blur-[10px]">
      <HStack align="center" gap={6} className="mx-auto max-w-[1280px] px-24 py-10">
        <Link href="#top" label="Sayfa başına dön" color="inherit" className="flex flex-none items-center">
          <Logo
            genislik={48}
            yukseklik={46}
            alt="Sarnıç Kasap"
            className="block h-46 w-48 object-contain"
          />
        </Link>

        {/* Masaüstü navigasyonu — 768px ve üstünde tasarımla birebir */}
        <TopNav
          label="Ana menü"
          className="no-scrollbar hidden w-auto min-w-0 flex-1 overflow-x-auto md:flex"
          startContent={baglantilar.map((l) => (
            <TopNavItem key={l.href} href={l.href} label={l.label} className={NAV_LINK} />
          ))}
        />

        {/* Mobilde nav'ın yerini tutar, CTA'yı sağa iter */}
        <div className="flex-1 md:hidden" />

        {sepetVar ? (
          <HStack align="center" gap={2} className="flex-none">
            <SepetDugmesi />
            <SiparisCta href="#urunler" />
          </HStack>
        ) : (
          <SiparisCta href={waLink} disari />
        )}

        <MobilMenu baglantilar={baglantilar} />
      </HStack>
    </header>
  );
}

/** Online sipariş açıkken ürünlere iner; kapalıyken WhatsApp'ı açar. */
function SiparisCta({ href, disari = false }: { href: string; disari?: boolean }) {
  return (
    <Button
      variant="primary"
      size="lg"
      label="Sipariş ver"
      href={href}
      icon={disari ? <MesajIkonu size={16} /> : undefined}
      {...(disari ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`flex-none ${CTA_ORTA}`}
    />
  );
}
