"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InternationalizationProvider } from "@astryxdesign/core/i18n";
import { LinkProvider } from "@astryxdesign/core/Link";
import trTR from "@astryxdesign/core/locales/tr-TR.generated.js";
import { Theme } from "@astryxdesign/core/theme";
import { sarnicTheme } from "@/themes/sarnic/sarnic";

/* Astryx teması + Türkçe bileşen metinleri — tek kök Theme (portallar ve <html> modu doğru olsun diye iç içe değil).
   Site koyu, /yonetim açık modda. Tema kaynağı: themes/sarnic/sarnicTheme.ts
   (değişince `npm run tema`). */
export function AstryxTema({ children }: { children: React.ReactNode }) {
  const yol = usePathname();
  const mod = yol?.startsWith("/yonetim") ? "light" : "dark";
  return (
    <Theme theme={sarnicTheme} mode={mod}>
      <InternationalizationProvider locale="tr-TR" messages={{ "tr-TR": trTR }}>
        <LinkProvider component={Link}>{children}</LinkProvider>
      </InternationalizationProvider>
    </Theme>
  );
}
