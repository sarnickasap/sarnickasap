#!/usr/bin/env node
/* Tüm e2e testlerini çalıştırır ve ÇIKIŞ KODUNA göre raporlar.

   NEDEN VAR: eskiden testleri `grep -c "❌"` ile değerlendiriyordum.
   Bir test kimlik bilgisi yokluğundan ilk satırda ÇÖKÜNCE hiç ❌ basmıyor,
   bu yüzden "geçti" görünüyordu. Dört admin testi ve erişilebilirlik
   testinin panel bölümü uzun süre bu şekilde hiç koşmadı.

   Çıkış kodu sözleşmesi:  0 = geçti · 2 = atlandı · diğer = BAŞARISIZ
   Çıktı üretmeden 0 dönen test de şüpheli sayılır ve BAŞARISIZ raporlanır.
*/
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dizin = path.join(__dirname, "e2e");
const testler = fs.readdirSync(dizin).filter((d) => d.endsWith(".js") && !d.startsWith("_")).sort();
const secim = process.argv.slice(2);
const kosulacak = secim.length ? testler.filter((t) => secim.some((s) => t.includes(s))) : testler;

const sonuc = [];
for (const t of kosulacak) {
  const r = spawnSync(process.execPath, [path.join(dizin, t)], { encoding: "utf8" });
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
process.exit(say("BAŞARISIZ") + say("ŞÜPHELİ") ? 1 : 0);
