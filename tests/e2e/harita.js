/* Harita: görünüme yaklaşana kadar yüklenmemeli, kutusu düzen kaydırmamalı. */
const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const ctx=await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR"});
  const p=await ctx.newPage();
  let istek=0, bayt=0;
  p.on("response", r=>{ if(/google/.test(r.url())){ istek++; bayt+=Number(r.headers()["content-length"]||0);} });

  await p.goto(B+"/",{waitUntil:"networkidle"});
  await p.waitForTimeout(1500);
  ok(istek===0, `Açılışta Google'a hiç istek gitmiyor (${istek} istek, ${(bayt/1024).toFixed(0)} KB)`);
  ok(await p.locator("#iletisim iframe").count()===0, "iframe henüz DOM'da yok");

  const kutu = await p.evaluate(()=>{
    const d=document.querySelector("#iletisim")?.querySelectorAll(":scope > div > div");
    const h=[...(d||[])].at(-1);
    const b=h.getBoundingClientRect(); const c=getComputedStyle(h);
    return {h:Math.round(b.height), minH:c.minHeight, r:c.borderRadius, bg:c.backgroundColor};
  });
  ok(kutu.minH==="420px", `Yer tutucu kutusu doğru ölçüde (min-height ${kutu.minH})`);
  ok(kutu.bg==="rgb(23, 23, 23)", `Yer tutucu zemini #171717 (${kutu.bg})`);

  const oncekiYukseklik = await p.evaluate(()=>document.documentElement.scrollHeight);
  await p.evaluate(()=>document.querySelector("#iletisim")?.scrollIntoView());
  await p.waitForTimeout(3000);

  ok(await p.locator("#iletisim iframe").count()===1, "Kaydırınca iframe eklendi");
  ok(istek>0, `Harita kaynakları kaydırınca yüklendi (${istek} istek, ${(bayt/1024).toFixed(0)} KB)`);
  const sonrakiYukseklik = await p.evaluate(()=>document.documentElement.scrollHeight);
  ok(oncekiYukseklik===sonrakiYukseklik, `Düzen kaymadı (${oncekiYukseklik} → ${sonrakiYukseklik} px)`);

  const src = await p.locator("#iletisim iframe").getAttribute("src");
  ok(decodeURIComponent(src).includes("Gaziemir"), "Harita adresi doğru");

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
