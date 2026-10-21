"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { girisYap, type GirisDurumu } from "@/lib/actions/auth";

/* Admin form elemanı stilleri — vault "Admin Form Elemanlari" notundan birebir:
   h38 · padding 0 10px · 1px #e5e5e5 · r8 · beyaz · 14px/400 */
const INPUT =
  "h-38 rounded-8 border border-admin-border bg-admin-card px-10 text-14 font-normal text-form";

function Gonder() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-38 items-center justify-center rounded-8 bg-black px-14 text-14 font-medium text-white transition-colors duration-150 hover:bg-admin-ink-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Giriş yapılıyor…" : "Giriş yap"}
    </button>
  );
}

export function GirisFormu() {
  const [durum, action] = useActionState<GirisDurumu, FormData>(girisYap, {});

  return (
    <form action={action} className="flex flex-col gap-14">
      <label className="flex flex-col gap-6 text-13 font-medium text-black">
        E-posta
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          autoFocus
          aria-describedby={durum.hata ? "giris-hata" : undefined}
          className={INPUT}
        />
      </label>

      <label className="flex flex-col gap-6 text-13 font-medium text-black">
        Şifre
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          aria-describedby={durum.hata ? "giris-hata" : undefined}
          className={INPUT}
        />
      </label>

      {/* Hata — admin'in tehlike tokenları (#dc2626 / #fef2f2).
          role="alert" ile ekran okuyucuya anında bildirilir. */}
      {durum.hata && (
        <p
          id="giris-hata"
          role="alert"
          className="m-0 rounded-8 bg-danger-bg px-10 py-8 text-13 text-danger"
        >
          {durum.hata}
        </p>
      )}

      <Gonder />
    </form>
  );
}
