const { chromium } = require("playwright");
const { adminKimligi } = require("./_ortak");
const atlandi = [];
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
  /* reducedMotion: "reduce" ZORUNLU.
     Ölçüm: hareket açıkken kaydırmayla açılan bölümlerin üst öğesi henüz
     opacity:0 oluyor; axe bunu "color-contrast" ihlali olarak bildiriyor.
     Ölçülen örnek: #urunler eyebrow, rengi #e0464e (K-21'de onaylı),
     etkin opaklık 0.000 → sahte ihlal. reduce ile 1.000 ve temiz.
     Bu yüzden sonuç hareket açıkken KARARSIZ (flaky) idi. */
  const ctx=await br.newContext({viewport:{width:1280,height:1000},locale:"tr-TR",reducedMotion:"reduce"});
  const p=await ctx.newPage();
  let n=0;

  await p.goto(B+"/",{waitUntil:"networkidle"});
  // Tüm bölümler yerleşsin ve tembel içerik yüklensin
  await p.evaluate(async()=>{ for(let y=0;y<document.body.scrollHeight;y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,60)); } window.scrollTo(0,0); });
  await p.waitForTimeout(600);
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

  /* Panel taraması kimlik gerektiriyor. Kimlik yoksa ATLA — eskiden burada
     p.fill(undefined) ile çöküyordu ve site taramalarının sonucu hiç
     raporlanmıyordu. */
  const k = adminKimligi();
  if (k) {
    /* Giriş bir kez 20 sn'de yetişmedi ve test TimeoutError ile düştü
       (tek başına koşarken hep geçiyor). Bir tekrar hakkı veriliyor. */
    let girildi = false;
    for (let d = 1; d <= 2 && !girildi; d++) {
      await p.goto(B+"/yonetim/giris",{waitUntil:"networkidle"});
      await p.fill("input[name=email]", k.eposta);
      await p.fill("input[name=password]", k.sifre);
      await p.click("button[type=submit]");
      girildi = await p.waitForURL(u=>!u.toString().includes("giris"),{timeout:30000})
        .then(()=>true).catch(()=>false);
      if (!girildi) console.log(`   giriş ${d}. denemede yetişmedi, tekrar deneniyor`);
    }
    if (girildi) {
      await p.waitForSelector("header"); await p.waitForTimeout(800);
      n += await tara(p,"Yönetim paneli");
    } else {
      console.log("   ❌ panele girilemedi"); n += 1;
    }
  } else {
    atlandi.push("Yönetim paneli");
    console.log("\n⏭️  Yönetim paneli ATLANDI — ADMIN_EMAIL / ADMIN_PW yok");
  }

  await p.goto(B+"/olmayan-sayfa",{waitUntil:"networkidle"});
  n += await tara(p,"404");

  await br.close();
  console.log(n ? `\n❌ toplam ${n} ihlal` : "\n✅ Taranan sayfalarda WCAG 2.1 AA ihlali yok");
  if (atlandi.length) console.log(`⏭️  atlanan: ${atlandi.join(", ")}`);
  process.exit(n ? 1 : atlandi.length ? 2 : 0);
})();
