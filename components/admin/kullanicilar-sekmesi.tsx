"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { GIRDI, Kart, SayfaBasligi, SilButonu } from "./ui";
import {
  kullaniciEkle,
  kullaniciSil,
  sifremiDegistir,
  type KullaniciSonuc,
} from "@/lib/actions/kullanicilar";

/* ──────────────────────────────────────────────────────────────────────────
   Kullanıcılar sekmesi — TASARIMDA YOK (onaylı sapma #3, K-06/K-19).

   Görsel dil tamamen admin panelinden; yeni token/ölçü icat edilmedi:
     kart   bg #fff · 1px #e5e5e5 · r12 · p20
     label  flex-col gap6 · 13px/500
     alan   h38 · px10 · r8 · 1px #e5e5e5 · 14px
     buton  siyah h38 px14 r8 14px/500 (tasarımın "Yeni ürün" butonu gibi)
     satır  p 12px 14px · alt kenarlık 1px #f0f0f0 (ürün satırı gibi)
     hata   #dc2626 / #fef2f2 · başarı #15803d / #f0fdf4 (toggle renkleri)
   ────────────────────────────────────────────────────────────────────────── */

const LABEL = "flex flex-col gap-6 text-13 font-medium text-black";
const ALAN = `${GIRDI} h-38 px-10 text-14 font-normal text-form`;

export type AdminKullanici = {
  id: number;
  email: string;
  name: string;
  createdAt: Date | string;
};

function Mesaj({ sonuc }: { sonuc: KullaniciSonuc }) {
  if (!sonuc.hata && !sonuc.basarili) return null;
  const hata = Boolean(sonuc.hata);
  return (
    <p
      role={hata ? "alert" : "status"}
      className={
        "m-0 rounded-8 px-10 py-8 text-13 " +
        (hata ? "bg-danger-bg text-danger" : "bg-ok-bg text-ok-text")
      }
    >
      {sonuc.hata ?? sonuc.basarili}
    </p>
  );
}

function Gonder({ etiket, bekleyen }: { etiket: string; bekleyen: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-38 flex-[0_0_auto] cursor-pointer items-center justify-center rounded-8 border-0 bg-black px-14 text-14 font-medium text-white transition-colors duration-150 ease-out-soft hover:bg-admin-ink-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? bekleyen : etiket}
    </button>
  );
}

export function KullanicilarSekmesi({
  kullanicilar,
  benimId,
}: {
  kullanicilar: AdminKullanici[];
  benimId: string;
}) {
  const [liste, setListe] = useState(kullanicilar);
  const [silSonuc, setSilSonuc] = useState<KullaniciSonuc>({});
  const [ekleSonuc, ekleAction] = useActionState<KullaniciSonuc, FormData>(
    kullaniciEkle,
    {},
  );
  const [sifreSonuc, sifreAction] = useActionState<KullaniciSonuc, FormData>(
    sifremiDegistir,
    {},
  );

  async function sil(k: AdminKullanici) {
    if (!confirm(`${k.email} hesabı silinsin mi?`)) return;
    const s = await kullaniciSil(k.id);
    setSilSonuc(s);
    if (s.basarili) setListe((l) => l.filter((x) => x.id !== k.id));
  }

  return (
    <>
      <SayfaBasligi
        baslik="Yöneticiler"
        altMetin="Panele girebilecek hesapları yönetin. Şifreler geri alınamaz biçimde saklanır."
      />

      <Kart className="overflow-hidden">
        {liste.map((k) => {
          const benim = String(k.id) === benimId;
          return (
            <div
              key={k.id}
              className="flex flex-wrap items-center gap-8 border-b border-admin-row px-14 py-12"
            >
              <div className="flex min-w-0 flex-[2_1_220px] flex-col">
                <span className="truncate text-14 font-medium">{k.email}</span>
                {k.name && (
                  <span className="truncate text-12 text-admin-muted">
                    {k.name}
                  </span>
                )}
              </div>

              <span className="flex-[1_1_140px] text-13 text-admin-muted">
                {new Date(k.createdAt).toLocaleDateString("tr-TR")} tarihinde eklendi
              </span>

              {benim ? (
                <span className="h-36 w-92 flex-none rounded-8 border border-ok-border bg-ok-bg text-center text-13 leading-34 font-medium text-ok-text">
                  Siz
                </span>
              ) : (
                <SilButonu
                  onClick={() => sil(k)}
                  etiket={`${k.email} hesabını sil`}
                />
              )}
            </div>
          );
        })}
      </Kart>

      <Mesaj sonuc={silSonuc} />

      <Kart className="flex flex-col gap-16 p-20">
        <h2 className="m-0 font-display text-20 font-semibold text-black">
          Yeni yönetici ekle
        </h2>
        <form action={ekleAction} className="flex flex-wrap items-end gap-16">
          <label className={`${LABEL} flex-[2_1_220px]`}>
            E-posta
            <input name="email" type="email" required className={ALAN} />
          </label>
          <label className={`${LABEL} flex-[1_1_160px]`}>
            Ad (isteğe bağlı)
            <input name="name" className={ALAN} />
          </label>
          <label className={`${LABEL} flex-[1_1_200px]`}>
            Şifre (en az 12 karakter)
            <input
              name="password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className={ALAN}
            />
          </label>
          <Gonder etiket="Ekle" bekleyen="Ekleniyor…" />
        </form>
        <Mesaj sonuc={ekleSonuc} />
      </Kart>

      <Kart className="flex flex-col gap-16 p-20">
        <h2 className="m-0 font-display text-20 font-semibold text-black">
          Şifremi değiştir
        </h2>
        <form action={sifreAction} className="flex flex-wrap items-end gap-16">
          <label className={`${LABEL} flex-[1_1_200px]`}>
            Mevcut şifre
            <input
              name="mevcut"
              type="password"
              required
              autoComplete="current-password"
              className={ALAN}
            />
          </label>
          <label className={`${LABEL} flex-[1_1_200px]`}>
            Yeni şifre (en az 12 karakter)
            <input
              name="yeni"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
              className={ALAN}
            />
          </label>
          <Gonder etiket="Değiştir" bekleyen="Değiştiriliyor…" />
        </form>
        <Mesaj sonuc={sifreSonuc} />
      </Kart>
    </>
  );
}
