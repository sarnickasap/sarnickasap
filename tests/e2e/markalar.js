/* Marka şeridi: yerleşim, akış, hareket azaltma, erişilebilirlik. */
const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  const br=await chromium.launch({executablePath:EXE});

  console.log("── Normal hareket ──");
  {
    const p=await (await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR"})).newPage();
    await p.goto(B+"/",{waitUntil:"networkidle"});
    const sira=await p.evaluate(()=>[...document.querySelectorAll("section[id]")].map(s=>s.id));
    ok(sira.indexOf("markalar")===sira.indexOf("hakkimizda")+1, `Hakkımızda'nın hemen altında: ${sira.join(" → ")}`);

    await p.evaluate(()=>document.querySelector("#markalar")?.scrollIntoView({block:"center"}));
    await p.waitForTimeout(1200);
    const anim=await p.evaluate(()=>{
      const r=document.querySelector(".marka-ray"); const c=getComputedStyle(r);
      return {ad:c.animationName, sure:c.animationDuration, durum:c.animationPlayState};
    });
    ok(anim.ad==="marka-ak", `Akış animasyonu çalışıyor (${anim.ad}, ${anim.sure})`);

    // 5 logo × 2 kopya
    const toplam=await p.locator("#markalar li").count();
    const gizli=await p.locator("#markalar li[aria-hidden='true']").count();
    ok(toplam===10 && gizli===5, `Liste iki kez basılı, kopya gizli (${toplam} öğe, ${gizli} gizli)`);

    // Ekran okuyucu tek liste görüyor mu
    const altlar=await p.evaluate(()=>[...document.querySelectorAll("#markalar img")].map(i=>i.alt).filter(Boolean));
    ok(altlar.length===5, `Ekran okuyucu 5 marka adı görüyor (${altlar.length}): ${altlar.slice(0,2).join(", ")}…`);

    // Fare üstünde duruyor mu
    await p.hover("#markalar .marka-serit");
    await p.waitForTimeout(400);
    const durdu=await p.evaluate(()=>getComputedStyle(document.querySelector(".marka-ray")).animationPlayState);
    ok(durdu==="paused", `Fare üstündeyken duruyor (${durdu})`);
    await p.context().close();
  }

  console.log("── Hareket azaltma ──");
  {
    const p=await (await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR",reducedMotion:"reduce"})).newPage();
    await p.goto(B+"/",{waitUntil:"networkidle"});
    await p.evaluate(()=>document.querySelector("#markalar")?.scrollIntoView({block:"center"}));
    await p.waitForTimeout(800);
    const d=await p.evaluate(()=>{
      const r=document.querySelector(".marka-ray"); const c=getComputedStyle(r);
      const kopya=document.querySelector("#markalar li[aria-hidden='true']");
      return {ad:c.animationName, sarma:c.flexWrap, kopyaGorunur:kopya?getComputedStyle(kopya).display:"yok"};
    });
    ok(d.ad==="none", `Akış kapalı (${d.ad})`);
    ok(d.sarma==="wrap", `Logolar sarmalı ızgaraya döndü (${d.sarma})`);
    ok(d.kopyaGorunur==="none", `Kopyalar gizlendi (${d.kopyaGorunur})`);
    // Hepsi görünür mü
    const gorunur=await p.locator("#markalar li:visible").count();
    ok(gorunur===5, `5 logonun hepsi görünür (${gorunur})`);
    await p.context().close();
  }

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
