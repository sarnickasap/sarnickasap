import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/* ── Veritabanı seviyesi korumalar hakkında ──
   Server action'lar zod ile doğruluyor, ama veritabanına yazan TEK yol
   onlar değil: seed betiği, onarım betikleri, `drizzle-kit studio` ve
   doğrudan SQL hepsi zod'u atlıyor. Son savunma hattı tabloda olmalı.
   Aşağıdaki CHECK'ler zaten geçerli olan verinin dışına çıkılmasını
   engelliyor; mevcut hiçbir satırı reddetmiyorlar. */

/* ──────────────────────────────────────────────────────────────────────────
   Veri modeli — kaynak: `sarnic-store.js` içindeki DEFAULT nesnesi.
   Tasarımda localStorage'da tutulan yapı birebir tablolara açıldı.
   `*` ile işaretli alanlar tasarımda YOK; karar K-11 (SEO) ve K-06 (giriş)
   gereği eklendi.
   ────────────────────────────────────────────────────────────────────────── */

/** Tek satırlık yapılandırma (id = 1). Tasarımdaki `info` nesnesi. */
export const siteInfo = pgTable("site_info", {
  id: integer("id").primaryKey().default(1),

  // Tasarımdaki alanlar
  phone: varchar("phone", { length: 32 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  address: text("address").notNull(),
  heroTitle: text("hero_title").notNull(),
  heroSub: text("hero_sub").notNull(),
  about: text("about").notNull(),

  // * SEO — panelden düzenlenebilir (K-11)
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  ogImageUrl: text("og_image_url"),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Çalışma saatleri — 7 satır, `dayIndex` 0 = Pazartesi.
 * Tasarımdaki hesapla uyumlu: `(new Date().getDay() + 6) % 7`.
 * Saatler `HH:MM` metni olarak tutulur — tasarım `<input type="time">`
 * değerlerini doğrudan metin olarak karşılaştırıyor (`hm >= t.open`).
 */
export const hours = pgTable(
  "hours",
  {
    dayIndex: integer("day_index").primaryKey(),
    day: varchar("day", { length: 16 }).notNull(),
    open: varchar("open", { length: 5 }).notNull(),
    close: varchar("close", { length: 5 }).notNull(),
    closed: boolean("closed").notNull().default(false),
  },
  (t) => [
    // 0–6 dışında bir gün, açık/kapalı hesabını sessizce bozardı
    check("hours_gun_araligi", sql`${t.dayIndex} between 0 and 6`),
    // Saat metin olarak karşılaştırılıyor (`hm >= t.open`); biçim bozulursa
    // karşılaştırma sessizce yanlış sonuç verir
    check("hours_bicim", sql`${t.open} ~ '^[0-2][0-9]:[0-5][0-9]$' and ${t.close} ~ '^[0-2][0-9]:[0-5][0-9]$'`),
  ],
);

/**
 * Kategoriler. Tasarımda sabit bir dizi (`CATS`) — düzenleme arayüzü YOK,
 * bu yüzden admin'de de CRUD eklenmedi (kapsam genişletilmedi).
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  /** Kilogram fiyatı. `numeric` — kuruşlu fiyat girilebilsin diye
   *  (tasarımın `fmt` fonksiyonu maximumFractionDigits: 2 kullanıyor). */
  price: numeric("price", { precision: 10, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  note: text("note").notNull().default(""),
  stock: boolean("stock").notNull().default(true),
  sort: integer("sort").notNull().default(0),
}, (t) => [
  /* Kategoriye göre süzme ve `urunlerGetir` birleşimi bu sütunu kullanıyor;
     indeks yoktu. */
  index("products_category_id_idx").on(t.categoryId),
  // Eksi fiyat sitede "-500 ₺" olarak basılırdı
  check("products_fiyat_pozitif", sql`${t.price} >= 0`),
]);

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 128 }).notNull(),
  description: text("description").notNull().default(""),
  oldPrice: numeric("old_price", { precision: 10, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  newPrice: numeric("new_price", { precision: 10, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  /** Serbest metin — tasarımda "Bu hafta", "Pazar akşamına kadar" gibi. */
  until: varchar("until", { length: 64 }).notNull().default(""),
  active: boolean("active").notNull().default(false),
  sort: integer("sort").notNull().default(0),
}, (t) => [
  check("deals_fiyat_pozitif", sql`${t.oldPrice} >= 0 and ${t.newPrice} >= 0`),
]);

export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().default(""),
  caption: varchar("caption", { length: 128 }).notNull().default(""),
  sort: integer("sort").notNull().default(0),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull().default(""),
  text: text("text").notNull().default(""),
  rating: integer("rating").notNull().default(5),
  visible: boolean("visible").notNull().default(false),
  sort: integer("sort").notNull().default(0),
}, (t) => [
  // Tasarım yıldızları 1–5 arası basıyor; dışı sessizce bozuk görünürdü
  check("reviews_puan_araligi", sql`${t.rating} between 1 and 5`),
]);

/**
 * * Çalışılan markalar / üreticiler (K-31) — TASARIMDA YOK.
 * Hakkımızda metnindeki "etlerimizi güvendiğimiz üreticilerden alırız"
 * ifadesinin görsel karşılığı. Akan şerit olarak gösterilir.
 */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  logoUrl: text("logo_url").notNull().default(""),
  /** İsteğe bağlı — markanın kendi sitesi */
  linkUrl: text("link_url").notNull().default(""),
  visible: boolean("visible").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

/**
 * * Başarısız giriş denemeleri — kaba kuvvet sınırlaması (K-32).
 * Bellekte tutulamaz: sunucusuz ortamda her istek başka bir örneğe
 * düşebilir, bellek sayacı işe yaramaz.
 */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    /** Normalleştirilmiş e-posta ya da "ip:1.2.3.4" */
    anahtar: varchar("anahtar", { length: 255 }).notNull(),
    zaman: timestamp("zaman", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    /* HER giriş denemesi bu tabloda iki COUNT çalıştırıyor
       (anahtar + zaman penceresi). İndeks yoktu: tam tarama. Tablo
       saldırı anında en hızlı büyüyen tablo, yani indeksin en çok
       gerektiği an tam da o an. */
    index("login_attempts_anahtar_zaman_idx").on(t.anahtar, t.zaman),
  ],
);

/** * Yönetim kullanıcıları (K-06). Tasarımda yok — giriş şifreli olacak ve
 *  panelden yeni admin eklenebilecek. */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type GalleryItem = typeof gallery.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Hour = typeof hours.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type SiteInfo = typeof siteInfo.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type User = typeof users.$inferSelect;
