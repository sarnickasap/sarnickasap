/* ──────────────────────────────────────────────────────────────────────────
   GÖRSEL KARŞILAŞTIRMA ARACI

   Orijinal tasarımı (support.js runtime'ı ile) ve uygulamayı aynı koşullarda
   render eder, seçilen bölgenin ekran görüntülerini piksel piksel karşılaştırır.

   Kullanım:
     node tests/visual/karsilastir.js <secici> [--ad=isim] [--genislikler=1440,390]

   Örnek:
     node tests/visual/karsilastir.js header --ad=header

   Önkoşullar:
     - Orijinal tasarım:  http://localhost:8765  (python3 -m http.server 8765)
     - Uygulama:          http://localhost:3100  (next start -p 3100)

   ⚠️  Tokenları değiştirdikten sonra `rm -rf .next` yapmadan derlersen
       Turbopack eski CSS'i kullanır ve bu araç seni yanıltır (AGENTS.md).
   ────────────────────────────────────────────────────────────────────────── */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const EXE =
  "/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const TASARIM = "http://localhost:8765/Sarnic%20Kasap.dc.html";
const UYGULAMA = "http://localhost:3100/";

/* Referans görüntüler bu saatle alındı — açık/kapalı durumu ve vurgulu gün
   sabitlensin diye aynısı kullanılmalı (bkz. "07 - Görsel Karşılaştırma"). */
const SAAT = new Date("2026-10-21T11:30:00+03:00");

const args = process.argv.slice(2);
const secici = args.find((a) => !a.startsWith("--")) ?? "header";
const ad = (args.find((a) => a.startsWith("--ad=")) ?? "--ad=bolum").slice(5);
const genislikler = (
  args.find((a) => a.startsWith("--genislikler=")) ?? "--genislikler=1440,1280,834,390"
)
  .split("=")[1]
  .split(",")
  .map(Number);

/* Komşu bölümün taşan ilk satırını dışla (bkz. diff.py). */
const altKirp = Number(
  (args.find((a) => a.startsWith("--altKirp=")) ?? "--altKirp=0").split("=")[1],
);

const CIKTI = path.join(__dirname, "ciktilar", ad);

async function yakala(page, url, sel, dosya) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));

  /* Sticky header'ı gizle (header'ın kendisini ölçmüyorsak).
     Uzun bir bölümü yakalarken Playwright kaydırıyor; sticky header
     bölümün üstüne biniyor ve ölçtüğümüz bölümle ilgisi olmayan bir
     fark üretiyor (ör. mobil menü farkı ürün kartının üstünde çıkıyordu).
     `visibility` kullanılıyor — düzen korunur, yalnız boyama durur. */
  if (!sel.trim().startsWith("header") && sel !== "@tamsayfa") {
    await page.evaluate(() => {
      const h = document.querySelector("header");
      if (h) h.style.visibility = "hidden";
    });
  }

  /* Harita iframe'ini gizle. İçeriği Google'dan geliyor; iki sayfada farklı
     hızda yükleniyor ve karoları hiç aynı olmuyor — ölçülebilir bir şey değil.
     Haritanın kutusu, src'si ve filtresi ayrıca tests/e2e/harita.js ile
     doğrulanıyor. */
  await page.evaluate(() => {
    document.querySelectorAll("iframe").forEach((f) => {
      f.style.visibility = "hidden";
    });
  });

  await page.waitForTimeout(600);
  if (sel === "@tamsayfa") {
    await page.screenshot({ path: dosya, fullPage: true });
    const b = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    return b;
  }

  const el = await page.$(sel);
  if (!el) throw new Error(`Seçici bulunamadı: ${sel} (${url})`);
  await el.screenshot({ path: dosya });
  return el.boundingBox();
}

(async () => {
  fs.mkdirSync(CIKTI, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  const sonuclar = [];

  for (const w of genislikler) {
    const ctx = await browser.newContext({
      /* Yüksek viewport: yakalanacak bölüm kaydırmadan tamamen görünsün.
         Kesirli konumdaki öğeler (ör. 390px'te hero logosu y=500,61)
         farklı kaydırma ofsetlerinde farklı alt piksel ızgarasına oturup
         sahte fark üretiyordu. */
      viewport: { width: w, height: 2000 },
      deviceScaleFactor: 2,
      locale: "tr-TR",
      timezoneId: "Europe/Istanbul",
    });
    await ctx.clock.setFixedTime(SAAT);
    const page = await ctx.newPage();

    const refDosya = `${CIKTI}/${w}-tasarim.png`;
    const uygDosya = `${CIKTI}/${w}-uygulama.png`;

    const refKutu = await yakala(page, TASARIM, secici, refDosya);
    const uygKutu = await yakala(page, UYGULAMA, secici, uygDosya);

    sonuclar.push({
      w,
      refDosya,
      uygDosya,
      refKutu: { g: Math.round(refKutu.width), y: Math.round(refKutu.height) },
      uygKutu: { g: Math.round(uygKutu.width), y: Math.round(uygKutu.height) },
    });
    await ctx.close();
  }

  await browser.close();

  // Piksel karşılaştırmasını Python/PIL yapar
  const res = spawnSync(
    "python3",
    [path.join(__dirname, "diff.py"), JSON.stringify(sonuclar), CIKTI, String(altKirp)],
    { encoding: "utf8" },
  );
  process.stdout.write(res.stdout ?? "");
  if (res.stderr) process.stderr.write(res.stderr);
  process.exit(res.status ?? 1);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
