import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Text } from "@astryxdesign/core/Text";
import { Logo } from "@/components/logo";

/* ──────────────────────────────────────────────────────────────────────────
   Admin Header — Astryx açık tema yüzeyi (sticky DEĞİL).
     logo 40×38 (tıklanabilir değil) · "Sarnıç Kasap" + "Yönetim paneli"
     kayıt durumu (aria-live) · "Siteyi aç" yeni sekmede
   Durum metni e2e testlerinde `header` innerText'inden okunuyor.
   ────────────────────────────────────────────────────────────────────────── */

export function AdminHeader({ durumMetni }: { durumMetni: string }) {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background-surface)]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-14 px-20 py-10">
        <Logo
          genislik={40}
          yukseklik={38}
          alt="Sarnıç Kasap"
          className="h-38 w-40 object-contain"
        />

        <div className="flex min-w-140 flex-1 flex-col">
          <Text weight="bold" className="font-display">
            Sarnıç Kasap
          </Text>
          <Text type="supporting">Yönetim paneli</Text>
        </div>

        <span className="flex items-center gap-6">
          <StatusDot variant="success" label="Otomatik kayıt" />
          <Text type="supporting" aria-live="polite">
            {durumMetni}
          </Text>
        </span>

        <Button
          label="Siteyi aç"
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          endContent={<Icon icon="externalLink" />}
        />
      </div>
    </header>
  );
}
