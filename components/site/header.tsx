import Image from "next/image";
import { MesajIkonu } from "@/components/icons";
import { gorunurNavBaglantilari } from "./nav-baglantilari";
import { MobilMenu } from "./mobil-menu";

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
     CTA     h40 · px16 · gap8 · r8 · #b8222a · 14px/600 · beyaz
             hover → #9e1c23

   SAPMA (onaylı #1, K-18): 768px altında nav gizlenir, hamburger açılır.
   Breakpoint uydurulmadı, ÖLÇÜLDÜ: tasarımın nav'ı 493px yer kaplıyor,
   768px'te kullanılabilir alan 496px — yani tasarımın kendi navigasyonu
   tam burada sığmaz oluyor. 768px ve üstü tasarımla birebir aynı.
   ────────────────────────────────────────────────────────────────────────── */

const NAV_LINK =
  "rounded-8 px-12 py-8 text-14 font-medium whitespace-nowrap text-muted " +
  "transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-body";

export function SiteHeader({
  waLink,
  firsatVar,
}: {
  waLink: string;
  firsatVar: boolean;
}) {
  const baglantilar = gorunurNavBaglantilari(firsatVar);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-[rgba(10,10,10,0.88)] backdrop-blur-[10px]">
      <div className="mx-auto flex max-w-[1280px] items-center gap-24 px-24 py-10">
        <a href="#top" className="flex flex-none items-center" aria-label="Sayfa başına dön">
          <Image
            src="/logo.png"
            alt="Sarnıç Kasap"
            width={48}
            height={46}
            priority
            /* unoptimized: tasarım ham PNG'yi tarayıcıda ölçeklendiriyor.
               next/image yeniden kodlayınca logo görünür biçimde yumuşuyordu
               (ölçüldü: 938 piksel sapma, max 70). Aynı baytları sunmak
               piksel eşitliğinin tek yolu. */
            unoptimized
            className="block h-46 w-48 object-contain"
          />
        </a>

        {/* Masaüstü navigasyonu — 768px ve üstünde tasarımla birebir */}
        <nav
          aria-label="Ana menü"
          className="no-scrollbar hidden min-w-0 flex-1 gap-4 overflow-x-auto md:flex"
        >
          {baglantilar.map((l) => (
            <a key={l.href} href={l.href} className={NAV_LINK}>
              {l.label}
            </a>
          ))}
        </nav>

        {/* Mobilde nav'ın yerini tutar, CTA'yı sağa iter */}
        <div className="flex-1 md:hidden" />

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-40 flex-none items-center gap-8 rounded-8 bg-brand px-16 text-14 font-semibold whitespace-nowrap text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover"
        >
          <MesajIkonu size={16} />
          Sipariş ver
        </a>

        <MobilMenu baglantilar={baglantilar} />
      </div>
    </header>
  );
}
