#!/usr/bin/env node
/* Admin testleri için GEÇİCİ yönetici hesabı.

   NEDEN: admin e2e testleri gerçek yönetici şifresine ihtiyaç duyuyordu;
   şifre bende olmadığı için bu testler aylarca hiç koşmadı (ve çıktı
   üretmedikleri için "geçti" görünüyordu).

   Bu betik rastgele şifreli, adı apaçık geçici bir hesap açar, testleri
   çalıştırır ve hesabı MUTLAKA siler. Silme doğrulanmazsa yüksek sesle
   uyarır — üretimde bilinen şifreli bir yönetici bırakmak kabul edilemez.

   Kullanım:  node tests/gecici-admin.js            → tüm testler
              node tests/gecici-admin.js admin-seo  → seçili testler
*/
const { spawnSync } = require("child_process");
const crypto = require("crypto");
const path = require("path");

const EPOSTA = "gecici-test@sarnickasap.invalid";

/* 🚨 Bu betik yönetici hesabı OLUŞTURUYOR. Yalnızca test veritabanında
   çalışmalı — bkz. tests/kos.js başındaki koruma notu. */
const TEST_URL = process.env.TEST_DATABASE_URL;
if (!TEST_URL || !/\/sarnic_test(\?|$)/.test(TEST_URL)) {
  console.error("🚨 TEST_DATABASE_URL test veritabanını göstermiyor — çalıştırılmadı.");
  process.exit(1);
}

(async () => {
  const bcrypt = require("bcryptjs");
  const { neon } = require("@neondatabase/serverless");
  const sql = neon(TEST_URL);
  const sifre = crypto.randomBytes(24).toString("base64url");
  const hash = await bcrypt.hash(sifre, 12);

  /* Temizlik HER çıkış yolunda çalışmalı.
     Ölçüldü: Neon'a ağ hatası (EPIPE) süreci `finally` dışından düşürdü ve
     geçici yönetici ÜRETİMDE kaldı. Şifre rastgele ve hiçbir yere
     yazılmıyor, yani kullanılabilir değil — ama fazladan bir yönetici satırı
     `admin-kullanicilar` gibi testlerin varsayımını da bozuyor. */
  let olusturuldu = false;
  let temizlendi = false;

  async function temizle(sebep) {
    if (!olusturuldu || temizlendi) return;
    for (let deneme = 1; deneme <= 4; deneme++) {
      try {
        await sql`delete from users where email = ${EPOSTA}`;
        await sql`delete from login_attempts where anahtar = ${"e:" + EPOSTA}`;
        const [{ n }] = await sql`select count(*)::int n from users where email = ${EPOSTA}`;
        if (n === 0) {
          temizlendi = true;
          console.log(`\n✅ geçici yönetici silindi${sebep ? ` (${sebep})` : ""}`);
          return;
        }
      } catch (e) {
        console.log(`   temizlik ${deneme}. deneme başarısız: ${String(e).slice(0, 70)}`);
        await new Promise((r) => setTimeout(r, deneme * 800));
      }
    }
    console.log(
      `\n❌❌ UYARI: geçici yönetici SİLİNEMEDİ. Hemen elle silin:\n` +
        `   delete from users where email = '${EPOSTA}';\n`,
    );
    process.exitCode = 1;
  }

  // Beklenmedik çıkış yolları da kapansın
  for (const olay of ["SIGINT", "SIGTERM"]) {
    process.on(olay, () => {
      void temizle(olay).then(() => process.exit(1));
    });
  }
  process.on("uncaughtException", (e) => {
    console.error("Beklenmedik hata:", e);
    void temizle("uncaughtException").then(() => process.exit(1));
  });
  process.on("unhandledRejection", (e) => {
    console.error("Yakalanmamış söz reddi:", e);
    void temizle("unhandledRejection").then(() => process.exit(1));
  });

  try {
    await sql`delete from users where email like 'gecici-test%'`; // artık varsa temizle
    await sql`insert into users (email, password_hash, name) values (${EPOSTA}, ${hash}, 'Geçici Test')`;
    olusturuldu = true;
    console.log(`▶ geçici yönetici açıldı: ${EPOSTA}\n`);

    const r = spawnSync(process.execPath, [path.join(__dirname, "kos.js"), ...process.argv.slice(2)], {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: TEST_URL, ADMIN_EMAIL: EPOSTA, ADMIN_PW: sifre },
    });
    process.exitCode = r.status ?? 1;
  } finally {
    await temizle();
  }
})();
