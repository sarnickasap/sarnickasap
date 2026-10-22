/* Kampanyalar sekmesi: ekleme, alan düzenleme, yayın durumu, silme.
   Sitedeki #firsatlar yalnızca YAYINDAKİ fırsatları gösterir (tasarımın
   `deals.filter(x => x.active)` mantığı) — bu da doğrulanıyor.

   ⚠️ ÜRETİM veritabanına yazar: "TEST—" ön eki, kendi kaydına kapsamlı
   silme, sonda silme DOĞRULAMASI. Konuma dayalı silme YASAK (AGENTS.md). */
const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
const BASLIK="TEST—Deneme fırsatı";
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
  const siteBasta=await site.locator("#firsatlar article, #firsatlar .rounded-16").count();

  await sekmeAc(p,"Kampanyalar");
  ok((await p.locator("main").innerText()).includes("Kampanya ve fırsatlar"), "Kampanyalar sekmesi açıldı");

  const kartlar=()=>p.locator('main .rounded-12').filter({has:p.locator('input[aria-label="Fırsat başlığı"]')});
  const once=await kartlar().count();

  await p.locator('main button:has-text("Yeni fırsat")').click();
  // Sayı artana kadar bekle — sabit süre Neon gecikmesinde yetmiyordu
  await p.waitForFunction((n)=>document.querySelectorAll('main input[aria-label="Fırsat başlığı"]').length===n+1,
    once,{timeout:20000}).catch(()=>{});
  ok(await kartlar().count()===once+1, `Fırsat eklendi (${once} → ${await kartlar().count()})`);

  /* ⚠️ KONUMA GÖRE HEDEFLEME YASAK — `nth(once)` ile sona baktığımda
     mevcut bir fırsatın adını değiştirip ONU sildim (iki fırsat üretimden
     uçtu). Sebep: `firsatEkle` yeni kaydı `sort: enKucuk - 1` ile listenin
     BAŞINA ekliyor, sonuna değil.
     Yeni kayıt varsayılan BAŞLIĞIYLA bulunur; tam bir tane olduğu da
     doğrulanır, yoksa yanlış kartı düzenleme riski sürer. */
  const varsayilan=p.locator('main .rounded-12').filter({has:p.locator('input[value="Yeni fırsat"]')});
  ok(await varsayilan.count()===1,
     `Yeni kart varsayılan adıyla tek olarak bulundu (${await varsayilan.count()})`);
  /* Kimlik alanını (başlık) ÖNCE yaz, sonra HEMEN kendi değerimize göre
     hedeflemeye geç. `varsayilan` filtresi "Yeni fırsat" değerine bağlı
     olduğu için başlık değişir değişmez eşleşmeyi kaybediyor; locator
     tembel olduğundan sonraki alanlar zaman aşımına düşüyordu. */
  await varsayilan.first().locator('input[aria-label="Fırsat başlığı"]').fill(BASLIK);
  const bizim=()=>p.locator('main .rounded-12').filter({has:p.locator(`input[value="${BASLIK}"]`)});
  await p.waitForFunction((b)=>document.querySelector(`main input[value="${b}"]`)!==null,BASLIK,{timeout:15000}).catch(()=>{});
  ok(await bizim().count()===1, "Kart başlıkla hedeflenebiliyor");

  await bizim().locator('input[aria-label="Süre"]').fill("TEST—Bu hafta");
  await p.waitForTimeout(250);
  await bizim().locator('input[aria-label="Fırsat açıklaması"]').fill("TEST—otomatik testten geldi");
  await p.waitForTimeout(2200);

  await panelTazele(p,"Kampanyalar");
  ok(await bizim().count()===1, "Yenilemeden sonra fırsat duruyor");
  ok(await bizim().locator('input[aria-label="Süre"]').inputValue()==="TEST—Bu hafta", "Süre kaydedildi");
  ok(await bizim().locator('input[aria-label="Fırsat açıklaması"]').inputValue()==="TEST—otomatik testten geldi", "Açıklama kaydedildi");

  // ── Yayındayken sitede görünmeli ──
  if(!/Yayında/.test(await bizim().locator('button[aria-pressed]').innerText())){
    await bizim().locator('button[aria-pressed]').click(); await p.waitForTimeout(1400); }
  await site.reload({waitUntil:"networkidle"}); await site.waitForTimeout(700);
  ok((await site.locator("#firsatlar").innerText()).includes(BASLIK), "Yayındaki fırsat sitede göründü");

  // ── Gizlenince kaybolmalı ──
  await bizim().locator('button[aria-pressed]').click();
  await p.waitForTimeout(1600);
  await site.reload({waitUntil:"networkidle"}); await site.waitForTimeout(700);
  ok(!(await site.locator("#firsatlar").innerText().catch(()=>"")).includes(BASLIK),
     "Gizlenen fırsat sitede YOK (tasarımın active filtresi)");

  // ── TEMİZLİK ──
  p.on("dialog",d=>d.accept());
  await bizim().locator(`button[aria-label="${BASLIK} fırsatını sil"]`).click();
  await p.waitForTimeout(1800);
  await panelTazele(p,"Kampanyalar");
  ok(await p.locator('main input[value^="TEST—"]').count()===0,
     `TEMİZLİK DOĞRULANDI: TEST— kaydı kalmadı (${await p.locator('main input[value^="TEST—"]').count()})`);
  ok(await kartlar().count()===once, `Fırsat sayısı başlangıca döndü (${once})`);
  await site.reload({waitUntil:"networkidle"}); await site.waitForTimeout(600);
  ok(await site.locator("#firsatlar article, #firsatlar .rounded-16").count()===siteBasta,
     `Sitedeki fırsat sayısı başlangıca döndü (${siteBasta})`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
