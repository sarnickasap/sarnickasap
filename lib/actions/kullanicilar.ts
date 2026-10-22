"use server";

import { eq, ne, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { oturumZorunlu } from "@/lib/session";

/* ──────────────────────────────────────────────────────────────────────────
   Yönetici hesapları — TASARIMDA YOK (onaylı sapma #3, karar K-06/K-19).

   Güvenlik kuralları:
   · Her eylem oturumu doğrular (Server Action = HTTP uç noktası).
   · Kendini silemezsin — yanlışlıkla kendini dışarı kilitlemeyi önler.
   · SON yöneticiyi silemezsin — panele hiç girilemez hâle gelirdi.
   · Şifre en az 12 karakter; bcrypt cost 12 ile saklanır.
   · Şifre hash'i hiçbir zaman istemciye gönderilmez.
   ────────────────────────────────────────────────────────────────────────── */

const SIFRE_MIN = 12;

const kimlik = z.number().int().positive();

const yeniKullanici = z.object({
  email: z.string().email("Geçerli bir e-posta girin").max(255),
  name: z.string().max(128).default(""),
  password: z
    .string()
    .min(SIFRE_MIN, `Şifre en az ${SIFRE_MIN} karakter olmalı`)
    .max(200),
});

export type KullaniciSonuc = { hata?: string; basarili?: string };

/** Panelde listelenecek alanlar — şifre hash'i ASLA dahil değil. */
export async function kullanicilariGetir() {
  await oturumZorunlu();
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
}

export async function kullaniciEkle(
  _prev: KullaniciSonuc,
  formData: FormData,
): Promise<KullaniciSonuc> {
  await oturumZorunlu();

  const parsed = yeniKullanici.safeParse({
    email: formData.get("email"),
    name: formData.get("name") ?? "",
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { hata: parsed.error.issues[0]?.message ?? "Geçersiz bilgi" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const [varMi] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (varMi) return { hata: "Bu e-posta zaten kayıtlı." };

  await db.insert(users).values({
    email,
    name: parsed.data.name.trim(),
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
  });

  return { basarili: `${email} eklendi.` };
}

export async function kullaniciSil(girdiId: number): Promise<KullaniciSonuc> {
  const kendim = await oturumZorunlu();
  const ayris = kimlik.safeParse(girdiId);
  if (!ayris.success) return { hata: "Geçersiz hesap." };
  const id = ayris.data;

  if (String(id) === kendim.id) {
    return { hata: "Kendi hesabınızı silemezsiniz." };
  }

  // Kullanıcıya anlamlı mesaj verebilmek için önce bakılıyor…
  const digerleri = await db
    .select({ id: users.id })
    .from(users)
    .where(ne(users.id, id));
  if (digerleri.length === 0) {
    return { hata: "Son yöneticiyi silemezsiniz — panele girilemez olurdu." };
  }

  /* …ama asıl koruma SİLME İFADESİNİN İÇİNDE.
     Yukarıdaki "oku sonra sil" deseni yarışa açıktı: iki yönetici aynı anda
     birbirini silerse ikisi de kontrolü geçer, iki silme de işler ve
     panelde HİÇ hesap kalmaz. Aşağıdaki koşul tek ifadede değerlendiği
     için son hesabın silinmesi veritabanı seviyesinde imkânsız. */
  const sonuc = await db
    .delete(users)
    .where(sql`${users.id} = ${id} and (select count(*) from ${users}) > 1`)
    .returning({ id: users.id });

  if (sonuc.length === 0) {
    return { hata: "Son yöneticiyi silemezsiniz — panele girilemez olurdu." };
  }
  return { basarili: "Hesap silindi." };
}

const sifreDegistir = z.object({
  mevcut: z.string().min(1, "Mevcut şifrenizi girin"),
  yeni: z.string().min(SIFRE_MIN, `Yeni şifre en az ${SIFRE_MIN} karakter olmalı`),
});

export async function sifremiDegistir(
  _prev: KullaniciSonuc,
  formData: FormData,
): Promise<KullaniciSonuc> {
  const kendim = await oturumZorunlu();

  const parsed = sifreDegistir.safeParse({
    mevcut: formData.get("mevcut"),
    yeni: formData.get("yeni"),
  });
  if (!parsed.success) {
    return { hata: parsed.error.issues[0]?.message ?? "Geçersiz bilgi" };
  }

  const [u] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(kendim.id)))
    .limit(1);
  if (!u) return { hata: "Hesap bulunamadı." };

  if (!(await bcrypt.compare(parsed.data.mevcut, u.passwordHash))) {
    return { hata: "Mevcut şifre yanlış." };
  }

  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.yeni, 12) })
    .where(eq(users.id, u.id));

  return { basarili: "Şifreniz değiştirildi." };
}
