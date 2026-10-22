/* Admin testleri için paylaşılan yardımcılar.

   NEDEN VAR: admin testleri `process.env.ADMIN_EMAIL` doğrudan
   `p.fill()`'e veriyordu. Değişken yoksa Playwright "expected string, got
   undefined" ile çöküyor, test HİÇ ÇALIŞMADAN bitiyordu. Toplu koşumda
   çıktıda ❌ olmadığı için bu "geçti" gibi görünüyordu — 4 admin testi ve
   erişilebilirlik testinin bir bölümü sessizce hiç koşmuyordu.

   Artık eksik kimlik ATLAMA (çıkış 2) olarak bildirilir; asla geçmiş sayılmaz.

   Çıkış kodu sözleşmesi:  0 = geçti · 1 = başarısız · 2 = atlandı
*/

function adminKimligi() {
  const eposta = process.env.ADMIN_EMAIL;
  const sifre = process.env.ADMIN_PW;
  if (!eposta || !sifre) return null;
  return { eposta, sifre };
}

/** Kimlik yoksa süreci ATLAMA koduyla bitirir. */
function kimlikZorunlu(br) {
  const k = adminKimligi();
  if (k) return k;
  console.log("⏭️  ATLANDI — ADMIN_EMAIL / ADMIN_PW tanımlı değil.");
  console.log("    Çalıştırmak için:  ADMIN_EMAIL=… ADMIN_PW=… node <test>");
  if (br) br.close();
  process.exit(2);
}

/** Panele giriş yapar; zaten girişliyse hiçbir şey yapmaz. */
async function paneleGir(p, B, k) {
  await p.goto(B + "/yonetim", { waitUntil: "networkidle" });
  if (p.url().includes("giris")) {
    await p.fill("input[name=email]", k.eposta);
    await p.fill("input[name=password]", k.sifre);
    await p.click("button[type=submit]");
    await p.waitForURL((u) => !u.toString().includes("giris"), { timeout: 20000 });
  }
  await p.waitForSelector("header");
  await p.waitForFunction(() => document.querySelectorAll("main").length === 1, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(600);
}

module.exports = { adminKimligi, kimlikZorunlu, paneleGir };
