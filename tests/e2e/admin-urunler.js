const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

async function giris(p){
  await p.goto(B+"/yonetim",{waitUntil:"networkidle"});
  if(p.url().includes("giris")){
    await p.fill("input[name=email]",process.env.ADMIN_EMAIL);
    await p.fill("input[name=password]",process.env.ADMIN_PW);
    await p.click("button[type=submit]");
    await p.waitForURL(u=>!u.toString().includes("giris"),{timeout:20000});
  }
  await p.waitForSelector("header",{timeout:20000});
  await p.waitForTimeout(800);
}

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const ctx=await br.newContext({viewport:{width:1280,height:1200},locale:"tr-TR"});
  const p=await ctx.newPage();
  await giris(p);

  const satirlar=p.locator("main .rounded-12 > div").filter({has:p.locator("input")});
  ok(await satirlar.count()===19, `19 ürün satırı (${await satirlar.count()})`);
  ok((await p.locator("header").innerText()).includes("Otomatik kayıt açık"), "Başlangıç durumu: Otomatik kayıt açık");

  // Arama — Türkçe duyarlı
  await p.fill('input[placeholder="Ürün ara"]',"KUZU");
  await p.waitForTimeout(300);
  ok(await satirlar.count()===5, `"KUZU" araması → 5 ürün: pirzola, but, kol, şiş, ciğer (${await satirlar.count()})`);
  await p.fill('input[placeholder="Ürün ara"]',"ıskembe");
  await p.waitForTimeout(300);
  ok(await satirlar.count()===0, "Eşleşmeyen arama → 0 satır");
  ok((await p.locator("main").innerText()).includes("Eşleşen ürün yok."), "Boş durum metni çıkıyor");
  await p.fill('input[placeholder="Ürün ara"]',"");
  await p.waitForTimeout(300);

  // Kategori filtresi
  await p.selectOption('select[aria-label="Kategoriye göre süz"]',"Tavuk");
  await p.waitForTimeout(300);
  ok(await satirlar.count()===3, `Tavuk filtresi → 3 ürün (${await satirlar.count()})`);
  await p.selectOption('select[aria-label="Kategoriye göre süz"]',"Tümü");
  await p.waitForTimeout(300);

  // Fiyat düzenleme + otomatik kayıt
  const ilkFiyat=p.locator('input[aria-label="Kilo fiyatı"]').first();
  const eski=await ilkFiyat.inputValue();
  await ilkFiyat.fill("999");
  await p.waitForTimeout(1500);
  ok((await p.locator("header").innerText()).match(/Kaydedildi \d{2}:\d{2}/)!==null,
     `Kayıt durumu güncellendi (Kaydedildi HH:MM)`);

  // Sayfayı yenile — kalıcı mı?
  await p.reload({waitUntil:"networkidle"});
  await p.waitForSelector("header"); await p.waitForTimeout(800);
  ok(await p.locator('input[aria-label="Kilo fiyatı"]').first().inputValue()==="999",
     "Fiyat veritabanına yazıldı (yenilemeden sonra duruyor)");

  // Sitede göründü mü (updateTag çalışıyor mu)
  const s=await ctx.newPage();
  await s.goto(B+"/",{waitUntil:"networkidle"});
  ok((await s.locator("#urunler").innerText()).includes("999 ₺"),
     "Değişiklik SİTEDE anında göründü (updateTag)");
  await s.close();

  // Geri al
  await p.locator('input[aria-label="Kilo fiyatı"]').first().fill(eski);
  await p.waitForTimeout(1500);

  // Stok toggle
  const toggle=p.locator('button[aria-pressed]').filter({hasText:/Stokta|Tükendi/}).first();
  const once=await toggle.innerText();
  await toggle.click(); await p.waitForTimeout(800);
  ok(await toggle.innerText()!==once, `Stok toggle çalışıyor (${once} → ${await toggle.innerText()})`);
  await toggle.click(); await p.waitForTimeout(800);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
