import { z } from "zod";

/* ──────────────────────────────────────────────────────────────────────────
   Online sipariş formu — giriş doğrulaması (sistem sınırı).
   Sınırlar stok programı sözleşmesiyle aynı (web-api.md → POST /api/web/siparis).
   İstemci ve sunucu aynı şemayı kullanır; sunucu yine de kesin kontrolü
   kendisi yapar (server action herkese açık bir HTTP uç noktasıdır).
   ────────────────────────────────────────────────────────────────────────── */

export const EN_FAZLA_KALEM = 30;

/** "0532 123 45 67" · "+90 532…" · "532…" → "05321234567"; geçersizse null */
export function telefonNormalize(girdi: string): string | null {
  const rakam = girdi.replace(/\D/g, "");
  const yerel =
    rakam.length === 12 && rakam.startsWith("90")
      ? `0${rakam.slice(2)}`
      : rakam.length === 10 && rakam.startsWith("5")
        ? `0${rakam}`
        : rakam;
  return /^05\d{9}$/.test(yerel) ? yerel : null;
}

export const KalemSema = z.object({
  code: z.string().min(1).max(32),
  qty: z.number().positive().max(100),
  note: z.string().trim().max(200).default(""),
});
export type Kalem = z.infer<typeof KalemSema>;

const Metin = (en: number, ez: number, mesaj: string) =>
  z.string().trim().min(en, mesaj).max(ez, mesaj);

export const SiparisFormSema = z
  .object({
    clientRef: z.string().regex(/^[A-Za-z0-9-]{8,64}$/, "Form süresi doldu, sayfayı yenileyin."),
    ad: Metin(2, 80, "Ad soyad 2–80 karakter olmalı."),
    telefon: z
      .string()
      .transform((v, ctx) => {
        const n = telefonNormalize(v);
        if (!n) ctx.addIssue({ code: "custom", message: "Geçerli bir cep telefonu girin (05xx xxx xx xx)." });
        return n ?? "";
      }),
    tip: z.enum(["pickup", "delivery"], { message: "Teslim şeklini seçin." }),
    tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Gün seçin."),
    aralik: z.string().regex(/^\d{2}:\d{2}$/, "Saat aralığı seçin."),
    bolge: z.string().trim().max(80).default(""),
    adres: z.string().trim().max(300, "Adres en fazla 300 karakter olabilir.").default(""),
    not: z.string().trim().max(500, "Not en fazla 500 karakter olabilir.").default(""),
    kvkk: z.literal("on", { message: "Devam etmek için aydınlatma metnini onaylayın." }),
    kalemler: z.array(KalemSema).min(1, "Sepetiniz boş.").max(EN_FAZLA_KALEM),
  })
  .superRefine((v, ctx) => {
    if (v.tip !== "delivery") return;
    if (!v.bolge) ctx.addIssue({ code: "custom", path: ["bolge"], message: "Teslimat bölgesini seçin." });
    if (v.adres.length < 5) {
      ctx.addIssue({ code: "custom", path: ["adres"], message: "Adresi en az 5 karakter olarak yazın." });
    }
  });
export type SiparisFormu = z.infer<typeof SiparisFormSema>;

/** Form durumu — server action ↔ istemci. */
export type SiparisDurumu = {
  hata: string | null;
  alanHatalari: Partial<Record<string, string>>;
};

export const BOS_DURUM: SiparisDurumu = { hata: null, alanHatalari: {} };
