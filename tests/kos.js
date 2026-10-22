#!/usr/bin/env node
/* Tüm e2e testlerini çalıştırır ve ÇIKIŞ KODUNA göre raporlar.

   NEDEN VAR: eskiden testleri `grep -c "❌"` ile değerlendiriyordum.
   Bir test kimlik bilgisi yokluğundan ilk satırda ÇÖKÜNCE hiç ❌ basmıyor,
   bu yüzden "geçti" görünüyordu. Dört admin testi ve erişilebilirlik
   testinin panel bölümü uzun süre bu şekilde hiç koşmadı.

   Çıkış kodu sözleşmesi:  0 = geçti · 2 = atlandı · diğer = BAŞARISIZ
   Çıktı üretmeden 0 dönen test de şüpheli sayılır ve BAŞARISIZ raporlanır.
*/
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/* ──────────────────────────────────────────────────────────────────────────
   🚨 ÜRETİM VERİSİ KORUMASI

   Testler panel üzerinden ekleme/düzenleme/silme yapıyor. Uzun süre bunlar
   ÜRETİM veritabanına yazdı ve dört kez gerçek veri bozuldu:
   sahte markalar · yöneticinin hesabı · iki fırsat · iletişim bilgisi ve
   çalışma saatleri. Her seferinde "test kendi verisini siler" diye
   yamadım — ama test ÇÖKERSE temizlik hiç çalışmıyor.

   Doğru çözüm izolasyon: testler artık `sarnic_test` veritabanına bakar
   (aynı Neon projesi, ayrı veritabanı). Bu betik:
     1. TEST_DATABASE_URL yoksa ÇALIŞMAZ,
     2. hedefin gerçekten test veritabanı olduğunu doğrular,
     3. Next sunucusunu KENDİSİ o veritabanıyla başlatır,
     4. sunucunun gerçekten test verisini sunduğunu nöbetçi kontrolle
        doğrular (yanlışlıkla üretime bağlı bir sunucu çalışıyor olabilir).
   ────────────────────────────────────────────────────────────────────────── */
const TEST_URL = process.env.TEST_DATABASE_URL;
const PORT = 3100;

if (!TEST_URL) {
  console.error("🚨 TEST_DATABASE_URL tanımlı değil — testler ÜRETİME yazardı.");
  console.error("   .env.local içinde tanımlı olmalı (bkz. AGENTS.md).");
  process.exit(1);
}
if (!/\/sarnic_test(\?|$)/.test(TEST_URL)) {
  console.error(`🚨 TEST_DATABASE_URL test veritabanını göstermiyor: ${TEST_URL.replace(/\/\/[^@]+@/, "//***@")}`);
  process.exit(1);
}

const dizin = path.join(__dirname, "e2e");
const testler = fs.readdirSync(dizin).filter((d) => d.endsWith(".js") && !d.startsWith("_")).sort();
const secim = process.argv.slice(2);
const kosulacak = secim.length ? testler.filter((t) => secim.some((s) => t.includes(s))) : testler;

/* ── Test sunucusunu test veritabanıyla başlat ── */
const cocukOrtam = { ...process.env, DATABASE_URL: TEST_URL };

/* Derleme hangi veritabanıyla yapıldıysa O veriyi gömer.
   `use cache` + PPR sayfanın statik kabuğunu DERLEME ANINDA üretiyor;
   sunucuyu test veritabanıyla başlatmak tek başına yetmiyor — ölçüldü,
   nöbetçi üretim verisini yakaladı (37 ürün). Bu yüzden derlemenin test
   veritabanıyla yapıldığı bir işaret dosyasıyla takip ediliyor.
   Normal `npm run build` `.next`i yenilediği için işaret kaybolur ve
   sonraki test koşumu kendiliğinden yeniden derler. */
const ISARET = path.join(__dirname, "..", ".next", ".test-db-build");
if (!fs.existsSync(ISARET)) {
  console.log("▶ test veritabanıyla derleniyor (bir defalık)…");
  const d = spawnSync("npx", ["next", "build"], { env: cocukOrtam, encoding: "utf8" });
  if (d.status !== 0) {
    console.error("🚨 Derleme başarısız:\n" + (d.stdout ?? "").slice(-1500) + (d.stderr ?? "").slice(-1500));
    process.exit(1);
  }
  fs.writeFileSync(ISARET, new Date().toISOString());
}

