import { Suspense } from "react";
import { KonumIkonu, MesajIkonu, TelefonIkonu } from "@/components/icons";
import type { Saat } from "@/lib/saatler";
import {
  CalismaSaatleri,
  CalismaSaatleriIskelet,
} from "./calisma-saatleri";
import { Harita } from "./harita";
import { haritaSorgusu } from "@/lib/format";

/* ──────────────────────────────────────────────────────────────────────────
   İletişim — vault "Iletisim Bolumu" notundan birebir.

     section  1px #1f1f1f ÜST kenarlık (zemin #0a0a0a devralınır)
     iç       max-w 1280 · mx-auto · p 112px 24px
              grid auto-fit minmax(min(100%,400px),1fr) · gap48
              ⚠️ align-items YOK → kolonlar stretch (harita sol kolon boyunca uzar)
     sol      flex-col · gap32
       başlık gap12 → eyebrow #e0464e + h2 "Bize ulaşın"
       liste  flex-col · gap16 · satırlar gap14 · ikon #e0464e flex-none
         adres    items-start + ikon mt-2 · 16px lh1.5 #e5e5e5
         telefon  items-center · 16px #e5e5e5 → hover beyaz
         whatsapp items-center · "WhatsApp: {telefon}"
     sağ      min-h 420 · r12 · overflow-hidden · 1px #1f1f1f · bg #171717

   Harita (K-16): tasarımda sorgu SABİTTİ, admin'den adres değişse bile
   harita değişmiyordu. Artık adresten türetiliyor — İŞLETME ADI ÖNE
   EKLENEREK (bkz. lib/format.ts → haritaSorgusu). Yalnız adresle
   sorgulanınca Google dükkânı bulamıyor ve yanlış bölge gösteriyordu.
   ────────────────────────────────────────────────────────────────────────── */

export function Iletisim({
  address,
  phone,
  telLink,
  waLink,
  saatler,
}: {
  address: string;
  phone: string;
  telLink: string;
  waLink: string;
  saatler: Saat[];
}) {
  const haritaSrc = haritaSorgusu(address);

  return (
    <section id="iletisim" className="border-t border-line">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] gap-48 px-24 py-112">
        <div className="flex flex-col gap-32">
          <div className="flex flex-col gap-12">
            <span className="text-12 font-semibold tracking-eyebrow uppercase text-brand-accent">
              İletişim
            </span>
            <h2 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">
              Bize ulaşın
            </h2>
          </div>

          <div className="flex flex-col gap-16">
            <div className="flex items-start gap-14">
              <KonumIkonu size={20} className="mt-2 flex-none text-brand-accent" />
              <span className="text-16 leading-15 text-read">{address}</span>
            </div>

            <div className="flex items-center gap-14">
              <TelefonIkonu size={20} className="flex-none text-brand-accent" />
              <a
                href={telLink}
                className="text-16 text-read transition-colors duration-150 ease-out-soft hover:text-white"
              >
                {phone}
              </a>
            </div>

            <div className="flex items-center gap-14">
              <MesajIkonu size={20} className="flex-none text-brand-accent" />
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-16 text-read transition-colors duration-150 ease-out-soft hover:text-white"
              >
                WhatsApp: {phone}
              </a>
            </div>
          </div>

          <Suspense fallback={<CalismaSaatleriIskelet saatler={saatler} />}>
            <CalismaSaatleri saatler={saatler} />
          </Suspense>
        </div>

        <Harita src={haritaSrc} />
      </div>
    </section>
  );
}
