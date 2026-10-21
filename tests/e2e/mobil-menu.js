const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const ctx=await br.newContext({viewport:{width:390,height:844},locale:"tr-TR"});
  const p=await ctx.newPage();
  await p.goto(B,{waitUntil:"networkidle"});

  /* Masaüstü nav bağlantı sayısını çekmece AÇILMADAN say: çekmece de
     <header> içinde render ediliyor, açıkken seçici ikisini birden sayıyor. */
  const masaustu = await p.evaluate(() =>
    document.querySelectorAll("header nav a").length);

  const dugme=p.locator('button[aria-controls="mobil-menu"]');
  ok(await dugme.isVisible(), "390px: hamburger görünür");
  ok(await dugme.getAttribute("aria-expanded")==="false", "aria-expanded=false");
  ok(!(await p.locator("header nav").first().isVisible()), "Masaüstü nav gizli");

  await dugme.click();
  const panel=p.locator("#mobil-menu");
  await panel.waitFor({state:"visible"});
  ok(await panel.getAttribute("role")==="dialog" && await panel.getAttribute("aria-modal")==="true", "role=dialog + aria-modal");
  /* Çekmecedeki bağlantı sayısı masaüstü nav'ıyla aynı olmalı.
     Sabit 6 yazılmıyor: Fırsatlar ve Yorumlar veri yoksa gizleniyor (K-08). */
  const cekmece = await panel.locator("nav a").count();
  ok(cekmece === masaustu && cekmece > 0,
     `Çekmece ve masaüstü nav aynı bağlantıları gösteriyor (${cekmece})`);
  ok(await p.evaluate(()=>getComputedStyle(document.body).overflow)==="hidden", "Gövde kaydırma kilitli");

  const odak=async()=>p.evaluate(()=>document.activeElement?.textContent?.trim()||document.activeElement?.getAttribute("aria-label"));
  ok((await odak())==="Menüyü kapat", `Açılışta odak panelde (${await odak()})`);

  // Odak tuzağı: son öğeden Tab -> ilk öğeye dönmeli
  for(let i=0;i<7;i++) await p.keyboard.press("Tab");
  const icerde=await p.evaluate(()=>document.querySelector("#mobil-menu")?.contains(document.activeElement));
  ok(icerde, "Tab turu panelin içinde kalıyor (odak tuzağı)");

  await p.keyboard.press("Escape");
  await panel.waitFor({state:"detached"});
  ok(true, "Escape ile kapanıyor");
  ok(await p.evaluate(()=>getComputedStyle(document.body).overflow)!=="hidden", "Kaydırma kilidi kalktı");
  ok((await odak())==="Menüyü aç", `Odak düğmeye döndü (${await odak()})`);

  // Bağlantıya tıklayınca kapanmalı
  await dugme.click(); await panel.waitFor({state:"visible"});
  await panel.locator('a[href="#urunler"]').click();
  await panel.waitFor({state:"detached"});
  ok(true, "Bağlantı tıklanınca kapanıyor");

  // 768px'e genişleyince kapanmalı
  await dugme.click(); await panel.waitFor({state:"visible"});
  await p.setViewportSize({width:1280,height:900});
  await panel.waitFor({state:"detached",timeout:5000}).catch(()=>{});
  ok(await panel.count()===0, "Masaüstüne geçince menü kapanıyor");
  ok(await p.locator("header nav").first().isVisible(), "1280px: masaüstü nav görünür");
  ok(!(await dugme.isVisible()), "1280px: hamburger gizli");

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti");
  process.exit(f?1:0);
})();
