const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};
const ADLAR=["Ege Et","Anadolu Besi","Trakya Çiftlik","Marmara Süt","Toros Baharat"];

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const p=await (await br.newContext({viewport:{width:1280,height:1400},locale:"tr-TR"})).newPage();
  await p.goto(B+"/yonetim",{waitUntil:"networkidle"});
  if(p.url().includes("giris")){
    await p.fill("input[name=email]",process.env.ADMIN_EMAIL);
    await p.fill("input[name=password]",process.env.ADMIN_PW);
    await p.click("button[type=submit]");
    await p.waitForURL(u=>!u.toString().includes("giris"),{timeout:20000});
  }
  await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.waitForTimeout(600);

  await p.evaluate(()=>{const n=(s)=>(s??"").normalize("NFC").trim();
    const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith("Markalar")); if(b) b.click();});
  await p.waitForTimeout(600);
  ok((await p.locator("main").innerText()).includes("Çalıştığımız üreticiler"), "Markalar sekmesi açıldı");

  const kart=()=>p.locator('main .grid > div');
  for (let i=0;i<ADLAR.length;i++){
    await p.locator('main button:has-text("Marka ekle")').click();
    await p.waitForTimeout(900);
    const son=kart().nth(i);
    await son.locator('input[aria-label="Marka adı"]').fill(ADLAR[i]);
    await p.waitForTimeout(100);
    await son.locator('input[type=file]').setInputFiles(`/tmp/logolar/${i}.png`);
    await p.waitForTimeout(2500);
  }
  ok(await kart().count()===5, `5 marka eklendi (${await kart().count()})`);
  const logolar = await p.locator('main .grid img').count();
  ok(logolar===5, `5 logo yüklendi (${logolar})`);
  const src = await p.locator('main .grid img').first().getAttribute('src');
  ok(src?.includes("blob.vercel-storage.com"), `Logo Vercel Blob'da: ${src?.slice(0,50)}…`);

  await p.waitForTimeout(1500);
  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
