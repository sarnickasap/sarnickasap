import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { oturumAl } from "@/lib/session";
import { GirisFormu } from "./giris-formu";

/* Oturum çerezi okunduğu için statik kabuğa prerender edilemez.
   Next 16 Cache Components altında belgelenen çözüm: rotayı bloklayan
   (sunucuda bekleyen) moda al. Bkz. instant-navigation.md → "Opting out". */
export const instant = false;

export const metadata: Metadata = {
  title: "Giriş — Sarnıç Kasap Yönetim",
  robots: { index: false, follow: false },
};

/* ──────────────────────────────────────────────────────────────────────────
   Giriş sayfası — TASARIMDA YOK (onaylı sapma #2, karar K-06).

   Görsel dil tamamen admin panelinden türetildi; yeni renk/ölçü icat
   edilmedi. Kullanılan tokenlar:
     zemin #fafafa · kart #ffffff + 1px #e5e5e5 + r12
     H1    DM Sans 28px/700/-0.02em   (admin sayfa başlığıyla aynı)
     alt   14px #737373
     label 13px/500 · input h38 px10 r8 · buton h38 #0a0a0a → hover #262626
   ────────────────────────────────────────────────────────────────────────── */

export default async function GirisSayfasi() {
  // Zaten girişliyse panele gönder (oturumAl() connection() içeriyor)
  const session = await oturumAl();
  if (session?.user) redirect("/yonetim");

  return (
    <main className="tema-admin flex min-h-screen items-center justify-center bg-admin-bg px-20 py-64">
      <div className="flex w-full max-w-[380px] flex-col gap-24">
        {/* Marka bloğu — admin header'daki düzenin açık tema karşılığı */}
        <div className="flex items-center gap-14">
          <Image
            src="/logo.png"
            alt="Sarnıç Kasap"
            width={40}
            height={38}
            className="h-38 w-40 object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="font-display text-16 font-bold text-black">
              Sarnıç Kasap
            </span>
            <span className="text-12 text-admin-muted">Yönetim paneli</span>
          </div>
        </div>

        <div className="flex flex-col gap-16 rounded-12 border border-admin-border bg-admin-card p-20">
          <div className="flex flex-col gap-4">
            <h1 className="m-0 font-display text-28 font-bold tracking-admin-h1 text-black">
              Giriş
            </h1>
            <p className="m-0 text-14 text-admin-muted">
              Paneli kullanmak için hesabınızla giriş yapın.
            </p>
          </div>

          <GirisFormu />
        </div>
      </div>
    </main>
  );
}
