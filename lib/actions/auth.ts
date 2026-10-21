"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type GirisDurumu = { hata?: string; basarili?: boolean };

export async function girisYap(
  _prev: GirisDurumu,
  formData: FormData,
): Promise<GirisDurumu> {
  try {
    /* `redirect: false`: yönlendirmeyi sunucuya BIRAKMIYORUZ.
       Sunucu yönlendirmesi yumuşak (client-side) geçiş yapıyor ve giriş
       sayfası DOM'da kalıyordu — görünmez ama ikinci bir <main> landmark'ı
       ve gizli bir şifre alanı bırakıyordu (ölçüldü: yenilemeye kadar
       2 adet <main>). İstemci tam sayfa yükleme yapıyor; oturum açılışında
       bunun maliyeti önemsiz, DOM ise temiz kalıyor. */
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    return { basarili: true };
  } catch (error) {
    if (error instanceof AuthError) {
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
