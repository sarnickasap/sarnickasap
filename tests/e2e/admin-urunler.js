const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

/* Otomatik kayıt gecikmeli. SABİT BEKLEME KULLANMA: 1500 ms tek başına
   koşarken yetiyor, tüm takım koşarken (Neon gecikmesi + paralel iş)
   yetmiyordu ve test kararsız oluyordu.
   Üstelik "geri al" adımı erken biterse kullanıcının fiyatı 999 ₺ kalır.
   Bu yüzden başlıktaki damga DEĞİŞENE kadar bekleniyor.

   SINIR: damga yalnızca HH:MM (lib/kaydet.ts) — aynı dakikadaki iki kayıt
   aynı damgayı üretir. Bu yüzden damga, kalıcılık kanıtı DEĞİL; durum
   değişikliklerinde yenileyip veritabanından okuyarak doğrula. */
async function kayitBekle(p, oncekiDamga){
  await p.waitForFunction((eski)=>{
    const m=document.querySelector("header")?.innerText.match(/Kaydedildi \d{2}:\d{2}:?\d{0,2}/);
    return !!m && m[0]!==eski;
  }, oncekiDamga, {timeout:20000}).catch(()=>{});
  const m=(await p.locator("header").innerText()).match(/Kaydedildi \d{2}:\d{2}:?\d{0,2}/);
  return m ? m[0] : null;
}

