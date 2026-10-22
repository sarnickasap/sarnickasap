/* Ürün sekmeleri: filtreleme, aria durumları, stok dışı davranışı.

   ÖNEMLİ — sabit ürün sayısı YAZMA. Fiyat/ürün listesini kullanıcı
   yönetiyor; her ekleme bu testi kırıyordu (19→20 yanlış alarmı).
   Sayılar artık sayfanın kendisinden türetiliyor; test ilişkileri
   doğruluyor, içeriği değil. */
const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};
(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const p=await (await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR"})).newPage();
  await p.goto("http://localhost:3100/",{waitUntil:"networkidle"});

  const sekmeler=p.locator('#urunler [role=group] button');
  const kartlar=p.locator('#urunler .grid > div');
  const n=await sekmeler.count();
  ok(n>=2, `Tümü + en az 1 kategori sekmesi — bulunan ${n}`);
  ok(await sekmeler.first().getAttribute("aria-pressed")==="true", 'Varsayılan "Tümü" seçili');

  const tumu=await kartlar.count();
  ok(tumu>0, `Tümü → ${tumu} ürün`);

  // Her kategoriyi gez: toplamları Tümü'ye eşit olmalı, aria tek seçili kalmalı
  let toplam=0, ariaSorun=0;
  for (let i=1;i<n;i++){
    await sekmeler.nth(i).click();
    await p.waitForTimeout(200);
    const ad=(await sekmeler.nth(i).textContent()).trim();
    const adet=await kartlar.count();
    toplam+=adet;
    if (await sekmeler.nth(i).getAttribute("aria-pressed")!=="true") ariaSorun++;
    if (await sekmeler.first().getAttribute("aria-pressed")!=="false") ariaSorun++;
    ok(adet<=tumu, `${ad} → ${adet} ürün (≤ ${tumu})`);
  }
  ok(toplam===tumu, `Kategori toplamları Tümü'ye eşit (${toplam} = ${tumu})`);
  ok(ariaSorun===0, `aria-pressed her sekmede tek seçili (${ariaSorun} sapma)`);

  // Stok dışı ürünlerde ok butonu olmamalı — ilişki testi, sabit sayı değil
  await sekmeler.first().click();
  await p.waitForTimeout(200);
  ok(await kartlar.count()===tumu, "Tümü'ye dönünce ürün sayısı aynı");
  const tukendi=await p.locator('#urunler .grid >> text=Tükendi').count();
  const oklar=await p.locator('#urunler .grid a[href^="https://wa.me"]').count();
  ok(oklar===tumu-tukendi,
     `Ok butonu yalnızca stoktaki üründe: ${tumu} ürün − ${tukendi} tükendi = ${oklar} ok`);

  // WhatsApp mesajı birebir mi — ürün adı karttan okunuyor
  if (oklar>0){
    const kart=p.locator('#urunler .grid > div').filter({has:p.locator('a[href^="https://wa.me"]')}).first();
    // h3 → ürün adı. (Kartın ilk span'i kategori etiketi; onu alma.)
    const ad=(await kart.locator("h3").first().textContent()).trim();
    const href=decodeURIComponent(await kart.locator('a[href^="https://wa.me"]').getAttribute("href"));
    ok(href.includes(`Merhaba, ${ad} almak istiyorum. Miktar: `),
       `Mesaj metni birebir: ${href.split("text=")[1]}`);
  }

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
