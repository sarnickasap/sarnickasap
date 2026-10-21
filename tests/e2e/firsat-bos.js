/* Aktif fırsat yoksa: bölüm hiç render edilmemeli, nav linki de gizlenmeli.
   Tasarımda bölüm kayboluyordu ama link kalıp ölü bağlantı oluyordu (K-08). */
const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};
(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const p=await (await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR"})).newPage();
  await p.goto("http://localhost:3100/",{waitUntil:"networkidle"});

  const varmi = await p.locator("#firsatlar").count();
  const navFirsat = await p.locator('header nav a[href="#firsatlar"]').count();

  if (process.env.BOS === "1") {
    ok(varmi===0, `Fırsat yokken bölüm render edilmiyor (bulunan: ${varmi})`);
    ok(navFirsat===0, `Fırsat yokken nav linki gizli (bulunan: ${navFirsat})`);
    ok((await p.locator("header nav a").count())===5, "Nav 5 bağlantı gösteriyor");
  } else {
    ok(varmi===1, "Fırsat varken bölüm render ediliyor");
    ok(navFirsat===1, "Fırsat varken nav linki var");
    ok((await p.locator("#firsatlar .grid > div").count())===3, "3 fırsat kartı");
    const pil = await p.locator("#firsatlar .grid span").first().textContent();
    ok(pil==="Pazar akşamına kadar", `İlk pilin metni: ${JSON.stringify(pil)}`);
  }
  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
