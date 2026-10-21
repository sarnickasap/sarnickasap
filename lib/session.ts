import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/* ──────────────────────────────────────────────────────────────────────────
   Oturum okuma yardımcıları.

   Neden `connection()`?
   Auth.js, CSRF jetonu üretirken `crypto.getRandomValues()` çağırıyor. Next 16
   Cache Components altında bu "kararsız değer" prerender'ı bozuyor
   (blocking-prerender-crypto). `connection()` rotayı istek zamanına taşıyarak
   sorunu kaynağında çözer.

   Oturuma dokunan HER sunucu bileşeni bu yardımcıları kullanmalı —
   `auth()` doğrudan çağrılmamalı.
   ────────────────────────────────────────────────────────────────────────── */

export async function oturumAl() {
  await connection();
  return auth();
}

/** Girişli kullanıcıyı döndürür; yoksa giriş sayfasına yönlendirir. */
export async function oturumZorunlu() {
  const session = await oturumAl();
  if (!session?.user) redirect("/yonetim/giris");
  return session.user;
}
