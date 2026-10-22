const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const ctx=await br.newContext({viewport:{width:1280,height:1400},locale:"tr-TR"});
  const p=await ctx.newPage();
  await paneleGir(p, B, k);
  await p.waitForSelector("header");
  /* Yumuşak geçişte giriş sayfası bir süre DOM'da kalabiliyor; panel tek
     <main> olarak oturana kadar bekle (yoksa seçiciler iki öğe buluyor). */
  await p.waitForFunction(() => document.querySelectorAll("main").length === 1,
    null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);

  await p.evaluate(()=>{const b=[...document.querySelectorAll("aside button")].find(x=>x.textContent?.trim().startsWith("SEO")); if (b) b.click();});
  await p.waitForTimeout(600);

  const main=()=>p.locator("main").innerText();
  ok(/google/i.test(await main()), "SEO sekmesi ve önizleme açıldı");

  const baslik=p.locator('main input').first();
  const eski=await baslik.inputValue();
  ok(eski.length>0, `Mevcut başlık yüklendi: "${eski.slice(0,40)}…"`);
  ok((await main()).includes(`${eski.length} / 60 karakter`), "Karakter sayacı doğru");

  // Önizleme canlı mı
  await baslik.fill("Sarnıç Kasap — test başlığı");
  await p.waitForTimeout(300);
  ok((await main()).includes("Sarnıç Kasap — test başlığı"), "Önizleme anında güncelleniyor");

  // Sınır aşımı uyarısı
  await baslik.fill("x".repeat(70));
  await p.waitForTimeout(300);
  ok((await main()).includes("Google kırpabilir"), "Sınır aşımı uyarısı çıkıyor");

  // Kaydedildi mi — sabit metin DEĞİL, testin kendi işareti
  const DENEME="TEST—SEO başlığı denemesi";
  await baslik.fill(DENEME);
  await p.waitForTimeout(2000);
  ok((await p.locator("header").innerText()).match(/Kaydedildi \d{2}:\d{2}/)!==null, "Otomatik kayıt tetiklendi");

  const seoAc=async()=>{ await p.reload({waitUntil:"networkidle"}); await p.waitForSelector("header");
    await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
    await p.waitForTimeout(500);
    await p.evaluate(()=>{const b=[...document.querySelectorAll("aside button")].find(x=>x.textContent?.trim().startsWith("SEO")); if (b) b.click();});
    await p.waitForTimeout(700); };

  await seoAc();
  ok(await p.locator('main input').first().inputValue()===DENEME, "Veritabanına yazıldı");

  /* ── GERİ AL ve DOĞRULA ──
     Eskiden geri alma sabit 1800 ms bekliyor ve HİÇ doğrulanmıyordu.
     Tutmazsa kullanıcının SEO başlığı test metniyle — ya da bir adım önceki
     70 karakterlik "xxx…" ile — canlıda kalırdı. Üç deneme hakkı var. */
  let geri=null;
  for (let d=1; d<=3; d++){
    await p.locator('main input').first().fill(eski);
    await p.waitForTimeout(2200);
    await seoAc();
    geri=await p.locator('main input').first().inputValue();
    if (geri===eski) break;
  }
  ok(geri===eski, `GERİ ALMA DOĞRULANDI: başlık "${(geri??"").slice(0,42)}…"`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
