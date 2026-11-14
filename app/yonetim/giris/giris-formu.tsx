"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@astryxdesign/core/Button";
import { DurumMesaji } from "@/components/admin/ui";
import { FormAlani } from "@/components/admin/form-alani";
import { girisYap, type GirisDurumu } from "@/lib/actions/auth";

const HATA_ID = "giris-hata";

function Gonder() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" label="Giriş yap" variant="primary" isLoading={pending} width="100%">
      {pending ? "Giriş yapılıyor…" : "Giriş yap"}
    </Button>
  );
}

export function GirisFormu() {
  const [durum, action] = useActionState<GirisDurumu, FormData>(girisYap, {});

  /* Tam sayfa yükleme — bilerek `router.push` DEĞİL.
     Yumuşak geçişte giriş sayfası DOM'da kalıyordu: görünmez ama ikinci bir
     <main> landmark'ı ve gizli bir şifre alanı bırakıyordu (ölçüldü:
     yenilemeye kadar 2 adet <main>). Oturum açılışında tam yüklemenin
     maliyeti önemsiz. */
  useEffect(() => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (durum.basarili) window.location.href = "/yonetim";
  }, [durum.basarili]);

  return (
    <form action={action} className="flex flex-col gap-14">
      <FormAlani
        label="E-posta"
        htmlName="email"
        type="email"
        required
        autoComplete="username"
        hasAutoFocus
        aria-describedby={durum.hata ? HATA_ID : undefined}
      />

      <FormAlani
        label="Şifre"
        htmlName="password"
        type="password"
        required
        autoComplete="current-password"
        aria-describedby={durum.hata ? HATA_ID : undefined}
      />

      {/* role="alert" ile ekran okuyucuya anında bildirilir. */}
      {durum.hata && <DurumMesaji tur="hata" metin={durum.hata} id={HATA_ID} />}

      <Gonder />
    </form>
  );
}
