/* Yorumlar sekmesi: ekleme, alan düzenleme, puan, yayın durumu, silme.

   ⚠️ ÜRETİM veritabanına yazar. Kurallar (bkz. AGENTS.md):
   · eklenen kayıt "TEST—" ön ekli, panelde görülürse kaynağı belli
   · silme kendi kartına kapsamlanır, `.first()` ile konuma dayalı DEĞİL
   · test sonunda silme DOĞRULANIR; doğrulanmazsa test düşer

   Ayrıca sitedeki davranış test edilir: 0 yayındaki yorumda #yorumlar
   bölümü hiç basılmaz (K-15 deseni); yayına alınınca görünmeli. */
const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
const AD="TEST—Mehmet Y.";
const METIN="TEST—Kuşbaşı çok tazeydi, kesim tam istediğim gibi oldu.";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const ctx=await br.newContext({viewport:{width:1280,height:1400},locale:"tr-TR",reducedMotion:"reduce"});
  const p=await ctx.newPage();
  await paneleGir(p, B, k);

  // Sitede başlangıç durumu
  const site=await ctx.newPage();
  await site.goto(B+"/",{waitUntil:"networkidle"});
  const basta=await site.locator("#yorumlar").count();

  await p.evaluate(()=>{const n=(s)=>(s??"").normalize("NFC").trim();
    const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith("Yorumlar")); if(b) b.click();});
  await p.waitForTimeout(600);
  ok((await p.locator("main").innerText()).includes("Müşteri yorumları"), "Yorumlar sekmesi açıldı");

  const kartlar=()=>p.locator('main .rounded-12').filter({has:p.locator('input[aria-label="Müşteri adı"]')});
  const once=await kartlar().count();

  // ── Ekle ──
  await p.locator('main button:has-text("Yorum ekle")').click();
  // Sayı artana kadar bekle — sabit süre Neon gecikmesinde yetmiyordu
  await p.waitForFunction((n)=>document.querySelectorAll('main input[aria-label="Müşteri adı"]').length===n+1,
    once,{timeout:20000}).catch(()=>{});
  ok(await kartlar().count()===once+1, `Yorum eklendi (${once} → ${await kartlar().count()})`);

  /* ⚠️ KONUMA GÖRE HEDEFLEME YASAK (bkz. admin-kampanyalar.js): ekleme
     eylemleri yeni kaydı listenin BAŞINA koyabiliyor. Yeni kart boş adıyla
     bulunur ve tam bir tane olduğu doğrulanır. */
  const bos=p.locator('main .rounded-12').filter({has:p.locator('input[aria-label="Müşteri adı"][value=""]')});
  ok(await bos.count()===1, `Yeni kart boş adıyla tek olarak bulundu (${await bos.count()})`);
  /* Kimlik alanını (ad) ÖNCE yaz, sonra HEMEN kendi değerimize göre
     hedeflemeye geç — `bos` filtresi boş değere bağlı, ad yazılır yazılmaz
     eşleşmeyi kaybediyor (locator tembel, sonraki alan zaman aşımına düşer). */
  await bos.first().locator('input[aria-label="Müşteri adı"]').fill(AD);
  const bizim=()=>p.locator('main .rounded-12').filter({has:p.locator(`input[value="${AD}"]`)});
  await p.waitForFunction((a)=>document.querySelector(`main input[value="${a}"]`)!==null,AD,{timeout:15000}).catch(()=>{});
  ok(await bizim().count()===1, `Kart adla hedeflenebiliyor (${await bizim().count()})`);

  await bizim().locator('textarea[aria-label="Yorum metni"]').fill(METIN);
  await p.waitForTimeout(2000);

  await bizim().locator('select[aria-label="Puan"]').selectOption("4");
  await p.waitForTimeout(1200);

  // ── Kalıcı mı ──
  await p.reload({waitUntil:"networkidle"});
  await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.waitForTimeout(600);
  await p.evaluate(()=>{const n=(s)=>(s??"").normalize("NFC").trim();
    const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith("Yorumlar")); if(b) b.click();});
  await p.waitForTimeout(700);
  ok(await bizim().count()===1, "Yenilemeden sonra yorum duruyor");
  ok(await bizim().locator('textarea[aria-label="Yorum metni"]').inputValue()===METIN, "Yorum metni kaydedildi");
  ok(await bizim().locator('select[aria-label="Puan"]').inputValue()==="4", "Puan 4 olarak kaydedildi");

  // ── Sitede göründü mü (yayındayken) ──
  const durum=await bizim().locator('button[aria-pressed]').innerText();
  if(!/Yayında/.test(durum)){ await bizim().locator('button[aria-pressed]').click(); await p.waitForTimeout(1200); }
  await site.reload({waitUntil:"networkidle"});
  await site.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}});
  await site.waitForTimeout(800);
  ok(await site.locator("#yorumlar").count()===1,
     `Yayındaki yorum bölümü sitede göründü (başta ${basta} bölüm)`);
  ok((await site.locator("#yorumlar").innerText()).includes(AD), "Yorum sahibinin adı sitede");
  const yildiz=await site.locator("#yorumlar").innerText();
  ok(/★{4}(?!★)/.test(yildiz)||yildiz.includes("4"), "4 yıldız sitede yansıdı");

  // ── Gizleyince sitede kaybolmalı ──
  await bizim().locator('button[aria-pressed]').click();
  await p.waitForTimeout(1500);
  await site.reload({waitUntil:"networkidle"});
  await site.waitForTimeout(600);
  ok(!(await site.locator("#yorumlar").innerText().catch(()=>"")).includes(AD),
     "Gizlenince sitede görünmüyor");

  // ── TEMİZLİK: sil ve doğrula ──
  p.on("dialog",d=>d.accept());
  await bizim().locator('button[aria-label="Yorumu sil"]').click();
  await p.waitForTimeout(1800);
  ok(await bizim().count()===0, "Yorum silindi");
  await p.reload({waitUntil:"networkidle"});
  await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.evaluate(()=>{const n=(s)=>(s??"").normalize("NFC").trim();
    const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith("Yorumlar")); if(b) b.click();});
  await p.waitForTimeout(800);
  ok(await p.locator('main input[value^="TEST—"]').count()===0,
     `TEMİZLİK DOĞRULANDI: TEST— yorumu kalmadı (${await p.locator('main input[value^="TEST—"]').count()})`);
  ok(await kartlar().count()===once, `Yorum sayısı başlangıca döndü (${once})`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
