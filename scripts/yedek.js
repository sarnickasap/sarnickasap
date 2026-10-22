#!/usr/bin/env node
/* Üretim verisinin JSON yedeği ve geri yüklenmesi (K-36).

   NEDEN: Bu projede dört kez üretim verisi bozuldu ve her seferinde
   geri yükleme "seed'deki değer neydi" tahminiyle yapıldı. Kullanıcı
   gerçek kataloğunu girdikten sonra seed artık doğru referans DEĞİL —
   gerçek bir yedek gerekiyor.

   Kullanım:
     node scripts/yedek.js al                 → yedekler/YYYY-MM-DD-HHmm.json
     node scripts/yedek.js listele
     node scripts/yedek.js goster <dosya>
     node scripts/yedek.js yukle  <dosya>     → ONAY ister

   Şifre hash'leri yedeklenir (hesapların geri gelmesi için) ama
   `goster` çıktısında maskelenir.
*/
const fs = require("fs");
const path = require("path");

const KLASOR = path.join(__dirname, "..", "yedekler");
const TABLOLAR = [
  "site_info", "hours", "categories", "products",
  "deals", "gallery", "reviews", "brands", "users",
];

function sql() {
  const { neon } = require("@neondatabase/serverless");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL tanımlı değil.");
    process.exit(1);
  }
  return neon(process.env.DATABASE_URL);
}

async function al() {
  const db = sql();
  const veri = { alindi: new Date().toISOString(), tablolar: {} };
  for (const t of TABLOLAR) {
    veri.tablolar[t] = await db.query(`select * from ${t}`);
  }
  fs.mkdirSync(KLASOR, { recursive: true });
  const ad = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-") + ".json";
  const yol = path.join(KLASOR, ad);
  fs.writeFileSync(yol, JSON.stringify(veri, null, 1));
  const toplam = Object.values(veri.tablolar).reduce((a, r) => a + r.length, 0);
  console.log(`✅ ${toplam} satır yedeklendi → yedekler/${ad}`);
  for (const [t, r] of Object.entries(veri.tablolar)) console.log(`   ${String(r.length).padStart(4)} ${t}`);
}

function listele() {
  if (!fs.existsSync(KLASOR)) return console.log("Henüz yedek yok.");
  fs.readdirSync(KLASOR).filter((f) => f.endsWith(".json")).sort().reverse()
    .forEach((f) => {
      const v = JSON.parse(fs.readFileSync(path.join(KLASOR, f), "utf8"));
      const n = Object.values(v.tablolar).reduce((a, r) => a + r.length, 0);
      console.log(`  ${f}  ${n} satır  (ürün ${v.tablolar.products.length}, kullanıcı ${v.tablolar.users.length})`);
    });
}

function goster(dosya) {
  const v = JSON.parse(fs.readFileSync(path.join(KLASOR, dosya), "utf8"));
  console.log("alındı:", v.alindi);
  const b = v.tablolar.site_info[0] ?? {};
  for (const k of ["phone", "address", "hero_title", "seo_title"]) console.log(`  ${k}: ${JSON.stringify(b[k])}`);
  console.log("  saatler:", v.tablolar.hours.map((h) => `${h.day.slice(0,3)} ${h.open}-${h.close}`).join(" "));
  console.log("  ürünler:", v.tablolar.products.length, "—", v.tablolar.products.slice(0, 6).map((p) => `${p.name} ${p.price}`).join(", "), "…");
  console.log("  kullanıcılar:", v.tablolar.users.map((u) => u.email).join(", "), "(şifre hash'leri yedekte var, burada gizli)");
}

async function yukle(dosya) {
  if (process.env.YEDEK_ONAY !== "evet, yukle") {
    console.error("🚨 Geri yükleme MEVCUT VERİYİ SİLER.\n");
    goster(dosya);
    console.error(`\nOnaylamak için:\n   YEDEK_ONAY="evet, yukle" node scripts/yedek.js yukle ${dosya}\n`);
    process.exit(1);
  }
  const db = sql();
  const v = JSON.parse(fs.readFileSync(path.join(KLASOR, dosya), "utf8"));
  // Yabancı anahtar sırası: önce bağımlılar silinir, sonra tersten yazılır
  const silmeSirasi = ["products", "deals", "gallery", "reviews", "brands", "users", "hours", "site_info", "categories"];
  for (const t of silmeSirasi) await db.query(`delete from ${t}`);
  for (const t of ["categories", "site_info", "hours", "products", "deals", "gallery", "reviews", "brands", "users"]) {
    const satirlar = v.tablolar[t] ?? [];
    for (const s of satirlar) {
      const k = Object.keys(s);
      const yer = k.map((_, i) => `$${i + 1}`).join(",");
      await db.query(`insert into ${t} (${k.map((x) => `"${x}"`).join(",")}) values (${yer})`, k.map((x) => s[x]));
    }
    console.log(`   ${satirlar.length} ${t}`);
  }
  // serial dizileri geri al
  for (const t of ["products", "deals", "gallery", "reviews", "brands", "users", "categories"]) {
    await db.query(`select setval(pg_get_serial_sequence('${t}','id'), coalesce((select max(id) from ${t}),1))`);
  }
  console.log("✅ geri yüklendi");
}

const [komut, dosya] = process.argv.slice(2);
(async () => {
  if (komut === "al") await al();
  else if (komut === "listele") listele();
  else if (komut === "goster" && dosya) goster(dosya);
  else if (komut === "yukle" && dosya) await yukle(dosya);
  else console.log("Kullanım: node scripts/yedek.js al | listele | goster <dosya> | yukle <dosya>");
})();
