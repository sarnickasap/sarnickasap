"use client";

import { useState } from "react";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Text } from "@astryxdesign/core/Text";
import {
  ALAN,
  COK_SATIRLI_ALAN,
  ETIKET,
  Kart,
  SATIR_AYRACI,
  SayfaBasligi,
} from "./ui";
import { useGecikmeliKayit } from "@/lib/kaydet";
import { bilgiGuncelle, saatGuncelle } from "@/lib/actions/admin";

/* ──────────────────────────────────────────────────────────────────────────
   İletişim & saatler.
     bilgi kartı  telefon · WhatsApp · adres · giriş başlığı/alt metni ·
                  hakkımızda. Alanlar YEREL ve <label> içinde: e2e testi
                  `main label` → `input, textarea` ile buluyor.
     saat kartı   gün · açılış – kapanış (yerel type=time, her değişimde
                  kayıt) · "Kapalı" (Astryx CheckboxInput)
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

const GIRDI = `${ALAN} font-normal`;
const TEXTAREA = `${COK_SATIRLI_ALAN} font-normal`;
const SAAT = `${ALAN} flex-[0_0_110px]`;

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
    // `hemen` yolu da aynı sarmalıdan geçmeli — yoksa hatası yutulur
    if (hemen) gecikmeli(`saat-${dayIndex}-${Object.keys(alan)[0]}`, calistir, true);
    else gecikmeli(`saat-${dayIndex}-${Object.keys(alan)[0]}`, calistir);
  }

  return (
    <>
      <SayfaBasligi
        baslik="İletişim ve çalışma saatleri"
        altMetin="Sitedeki iletişim bilgileri, giriş metni ve hakkımızda yazısı."
      />

      <Kart className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-14 p-20">
        <label className={ETIKET}>
          Telefon
          <input
            value={b.phone}
            onChange={(e) => yazBilgi({ phone: e.target.value })}
            className={GIRDI}
          />
        </label>

        <label className={ETIKET}>
          WhatsApp numarası (90 ile)
          <input
            value={b.whatsapp}
            onChange={(e) => yazBilgi({ whatsapp: e.target.value })}
            className={GIRDI}
          />
        </label>

        <label className={`${ETIKET} col-[1/-1]`}>
          Adres
          <input
            value={b.address}
            onChange={(e) => yazBilgi({ address: e.target.value })}
            className={GIRDI}
          />
        </label>

        <label className={`${ETIKET} col-[1/-1]`}>
          Giriş başlığı
          <input
            value={b.heroTitle}
            onChange={(e) => yazBilgi({ heroTitle: e.target.value })}
            className={GIRDI}
          />
        </label>

        <label className={`${ETIKET} col-[1/-1]`}>
          Giriş alt metni
          <textarea
            value={b.heroSub}
            onChange={(e) => yazBilgi({ heroSub: e.target.value })}
            rows={2}
            className={TEXTAREA}
          />
        </label>

        <label className={`${ETIKET} col-[1/-1]`}>
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
        <div className={`px-16 py-14 ${SATIR_AYRACI}`}>
          <Text weight="semibold">Çalışma saatleri</Text>
        </div>
        {s.map((h) => (
          <div
            key={h.dayIndex}
            className={`flex flex-wrap items-center gap-10 px-16 py-10 ${SATIR_AYRACI}`}
          >
            <Text weight="medium" className="flex-[1_1_110px]">
              {h.day}
            </Text>

            <input
              type="time"
              value={h.open}
              disabled={h.closed}
              onChange={(e) => yazSaat(h.dayIndex, { open: e.target.value })}
              aria-label={`${h.day} açılış saati`}
              className={SAAT}
            />

            <span className="text-[var(--color-text-secondary)]" aria-hidden>
              –
            </span>

            <input
              type="time"
              value={h.close}
              disabled={h.closed}
              onChange={(e) => yazSaat(h.dayIndex, { close: e.target.value })}
              aria-label={`${h.day} kapanış saati`}
              className={SAAT}
            />

            <CheckboxInput
              label="Kapalı"
              value={h.closed}
              onChange={(kapali) => yazSaat(h.dayIndex, { closed: kapali }, true)}
            />
          </div>
        ))}
      </Kart>
    </>
  );
}
