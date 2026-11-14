import type { Metadata } from "next";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Logo } from "@/components/logo";
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
   Astryx açık tema: gövde zemini + Card içinde başlık ve form.
   ────────────────────────────────────────────────────────────────────────── */

export default async function GirisSayfasi() {
  // Zaten girişliyse panele gönder (oturumAl() connection() içeriyor)
  const session = await oturumAl();
  if (session?.user) redirect("/yonetim");

  return (
    <main className="tema-admin flex min-h-screen items-center justify-center bg-[var(--color-background-body)] px-20 py-64">
      <div className="flex w-full max-w-[380px] flex-col gap-24">
        {/* Marka bloğu — admin header'daki düzenin açık tema karşılığı */}
        <div className="flex items-center gap-14">
          <Logo
            genislik={40}
            yukseklik={38}
            alt="Sarnıç Kasap"
            className="h-38 w-40 object-contain"
          />
          <div className="flex flex-col">
            <Text weight="bold" className="font-display">
              Sarnıç Kasap
            </Text>
            <Text type="supporting">Yönetim paneli</Text>
          </div>
        </div>

        <Card className="flex flex-col gap-16">
          <div className="flex flex-col gap-4">
            <Heading level={1}>Giriş</Heading>
            <Text type="supporting" as="p">
              Paneli kullanmak için hesabınızla giriş yapın.
            </Text>
          </div>

          <GirisFormu />
        </Card>
      </div>
    </main>
  );
}
