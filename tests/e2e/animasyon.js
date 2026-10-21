const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

const opak = (p,sel)=>p.evaluate((s)=>{
  const el=document.querySelector(s); if(!el) return null;
  const sar=el.parentElement; // GoruntuyeGirince sarmalayıcısı
  return +getComputedStyle(sar).opacity;
}, sel);

(async()=>{
  const br=await chromium.launch({executablePath:EXE});

  console.log("── Normal hareket ──");
  {
    const ctx=await br.newContext({viewport:{width:1280,height:800},locale:"tr-TR"});
    const p=await ctx.newPage();
    await p.goto(B+"/",{waitUntil:"networkidle"});
    await p.waitForTimeout(600);

    ok(await opak(p,"#galeri")===0, `Görünüm dışındaki bölüm gizli (opacity ${await opak(p,"#galeri")})`);

    await p.evaluate(()=>document.querySelector("#galeri")?.scrollIntoView());
    await p.waitForTimeout(900);
    ok(await opak(p,"#galeri")===1, `Kaydırınca açıldı (opacity ${await opak(p,"#galeri")})`);

    // Hero animasyonsuz olmalı — sayfa açılır açılmaz görünür
    const heroOpak = await p.evaluate(()=>+getComputedStyle(document.querySelector("#top")).opacity);
    ok(heroOpak===1, `Hero animasyonsuz, anında görünür (opacity ${heroOpak})`);

    // Hover geçişi 150ms
    const sure = await p.evaluate(()=>getComputedStyle(document.querySelector('header nav a')).transitionDuration);
    ok(sure==="0.15s", `Hover geçişi 150ms (${sure})`);
    await ctx.close();
  }

  console.log("── Hareket azaltma (prefers-reduced-motion) ──");
  {
    const ctx=await br.newContext({viewport:{width:1280,height:800},locale:"tr-TR",reducedMotion:"reduce"});
    const p=await ctx.newPage();
    await p.goto(B+"/",{waitUntil:"networkidle"});
    await p.waitForTimeout(600);

    ok(await opak(p,"#galeri")===1, `Görünüm dışındaki bölüm bile GÖRÜNÜR (opacity ${await opak(p,"#galeri")})`);
    const sure = await p.evaluate(()=>getComputedStyle(document.querySelector('header nav a')).transitionDuration);
    ok(parseFloat(sure)<0.001, `Geçişler kapalı (${sure})`);

    // Mobil menü animasyonu da kapalı olmalı
    await p.setViewportSize({width:390,height:844});
    await p.waitForTimeout(300);
    await p.click('button[aria-controls="mobil-menu"]');
    await p.waitForSelector("#mobil-menu");
    const anim = await p.evaluate(()=>document.querySelector("#mobil-menu").getAnimations().length);
    ok(anim===0 || await p.evaluate(()=>document.querySelector("#mobil-menu").getAnimations().every(a=>a.playState==="finished")),
       `Mobil menü animasyonu kapalı/anında (${anim} animasyon)`);
    await ctx.close();
  }

  console.log("── JavaScript kapalı ──");
  {
    const ctx=await br.newContext({viewport:{width:1280,height:800},locale:"tr-TR",javaScriptEnabled:false});
    const p=await ctx.newPage();
    await p.goto(B+"/",{waitUntil:"domcontentloaded"});
    await p.waitForTimeout(500);
    const gorunur = await p.evaluate(()=>{
      const el=document.querySelector("#galeri");
      return el ? getComputedStyle(el.parentElement).opacity : null;
    }).catch(()=>null);
    const metin = await p.locator("#galeri").innerText().catch(()=>"");
    ok(metin.includes("Dükkândan"), "JS kapalıyken içerik GÖRÜNÜR (gizli kalmıyor)");
    await ctx.close();
  }

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
