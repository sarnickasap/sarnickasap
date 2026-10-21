"use client";

import { useState } from "react";
import { GIRDI, Kart, SayfaBasligi } from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { bilgiGuncelle, saatGuncelle } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   İletişim & saatler — vault "Iletisim Formu" + "Saat Satiri" notlarından.

     bilgi kartı  bg #fff · 1px #e5e5e5 · r12 · p20
                  grid auto-fit minmax(min(100%,240px),1fr) · gap14
       Telefon / WhatsApp  → otomatik sütun
       Adres / Giriş başlığı → grid-column 1/-1
       Giriş alt metni → textarea rows=2, tam genişlik
       Hakkımızda      → textarea rows=4, tam genişlik
     label  flex-col gap6 · 13px/500 · alan içinde font-weight 400

     saat kartı   bg #fff · 1px #e5e5e5 · r12 · overflow-hidden
       başlık  p 14px 16px · alt kenarlık 1px #e5e5e5 · 14px/600
       satır   p 10px 16px · alt kenarlık 1px #f5f5f5 · flex-wrap gap10
         gün     1 1 110px · 14px/500
         açılış  type=time · 0 0 110px · h36 px8 · 14px
         ayraç   "–" #a3a3a3   (en dash)
         kapanış aynı
         kapalı  checkbox 16×16 accent #0a0a0a + label 13px #525252
   ────────────────────────────────────────────────────────────────────────── */

export type AdminBilgi = {
  phone: string;
  whatsapp: string;
  address: string;
  heroTitle: string;
  heroSub: string;
  about: string;
};

export type AdminSaat = {
  dayIndex: number;
  day: string;
  open: string;
  close: string;
  closed: boolean;
};

const LABEL = "flex flex-col gap-6 text-13 font-medium text-black";
const TEXTAREA =
  "resize-y rounded-8 border border-admin-border bg-admin-card px-10 py-8 text-14 font-normal leading-15 text-form min-w-0";

export function IletisimSekmesi({
  bilgi,
  saatler,
  onDegisti,
}: {
  bilgi: AdminBilgi;
  saatler: AdminSaat[];
  onDegisti: () => void;
}) {
  const [b, setB] = useState(bilgi);
  const [s, setS] = useState(saatler);
  const gecikmeli = useGecikmeliKayit();

  function yazBilgi(alan: Partial<AdminBilgi>) {
    setB((x) => ({ ...x, ...alan }));
    gecikmeli(`bilgi-${Object.keys(alan)[0]}`, () =>
      bilgiGuncelle(alan).then(onDegisti),
    );
  }

  function yazSaat(dayIndex: number, alan: Partial<AdminSaat>, hemen = false) {
    setS((l) => l.map((x) => (x.dayIndex === dayIndex ? { ...x, ...alan } : x)));
    const calistir = () => saatGuncelle({ dayIndex, ...alan }).then(onDegisti);
    if (hemen) void calistir();
    else gecikmeli(`saat-${dayIndex}-${Object.keys(alan)[0]}`, calistir);
  }

  return (
    <>
      <SayfaBasligi
        baslik="İletişim ve çalışma saatleri"
        altMetin="Sitedeki iletişim bilgileri, giriş metni ve hakkımızda yazısı."
      />

      <Kart className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-14 p-20">
        <label className={LABEL}>
          Telefon
          <input
            value={b.phone}
            onChange={(e) => yazBilgi({ phone: e.target.value })}
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          />
        </label>

        <label className={LABEL}>
          WhatsApp numarası (90 ile)
          <input
            value={b.whatsapp}
            onChange={(e) => yazBilgi({ whatsapp: e.target.value })}
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          />
        </label>

        <label className={`${LABEL} col-[1/-1]`}>
          Adres
          <input
            value={b.address}
            onChange={(e) => yazBilgi({ address: e.target.value })}
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          />
        </label>

        <label className={`${LABEL} col-[1/-1]`}>
          Giriş başlığı
          <input
            value={b.heroTitle}
            onChange={(e) => yazBilgi({ heroTitle: e.target.value })}
            className={`${GIRDI} h-38 px-10 text-14 font-normal text-form`}
          />
        </label>

        <label className={`${LABEL} col-[1/-1]`}>
          Giriş alt metni
          <textarea
            value={b.heroSub}
            onChange={(e) => yazBilgi({ heroSub: e.target.value })}
            rows={2}
            className={TEXTAREA}
          />
        </label>

        <label className={`${LABEL} col-[1/-1]`}>
          Hakkımızda
          <textarea
            value={b.about}
            onChange={(e) => yazBilgi({ about: e.target.value })}
            rows={4}
            className={TEXTAREA}
          />
        </label>
      </Kart>

      <Kart className="overflow-hidden">
        <div className="border-b border-admin-border px-16 py-14 text-14 font-semibold">
          Çalışma saatleri
        </div>
        {s.map((h) => (
          <div
            key={h.dayIndex}
            className="flex flex-wrap items-center gap-10 border-b border-admin-hair px-16 py-10"
          >
            <span className="flex-[1_1_110px] text-14 font-medium">{h.day}</span>

            <input
              type="time"
              value={h.open}
              disabled={h.closed}
              onChange={(e) => yazSaat(h.dayIndex, { open: e.target.value })}
              aria-label={`${h.day} açılış saati`}
              className="h-36 flex-[0_0_110px] rounded-8 border border-admin-border bg-admin-card px-8 text-14 text-form disabled:opacity-50"
            />

            <span className="text-faint-light" aria-hidden>
              –
            </span>

            <input
              type="time"
              value={h.close}
              disabled={h.closed}
              onChange={(e) => yazSaat(h.dayIndex, { close: e.target.value })}
              aria-label={`${h.day} kapanış saati`}
              className="h-36 flex-[0_0_110px] rounded-8 border border-admin-border bg-admin-card px-8 text-14 text-form disabled:opacity-50"
            />

            <label className="flex cursor-pointer items-center gap-6 text-13 text-admin-2nd">
              <input
                type="checkbox"
                checked={h.closed}
                onChange={(e) =>
                  yazSaat(h.dayIndex, { closed: e.target.checked }, true)
                }
                className="h-16 w-16 accent-black"
              />
              Kapalı
            </label>
          </div>
        ))}
      </Kart>
    </>
  );
}
