"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type GirisDurumu = { hata?: string };

export async function girisYap(
  _prev: GirisDurumu,
  formData: FormData,
): Promise<GirisDurumu> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/yonetim",
    });
    return {};
  } catch (error) {
    /* signIn başarılı olduğunda Next.js bir yönlendirme hatası fırlatır —
       bu YUTULMAMALI, yoksa yönlendirme gerçekleşmez. */
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
