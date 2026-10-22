"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import {
  basarisizDenemeKaydet,
  denemeleriTemizle,
  girisSiniriKontrol,
} from "@/lib/hiz-siniri";

export type GirisDurumu = { hata?: string; basarili?: boolean };

/** Vercel arkasında gerçek istemci IP'si x-forwarded-for'un İLK girdisidir. */
async function istemciIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "bilinmiyor";
}

export async function girisYap(
  _prev: GirisDurumu,
  formData: FormData,
): Promise<GirisDurumu> {
  const eposta = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const ip = await istemciIp();

  /* Kaba kuvvet koruması (K-32). Mesaj bilerek e-postanın kayıtlı olup
     olmadığını ele vermiyor — yalnızca "çok fazla deneme" diyor. */
  const sinir = await girisSiniriKontrol(eposta, ip);
  if (sinir.engelli) {
    return {
      hata: `Çok fazla başarısız deneme. ${sinir.kalanDk} dakika sonra tekrar deneyin.`,
    };
  }

  try {
    /* `redirect: false`: yönlendirmeyi sunucuya BIRAKMIYORUZ.
       Sunucu yönlendirmesi yumuşak (client-side) geçiş yapıyor ve giriş
       sayfası DOM'da kalıyordu — görünmez ama ikinci bir <main> landmark'ı
       ve gizli bir şifre alanı bırakıyordu. İstemci tam sayfa yükleme
       yapıyor; oturum açılışında bunun maliyeti önemsiz. */
    await signIn("credentials", {
      email: eposta,
      password: formData.get("password"),
      redirect: false,
    });
    await denemeleriTemizle(eposta);
    return { basarili: true };
  } catch (error) {
    if (error instanceof AuthError) {
      await basarisizDenemeKaydet(eposta, ip);
      return error.type === "CredentialsSignin"
        ? { hata: "E-posta veya şifre hatalı." }
        : { hata: "Giriş yapılamadı. Lütfen tekrar deneyin." };
    }
    throw error;
  }
}

export async function cikisYap() {
  await signOut({ redirectTo: "/yonetim/giris" });
}
