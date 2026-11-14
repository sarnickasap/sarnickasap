import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

/*
 * Sarnıç Kasap teması — Astryx "neutral" temasından türetilir.
 * Değerler app/globals.css'teki marka tokenlarıyla aynıdır:
 * [açık (yönetim paneli), koyu (site)].
 * Değiştirdikten sonra: npm run tema
 */
export const sarnicTheme = defineTheme({
  name: "sarnic",
  extends: neutralTheme,
  // typography tamamen değiştirilir (extends'te birleşmez); ölçek neutral ile aynı.
  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: { family: "Inter", fallbacks: "system-ui, sans-serif" },
    heading: {
      family: "DM Sans",
      fallbacks: "Inter, system-ui, sans-serif",
      weights: { 3: "bold", 4: "bold" },
    },
    code: { family: "ui-monospace", fallbacks: "monospace" },
  },
  tokens: {
    "--color-accent": ["#b8222a", "#b8222a"],
    "--color-on-accent": ["#ffffff", "#ffffff"],
    "--color-text-accent": ["#b8222a", "#e0464e"],

    "--color-background-body": ["#fafafa", "#0a0a0a"],
    "--color-background-surface": ["#ffffff", "#0f0f0f"],
    "--color-background-card": ["#ffffff", "#0a0a0a"],
    "--color-background-popover": ["#ffffff", "#171717"],
    "--color-background-muted": ["#f5f5f5", "#171717"],

    "--color-text-primary": ["#0a0a0a", "#fafafa"],
    "--color-text-secondary": ["#737373", "#a3a3a3"],

    "--color-border": ["#e5e5e5", "#1f1f1f"],
    "--color-border-emphasized": ["#d4d4d4", "#333333"],

    // Odak halkası (K-08): marka kırmızısı koyu zeminde 3:1'in altında kalıyor.
    "--focus-outline-color": ["#0a0a0a", "#f8efea"],

    "--radius-element": "8px",
    "--radius-container": "12px",
  },
});
