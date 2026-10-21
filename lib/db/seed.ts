import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  categories,
  deals,
  gallery,
  hours,
  products,
  siteInfo,
  users,
} from "./schema";

/* ──────────────────────────────────────────────────────────────────────────
   SEED — kaynak: `sarnic-store.js` → DEFAULT

   ⚠️  Karar K-23 — hangi veri gerçek:
     ✅ GERÇEK   : telefon, adres
     ❌ YER TUTUCU: 19 ürün ve fiyatları, 3 fırsat
     ⛔ SEED EDİLMEZ: müşteri yorumları (gerçek değil — uydurma yorum
                      yayınlanmayacak; Google yorumlarından alınacak)
     ❓ TEYİT BEKLİYOR: çalışma saatleri (V-2), giriş/hakkımızda metni (V-3)

   Ürünler, referans ekran görüntüleriyle piksel karşılaştırması yapılabilsin
   diye tasarımdaki değerlerle seed edilir (bkz. "07 - Görsel Karşılaştırma").

   🚨 YAYIN ÖNCESİ: Et fiyatı müşterinin satın alma kararını doğrudan etkiler.
      sarnickasap.com'a bağlanmadan ÖNCE ürün ve fiyatlar panelden gerçek
      değerlerle güncellenmelidir.
   ────────────────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  "Dana",
  "Kuzu",
  "Tavuk",
  "Kıyma & köftelik",
  "Mangallık",
  "Hazır marine",
  "Sakatat",
];

/** [ad, kategori, fiyat, not, stokta] */
const PRODUCTS: [string, string, number, string, boolean][] = [
  ["Dana kuşbaşı", "Dana", 890, "Sinirsiz, but ve kol", true],
  ["Dana antrikot", "Dana", 1150, "Kemiksiz, dilimlenmiş", true],
  ["Dana bonfile", "Dana", 1450, "Bütün veya madalyon", true],
  ["Dana kaburga", "Dana", 720, "Fırınlık, kemikli", true],
  ["Kuzu pirzola", "Kuzu", 1250, "Günlük kesim", true],
  ["Kuzu but", "Kuzu", 980, "Kemikli, bütün veya yarım", true],
  ["Kuzu kol", "Kuzu", 920, "Fırın ve haşlama için", false],
  ["Tavuk göğüs", "Tavuk", 260, "Fileto", true],
  ["Tavuk kanat", "Tavuk", 230, "", true],
  ["Tavuk baget", "Tavuk", 190, "", true],
  ["Dana kıyma", "Kıyma & köftelik", 820, "Az yağlı, iki kez çekilmiş", true],
  ["Köftelik kıyma", "Kıyma & köftelik", 850, "Dana-kuzu karışık", true],
  ["Kasap köfte", "Kıyma & köftelik", 900, "Hazır baharatlı", true],
  ["Kuzu şiş", "Mangallık", 1100, "Şişe dizilmiş", true],
  ["Dana dallas", "Mangallık", 1300, "Kemikli, 3 cm", true],
  ["Marine tavuk şiş", "Hazır marine", 340, "Yoğurtlu, baharatlı", true],
  ["Marine dana bonfile", "Hazır marine", 1500, "Kekikli, zeytinyağlı", true],
  ["Kuzu ciğer", "Sakatat", 600, "", true],
  ["Dana işkembe", "Sakatat", 380, "Temizlenmiş", true],
];

const DEALS = [
  {
    title: "Mangal paketi",
    description: "1 kg köfte, 1 kg tavuk şiş, 500 g kuzu pirzola",
    oldPrice: 1850,
    newPrice: 1590,
    until: "Pazar akşamına kadar",
    active: true,
  },
  {
    title: "Dana kıyma",
    description: "Haftanın fırsatı, 2 kg ve üzeri alımlarda",
    oldPrice: 820,
    newPrice: 760,
    until: "Bu hafta",
    active: true,
  },
  {
    title: "Marine tavuk şiş",
    description: "Günün ürünü",
    oldPrice: 340,
    newPrice: 299,
    until: "Bugün",
    active: true,
  },
];

