import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { TopNav, TopNavHeading } from "@astryxdesign/core/TopNav";
import { Logo } from "@/components/logo";

/* ──────────────────────────────────────────────────────────────────────────
   Admin Header — Astryx TopNav, açık tema yüzeyi (sticky DEĞİL).
     heading     logo 40×38 (tıklanabilir değil) · "Sarnıç Kasap" + "Yönetim paneli"
     endContent  kayıt durumu (aria-live) · "Siteyi aç" yeni sekmede
   Dıştaki <header> e2e sözleşmesi: durum metni testlerde `header`
   innerText'inden okunuyor.
   ────────────────────────────────────────────────────────────────────────── */

export function AdminHeader({ durumMetni }: { durumMetni: string }) {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background-surface)]">
      <TopNav
        label="Yönetim paneli"
        className="mx-auto max-w-[1280px] px-20 py-10"
        heading={
          <TopNavHeading
            logo={
              <Logo
                genislik={40}
                yukseklik={38}
                alt=""
                className="h-38 w-40 object-contain"
              />
            }
            heading="Sarnıç Kasap"
            subheading="Yönetim paneli"
          />
        }
        endContent={
          <HStack gap={3} vAlign="center" wrap="wrap">
            <HStack gap={1.5} vAlign="center">
              <StatusDot variant="success" label="Otomatik kayıt" />
              <Text type="supporting" aria-live="polite">
                {durumMetni}
              </Text>
            </HStack>
            <Button
              label="Siteyi aç"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              endContent={<Icon icon="externalLink" />}
            />
          </HStack>
        }
      />
    </header>
  );
}