async function giris(p,k){
  await paneleGir(p, B, k);
  await p.waitForSelector("header",{timeout:20000});
  await p.waitForTimeout(800);
}

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const ctx=await br.newContext({viewport:{width:1280,height:1200},locale:"tr-TR"});
  const p=await ctx.newPage();
  await giris(p,k);

  const satirlar=p.locator("main .rounded-12 > div").filter({has:p.locator("input")});

  /* Sabit ürün sayısı YAZMA — listeyi kullanıcı yönetiyor. Beklenen sayılar
     sayfanın kendisinden türetiliyor (eskiden 19 sabitti ve ürün eklenince
     yanlış alarm veriyordu). */
  const veri=await p.evaluate(()=>
    [...document.querySelectorAll('input[aria-label="Ürün adı"]')].map((i)=>{
      /* Satır = input'un doğrudan ebeveyni. Kategori `select`inin value'su
         kategori KİMLİĞİ (sayı); ad için seçili option'ın metni alınır. */
      const sec=i.parentElement?.querySelector('select[aria-label="Kategori"]');
      return { ad:i.value, kat:sec?.selectedOptions?.[0]?.textContent?.trim() ?? "" };
    }));
  const toplam=veri.length;
  ok(await satirlar.count()===toplam && toplam>0, `${toplam} ürün satırı (${await satirlar.count()})`);
  ok((await p.locator("header").innerText()).includes("Otomatik kayıt açık"), "Başlangıç durumu: Otomatik kayıt açık");

  // Arama — Türkçe duyarlı
  await p.fill('input[placeholder="Ürün ara"]',"KUZU");
  await p.waitForTimeout(300);
  const kuzu=veri.filter(x=>x.ad.toLocaleLowerCase("tr").includes("kuzu")).length;
  ok(await satirlar.count()===kuzu, `"KUZU" araması → ${kuzu} ürün (${await satirlar.count()}) — Türkçe duyarlı`);
  await p.fill('input[placeholder="Ürün ara"]',"ıskembe");
  await p.waitForTimeout(300);
  ok(await satirlar.count()===0, "Eşleşmeyen arama → 0 satır");
  ok((await p.locator("main").innerText()).includes("Eşleşen ürün yok."), "Boş durum metni çıkıyor");
  await p.fill('input[placeholder="Ürün ara"]',"");
  await p.waitForTimeout(300);

  // Kategori filtresi
  await p.selectOption('select[aria-label="Kategoriye göre süz"]',"Tavuk");
  await p.waitForTimeout(300);
  const tavuk=veri.filter(x=>x.kat==="Tavuk").length;
  ok(await satirlar.count()===tavuk && tavuk>0, `Tavuk filtresi → ${tavuk} ürün (${await satirlar.count()})`);
  await p.selectOption('select[aria-label="Kategoriye göre süz"]',"Tümü");
  await p.waitForTimeout(300);

  // Fiyat düzenleme + otomatik kayıt
  const ilkFiyat=p.locator('input[aria-label="Kilo fiyatı"]').first();
  const eski=await ilkFiyat.inputValue();
  await ilkFiyat.fill("999");
  const damga=await kayitBekle(p, null);
  ok(damga!==null, `Kayıt durumu güncellendi (${damga ?? "damga yok"})`);

  // Sayfayı yenile — kalıcı mı?
  await p.reload({waitUntil:"networkidle"});
  await p.waitForSelector("header");
  /* Yumuşak geçişte giriş sayfası bir süre DOM'da kalabiliyor; panel tek
     <main> olarak oturana kadar bekle (yoksa seçiciler iki öğe buluyor). */
  await p.waitForFunction(() => document.querySelectorAll("main").length === 1,
    null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  ok(await p.locator('input[aria-label="Kilo fiyatı"]').first().inputValue()==="999",
     "Fiyat veritabanına yazıldı (yenilemeden sonra duruyor)");

  // Sitede göründü mü (updateTag çalışıyor mu)
  const s=await ctx.newPage();
  await s.goto(B+"/",{waitUntil:"networkidle"});
  ok((await s.locator("#urunler").innerText()).includes("999 ₺"),
     "Değişiklik SİTEDE anında göründü (updateTag)");
  await s.close();

  /* ── Geri al ve DOĞRULA ──
     Üretim veritabanına yazıyoruz; geri alma sessizce başarısız olursa
     kullanıcının fiyatı 999 ₺ kalır. Bu yüzden yenileyip kontrol ediliyor. */
  await p.locator('input[aria-label="Kilo fiyatı"]').first().fill(eski);
  await kayitBekle(p, null);
  await p.reload({waitUntil:"networkidle"});
  await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.waitForTimeout(500);
  const geri=await p.locator('input[aria-label="Kilo fiyatı"]').first().inputValue();
  ok(geri===eski, `GERİ ALMA doğrulandı: fiyat ${eski} ₺ (bulunan ${geri})`);

  /* ── Stok toggle ──
     Durum değişikliğini damgayla doğrulamak YETMİYOR (damga HH:MM, aynı
     dakikada değişmiyor). İki hızlı tıklama sunucuda yarışabiliyor ve
     ikinci yazma birinciyle ezilebiliyor; bir kez `Yeni ürün` bu yüzden
     sitede `Tükendi` kaldı.
     Çözüm: her tıklamadan sonra YENİLEYİP veritabanındaki hâli oku.
     Geri alma tutmazsa tekrar dene — üretim verisi yanlış durumda kalmaz. */
  const stokOku = async () => {
    await p.reload({waitUntil:"networkidle"});
    await p.waitForSelector("header");
    await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
    await p.waitForTimeout(400);
    return (await p.locator('button[aria-pressed]').filter({hasText:/Stokta|Tükendi/}).first().innerText()).trim();
  };
  const stokTikla = async () => {
    await p.locator('button[aria-pressed]').filter({hasText:/Stokta|Tükendi/}).first().click();
    await p.waitForTimeout(1500);
  };

  const ilkStok = await stokOku();
  await stokTikla();
  const degisen = await stokOku();
  ok(degisen !== ilkStok, `Stok toggle veritabanına yazıldı (${ilkStok} → ${degisen})`);

  // Geri al — tutmazsa 2 deneme daha
  let sonStok = degisen;
  for (let i = 1; i <= 3 && sonStok !== ilkStok; i++) {
    await stokTikla();
    sonStok = await stokOku();
  }
  ok(sonStok === ilkStok, `GERİ ALMA doğrulandı: stok "${ilkStok}" (bulunan "${sonStok}")`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
