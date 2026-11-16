"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { pixel, proportional, Table, type TableColumn } from "@astryxdesign/core/Table";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { FormAlani } from "./form-alani";
import { DurumMesaji, Kart, SayfaBasligi, SilButonu } from "./ui";
import {
  kullaniciEkle,
  kullaniciSil,
  sifremiDegistir,
  type KullaniciSonuc,
} from "@/lib/actions/kullanicilar";

/* ──────────────────────────────────────────────────────────────────────────
   Kullanıcılar sekmesi — TASARIMDA YOK (onaylı sapma #3, K-06/K-19).
     liste   Astryx Table: e-posta (+ ad) · eklenme tarihi · "Siz" rozeti ya da sil
     formlar yönetici ekle · şifremi değiştir (sunucu eylemi, FormAlani)
     sonuç   hata `role="alert"`, başarı `role="status"` (Astryx Banner)
   ────────────────────────────────────────────────────────────────────────── */

export type AdminKullanici = {
  id: number;
  email: string;
  name: string;
  createdAt: Date | string;
};

type KullaniciSatiri = AdminKullanici & Record<string, unknown>;

function sutunlar(
  benimId: string,
  sil: (k: AdminKullanici) => void,
): TableColumn<KullaniciSatiri>[] {
  return [
    {
      key: "email",
      header: "Hesap",
      width: proportional(2, { minWidth: 160 }),
      renderCell: (k) => (
        <VStack>
          <Text weight="medium" maxLines={1}>
            {k.email}
          </Text>
          {k.name && (
            <Text type="supporting" maxLines={1}>
              {k.name}
            </Text>
          )}
        </VStack>
      ),
    },
    {
      key: "createdAt",
      header: "Eklenme",
      width: proportional(1, { minWidth: 96 }),
      renderCell: (k) => (
        <Text type="supporting" hasTabularNumbers>
          {new Date(k.createdAt).toLocaleDateString("tr-TR")}
        </Text>
      ),
    },
    {
      key: "islem",
      header: "",
      width: pixel(64),
      align: "end",
      renderCell: (k) =>
        String(k.id) === benimId ? (
          <Badge variant="success" label="Siz" />
        ) : (
          <SilButonu onClick={() => sil(k)} etiket={`${k.email} hesabını sil`} />
        ),
    },
  ];
}

function Mesaj({ sonuc }: { sonuc: KullaniciSonuc }) {
  if (sonuc.hata) return <DurumMesaji tur="hata" metin={sonuc.hata} />;
  if (sonuc.basarili) return <DurumMesaji tur="basari" metin={sonuc.basarili} />;
  return null;
}

function Gonder({ etiket, bekleyen }: { etiket: string; bekleyen: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      label={etiket}
      variant="primary"
      isLoading={pending}
      className="flex-[0_0_auto]"
    >
      {pending ? bekleyen : etiket}
    </Button>
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
        <Table<KullaniciSatiri>
          data={liste as KullaniciSatiri[]}
          idKey="id"
          columns={sutunlar(benimId, sil)}
        />
      </Kart>

      <Mesaj sonuc={silSonuc} />

      <Kart className="flex flex-col gap-16 p-20">
        <Heading level={2}>Yeni yönetici ekle</Heading>
        <form action={ekleAction} className="flex flex-wrap items-end gap-16">
          <FormAlani
            label="E-posta"
            htmlName="email"
            type="email"
            required
            containerClassName="flex-[2_1_220px]"
          />
          <FormAlani
            label="Ad (isteğe bağlı)"
            htmlName="name"
            containerClassName="flex-[1_1_160px]"
          />
          <FormAlani
            label="Şifre (en az 12 karakter)"
            htmlName="password"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            containerClassName="flex-[1_1_200px]"
          />
          <Gonder etiket="Ekle" bekleyen="Ekleniyor…" />
        </form>
        <Mesaj sonuc={ekleSonuc} />
      </Kart>

      <Kart className="flex flex-col gap-16 p-20">
        <Heading level={2}>Şifremi değiştir</Heading>
        <form action={sifreAction} className="flex flex-wrap items-end gap-16">
          <FormAlani
            label="Mevcut şifre"
            htmlName="mevcut"
            type="password"
            required
            autoComplete="current-password"
            containerClassName="flex-[1_1_200px]"
          />
          <FormAlani
            label="Yeni şifre (en az 12 karakter)"
            htmlName="yeni"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            containerClassName="flex-[1_1_200px]"
          />
          <Gonder etiket="Değiştir" bekleyen="Değiştiriliyor…" />
        </form>
        <Mesaj sonuc={sifreSonuc} />
      </Kart>
    </>
  );
}
