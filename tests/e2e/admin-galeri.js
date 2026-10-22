/* Galeri sekmesi: ekleme, alt yazı, görsel bağlantısı, silme.
   Sitede URL'i olmayan öğe YER TUTUCU olarak çıkar (tasarım deseni) —
   URL girilince gerçek <img> olmalı.

   ⚠️ ÜRETİM veritabanına yazar: "TEST—" ön eki, kendi kaydına kapsamlı
   silme, sonda silme DOĞRULAMASI. Konuma dayalı silme YASAK (AGENTS.md). */
const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
const ALT="TEST—Vitrin denemesi";
/* 1×1 saydam PNG — dış ağa çıkmadan gerçek bir görsel kaynağı. */
const GORSEL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

const sekmeAc=async(p,ad)=>{ await p.evaluate((h)=>{const n=(s)=>(s??"").normalize("NFC").trim();
  const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith(h)); if(b) b.click();},ad);
  await p.waitForTimeout(700); };
const panelTazele=async(p,ad)=>{ await p.reload({waitUntil:"networkidle"}); await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.waitForTimeout(500); await sekmeAc(p,ad); };

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const ctx=await br.newContext({viewport:{width:1280,height:1400},locale:"tr-TR",reducedMotion:"reduce"});
  const p=await ctx.newPage();
  await paneleGir(p, B, k);
  const site=await ctx.newPage();
  await site.goto(B+"/",{waitUntil:"networkidle"});
  const figurBasta=await site.locator("#galeri figure").count();
  const imgBasta=await site.locator("#galeri img").count();

  await sekmeAc(p,"Galeri");
  ok((await p.locator("main").innerText()).includes("Galeri"), "Galeri sekmesi açıldı");

  const kartlar=()=>p.locator('main .rounded-12').filter({has:p.locator('input[aria-label="Alt yazı"]')});
  const once=await kartlar().count();
  ok(once===figurBasta, `Panel ve site aynı öğe sayısında (${once} = ${figurBasta})`);

  await p.locator('main button:has-text("Görsel ekle")').click();
  await p.waitForFunction((n)=>document.querySelectorAll('main input[aria-label="Alt yazı"]').length===n+1,
    once,{timeout:20000}).catch(()=>{});
  ok(await kartlar().count()===once+1, `Görsel eklendi (${once} → ${await kartlar().count()})`);

  /* ⚠️ KONUMA GÖRE HEDEFLEME YASAK (bkz. admin-kampanyalar.js). */
  const bos=p.locator('main .rounded-12').filter({has:p.locator('input[aria-label="Alt yazı"][value=""]')});
  ok(await bos.count()===1, `Yeni kart boş alt yazısıyla tek olarak bulundu (${await bos.count()})`);
  const yeni=bos.first();
  await yeni.locator('input[aria-label="Alt yazı"]').fill(ALT);
  await p.waitForTimeout(1800);
  const bizim=()=>p.locator('main .rounded-12').filter({has:p.locator(`input[value="${ALT}"]`)});
  ok(await bizim().count()===1, "Kart alt yazıyla hedeflenebiliyor");

  // URL yokken panelde "görsel yok" yer tutucusu
  ok((await bizim().innerText()).includes("görsel yok"), "URL yokken panelde yer tutucu");

  // ── Sitede yer tutucu olarak çıkmalı ──
  await site.reload({waitUntil:"networkidle"});
  await site.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}});
  await site.waitForTimeout(700);
  ok(await site.locator("#galeri figure").count()===figurBasta+1,
     `Sitede öğe sayısı arttı (${figurBasta} → ${await site.locator("#galeri figure").count()})`);
  ok(await site.locator("#galeri img").count()===imgBasta,
     `URL'siz öğe <img> üretmiyor, yer tutucu kalıyor (${await site.locator("#galeri img").count()})`);

  // ── URL girilince gerçek görsel olmalı ──
  await bizim().locator('input[aria-label="Görsel bağlantısı"]').fill(GORSEL);
  await p.waitForTimeout(2000);
  await panelTazele(p,"Galeri");
  ok(await bizim().locator("img").count()===1, "Panelde önizleme görseli çıktı");

  await site.reload({waitUntil:"networkidle"});
  await site.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}});
  await site.waitForTimeout(800);
  ok(await site.locator("#galeri img").count()===imgBasta+1,
     `Sitede gerçek <img> oluştu (${imgBasta} → ${await site.locator("#galeri img").count()})`);
  const alt=await site.locator("#galeri img").last().getAttribute("alt");
  ok(alt===ALT, `Alt yazı <img alt> olarak kullanıldı: ${JSON.stringify(alt)}`);

  // ── TEMİZLİK ──
  p.on("dialog",d=>d.accept());
  await bizim().locator('button[aria-label="Görseli sil"]').click();
  await p.waitForTimeout(1800);
  await panelTazele(p,"Galeri");
  ok(await p.locator('main input[value^="TEST—"]').count()===0,
     `TEMİZLİK DOĞRULANDI: TEST— kaydı kalmadı (${await p.locator('main input[value^="TEST—"]').count()})`);
  ok(await kartlar().count()===once, `Öğe sayısı başlangıca döndü (${once})`);
  await site.reload({waitUntil:"networkidle"}); await site.waitForTimeout(700);
  ok(await site.locator("#galeri figure").count()===figurBasta, `Sitede de başlangıca döndü (${figurBasta})`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
