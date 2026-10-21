const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};
(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const p=await (await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR"})).newPage();
  await p.goto("http://localhost:3100/",{waitUntil:"networkidle"});

  const sekmeler=p.locator('#urunler [role=group] button');
  const kartlar=p.locator('#urunler .grid > div');
  ok(await sekmeler.count()===8, `8 sekme (Tümü + 7 kategori) — bulunan ${await sekmeler.count()}`);
  ok(await sekmeler.first().getAttribute("aria-pressed")==="true", 'Varsayılan "Tümü" seçili');
  ok(await kartlar.count()===19, `Tümü → 19 ürün (${await kartlar.count()})`);

  await sekmeler.nth(1).click();  // Dana
  await p.waitForTimeout(200);
  ok(await kartlar.count()===4, `Dana → 4 ürün (${await kartlar.count()})`);
  ok(await sekmeler.nth(1).getAttribute("aria-pressed")==="true", "Dana aria-pressed=true");
  ok(await sekmeler.first().getAttribute("aria-pressed")==="false", "Tümü aria-pressed=false");

  await sekmeler.nth(3).click(); // Tavuk
  await p.waitForTimeout(200);
  ok(await kartlar.count()===3, `Tavuk → 3 ürün (${await kartlar.count()})`);

  // Stok dışı ürün: Kuzu kol
  await sekmeler.nth(2).click(); // Kuzu
  await p.waitForTimeout(200);
  const tukendi=p.locator('#urunler .grid >> text=Tükendi');
  ok(await tukendi.count()===1, `Kuzu'da 1 "Tükendi" rozeti (${await tukendi.count()})`);
  const oklar=p.locator('#urunler .grid a[href^="https://wa.me"]');
  ok(await oklar.count()===2, `Stok dışı üründe ok butonu yok: 3 üründen 2 ok (${await oklar.count()})`);

  // WhatsApp mesajı birebir mi
  const href=await oklar.first().getAttribute("href");
  ok(decodeURIComponent(href).includes("Merhaba, Kuzu pirzola almak istiyorum. Miktar: "),
     `Mesaj metni birebir: ${decodeURIComponent(href).split("text=")[1]}`);

  await p.locator('#urunler [role=group] button').first().click();
  await p.waitForTimeout(200);
  ok(await kartlar.count()===19, "Tümü'ye dönünce 19 ürün");

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
