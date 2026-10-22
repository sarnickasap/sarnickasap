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

(async () => {
  const bcrypt = require("bcryptjs");
  const { neon } = require("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);
  const sifre = crypto.randomBytes(24).toString("base64url");
  const hash = await bcrypt.hash(sifre, 12);

  let olusturuldu = false;
  try {
    await sql`delete from users where email = ${EPOSTA}`; // artık varsa temizle
    await sql`insert into users (email, password_hash, name) values (${EPOSTA}, ${hash}, 'Geçici Test')`;
    olusturuldu = true;
    console.log(`▶ geçici yönetici açıldı: ${EPOSTA}\n`);

    const r = spawnSync(process.execPath, [path.join(__dirname, "kos.js"), ...process.argv.slice(2)], {
      stdio: "inherit",
      env: { ...process.env, ADMIN_EMAIL: EPOSTA, ADMIN_PW: sifre },
    });
    process.exitCode = r.status ?? 1;
  } finally {
    if (olusturuldu) {
      await sql`delete from users where email = ${EPOSTA}`;
      // Hız sınırı kayıtları da kalmasın
      await sql`delete from login_attempts where anahtar = ${"e:" + EPOSTA}`;
      const [{ n }] = await sql`select count(*)::int n from users where email = ${EPOSTA}`;
      if (n === 0) console.log(`\n✅ geçici yönetici silindi`);
      else {
        console.log(`\n❌❌ UYARI: geçici yönetici SİLİNEMEDİ (${n} kayıt) — hemen elle silin!`);
        process.exitCode = 1;
      }
    }
  }
})();