spawnSync("pkill", ["-f", `next start -p ${PORT}`], { stdio: "ignore" });
const sunucu = spawn("npx", ["next", "start", "-p", String(PORT)], {
  env: cocukOrtam,
  stdio: ["ignore", "pipe", "pipe"],
  detached: false,
});
const sunucuyuDurdur = () => { try { sunucu.kill("SIGTERM"); } catch {} };
process.on("exit", sunucuyuDurdur);
for (const o of ["SIGINT", "SIGTERM"]) process.on(o, () => { sunucuyuDurdur(); process.exit(1); });

(async () => {
  // Hazır olana kadar bekle
  let hazir = false;
  for (let i = 0; i < 60 && !hazir; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    try { hazir = (await fetch(`http://localhost:${PORT}/`)).ok; } catch {}
  }
  if (!hazir) { console.error("🚨 Test sunucusu ayağa kalkmadı."); sunucuyuDurdur(); process.exit(1); }

  /* ── NÖBETÇİ: sunulan veri gerçekten TEST veritabanından mı? ──
     Yanlışlıkla üretime bağlı bir sunucu çalışıyorsa buradan anlaşılır. */
  const { neon } = require("@neondatabase/serverless");
  const testSql = neon(TEST_URL);
  const [{ n: beklenen }] = await testSql`select count(*)::int n from products`;
  const html = await (await fetch(`http://localhost:${PORT}/`)).text();
  const gorulen = (html.match(/aria-label="[^"]*WhatsApp/g) || []).length;
  const [{ n: stokta }] = await testSql`select count(*)::int n from products where stock = true`;
  if (gorulen !== stokta) {
    console.error(
      `🚨 NÖBETÇİ DURDURDU: sunucunun sunduğu veri test veritabanıyla uyuşmuyor.\n` +
        `   test db: ${beklenen} ürün (${stokta} stokta) · sayfada ${gorulen} sipariş bağlantısı\n` +
        `   Başka bir sunucu :${PORT} portunu tutuyor olabilir — kapatıp tekrar deneyin.`,
    );
    sunucuyuDurdur();
    process.exit(1);
  }
  console.log(`▶ test sunucusu hazır (sarnic_test · ${beklenen} ürün)\n`);

  calistir();
})();

function calistir() {
const sonuc = [];
for (const t of kosulacak) {
  const r = spawnSync(process.execPath, [path.join(dizin, t)], { encoding: "utf8", env: cocukOrtam });
  const cikti = (r.stdout || "") + (r.stderr || "");
  const satir = (cikti.match(/[✅❌]/g) || []).length;
  let durum;
  if (r.status === 2) durum = "ATLANDI";
  else if (r.status === 0) durum = satir > 0 ? "GEÇTİ" : "ŞÜPHELİ";
  else durum = "BAŞARISIZ";
  sonuc.push({ t, durum, kod: r.status, satir, cikti });
}

const im = { "GEÇTİ": "✅", "ATLANDI": "⏭️ ", "BAŞARISIZ": "❌", "ŞÜPHELİ": "⚠️ " };
for (const s of sonuc) {
  console.log(`${im[s.durum]} ${s.t.replace(/\.js$/, "").padEnd(20)} ${s.durum.padEnd(10)} kod=${s.kod} doğrulama=${s.satir}`);
  if (s.durum === "BAŞARISIZ" || s.durum === "ŞÜPHELİ") {
    const onemli = s.cikti.split("\n").filter((l) => l.includes("❌") || /Error|error:/.test(l));
    onemli.slice(0, 6).forEach((l) => console.log("      " + l.trim().slice(0, 150)));
  }
  if (s.durum === "ATLANDI") {
    s.cikti.split("\n").filter((l) => l.includes("⏭")).slice(0, 1).forEach((l) => console.log("      " + l.trim()));
  }
}

const say = (d) => sonuc.filter((s) => s.durum === d).length;
console.log(`\ngeçti ${say("GEÇTİ")} · atlandı ${say("ATLANDI")} · başarısız ${say("BAŞARISIZ")} · şüpheli ${say("ŞÜPHELİ")}`);
sunucuyuDurdur();
process.exit(say("BAŞARISIZ") + say("ŞÜPHELİ") ? 1 : 0);
}
