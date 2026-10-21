const { chromium } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";

async function tara(p, etiket) {
  const r = await new AxeBuilder({ page: p })
    .withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"])
    .analyze();
  const ihlal = r.violations;
  console.log(`\n── ${etiket} ──`);
  if (!ihlal.length) { console.log("  ✅ ihlal yok"); return 0; }
  for (const v of ihlal) {
    console.log(`  ❌ [${v.impact}] ${v.id}: ${v.help}`);
    v.nodes.slice(0,2).forEach(n=>console.log(`       ${n.target.join(" ")}`));
  }
  return ihlal.length;
}

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const ctx=await br.newContext({viewport:{width:1280,height:1000},locale:"tr-TR"});
  const p=await ctx.newPage();
  let n=0;

  await p.goto(B+"/",{waitUntil:"networkidle"});
  n += await tara(p,"Site (masaüstü)");

  await p.setViewportSize({width:390,height:844});
  await p.waitForTimeout(400);
  await p.click('button[aria-controls="mobil-menu"]');
  await p.waitForSelector("#mobil-menu");
  /* Açılış animasyonu bitsin (opacity 0→1, 200ms). Yarıda taranırsa
     axe kısmi saydamlığı düşük kontrast sanıyor. */
  await p.waitForFunction(() => {
    const el = document.querySelector("#mobil-menu");
    return el && el.getAnimations().every((a) => a.playState === "finished");
  }, null, { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(300);
  n += await tara(p,"Mobil menü açık");
  await p.keyboard.press("Escape");
  await p.setViewportSize({width:1280,height:1000});

  await p.goto(B+"/yonetim/giris",{waitUntil:"networkidle"});
  n += await tara(p,"Giriş sayfası");

  await p.fill("input[name=email]",process.env.ADMIN_EMAIL);
  await p.fill("input[name=password]",process.env.ADMIN_PW);
  await p.click("button[type=submit]");
  await p.waitForURL(u=>!u.toString().includes("giris"),{timeout:20000});
  await p.waitForSelector("header"); await p.waitForTimeout(800);
  n += await tara(p,"Yönetim paneli");

  await p.goto(B+"/olmayan-sayfa",{waitUntil:"networkidle"});
  n += await tara(p,"404");

  await br.close();
  console.log(n ? `\n❌ toplam ${n} ihlal` : "\n✅ Hiçbir sayfada WCAG 2.1 AA ihlali yok");
  process.exit(n?1:0);
})();