const GALLERY = [
  "Dükkân vitrini",
  "Kesim tezgâhı",
  "Dana antrikot",
  "Kuzu pirzola",
  "Mangal paketi",
  "Ekibimiz",
];

const HOURS = [
  ["Pazartesi", "08:00", "20:00"],
  ["Salı", "08:00", "20:00"],
  ["Çarşamba", "08:00", "20:00"],
  ["Perşembe", "08:00", "20:00"],
  ["Cuma", "08:00", "20:00"],
  ["Cumartesi", "08:00", "20:00"],
  ["Pazar", "09:00", "14:00"],
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL ve SEED_ADMIN_PASSWORD tanımlı olmalı.\n" +
        "Şifre repoya yazılmaz — .env.local üzerinden verilir.",
    );
  }

  console.log("→ Mevcut veriler temizleniyor…");
  await db.delete(products);
  await db.delete(deals);
  await db.delete(gallery);
  await db.delete(categories);
  await db.delete(hours);
  await db.delete(siteInfo);

  console.log("→ Kategoriler…");
  const insertedCats = await db
    .insert(categories)
    .values(CATEGORIES.map((name, sort) => ({ name, sort })))
    .returning();
  const catId = new Map(insertedCats.map((c) => [c.name, c.id]));

  console.log("→ Ürünler (YER TUTUCU fiyatlar — K-23)…");
  await db.insert(products).values(
    PRODUCTS.map(([name, cat, price, note, stock], sort) => ({
      name,
      categoryId: catId.get(cat)!,
      price,
      note,
      stock,
      sort,
    })),
  );

  console.log("→ Fırsatlar (YER TUTUCU — K-23)…");
  await db.insert(deals).values(DEALS.map((d, sort) => ({ ...d, sort })));

  console.log("→ Galeri (URL'siz — tasarımda da boş)…");
  await db
    .insert(gallery)
    .values(GALLERY.map((caption, sort) => ({ caption, url: "", sort })));

  console.log("→ Çalışma saatleri…");
  await db.insert(hours).values(
    HOURS.map(([day, open, close], dayIndex) => ({
      dayIndex,
      day,
      open,
      close,
      closed: false,
    })),
  );

  console.log("→ Site bilgileri (telefon + adres GERÇEK — K-23)…");
  await db.insert(siteInfo).values({
    id: 1,
    phone: "0552 126 98 35",
    whatsapp: "905521269835",
    address: "Atatürk, B. Menderes Cad. 126/D, Gaziemir, İzmir",
    heroTitle: "Taze et, doğru kesim.",
    heroSub:
      "Gaziemir’de dana, kuzu ve tavukta günlük kesim. Siparişinizi WhatsApp’tan iletin, siz gelmeden hazırlayalım.",
    about:
      "Sarnıç Kasap, Gaziemir’de mahalle kasaplığını sürdüren bir aile işletmesidir. Etlerimizi güvendiğimiz üreticilerden alır, dükkânda kendimiz parçalar ve isteğinize göre keseriz. Kuşbaşından mangallığa, köftelikten marine ürünlere kadar her siparişi aynı özenle hazırlarız.",
    seoTitle: "Sarnıç Kasap — Gaziemir’de taze et, doğru kesim",
    seoDescription:
      "Gaziemir’de dana, kuzu ve tavukta günlük kesim. Kilo fiyatları, haftanın fırsatları ve WhatsApp’tan sipariş.",
  });

  console.log("→ Yorumlar: SEED EDİLMEDİ (gerçek değil — K-15).");

  console.log("→ İlk yönetici hesabı…");
  const existing = await db.select().from(users);
  if (existing.length === 0) {
    await db.insert(users).values({
      email: adminEmail.toLowerCase(),
      name: "Yönetici",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    });
    console.log(`   oluşturuldu: ${adminEmail}`);
  } else {
    console.log("   zaten var, atlandı.");
  }

  console.log("\n✅ Seed tamamlandı.");
  console.log(
    "🚨 Ürün ve fiyatlar YER TUTUCU. Alan adına bağlanmadan önce panelden güncelleyin.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
