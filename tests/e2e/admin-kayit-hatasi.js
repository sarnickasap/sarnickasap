/* Başarısız kayıt kullanıcıya GÖRÜNMELİ (K-34).

   Eskiden panelde tek bir `.catch()` yoktu: `void calistir()` ile söz
   ateşlenip unutuluyordu. Sunucu eylemi reddederse (veritabanı erişilemez,
   oturum düşmüş, doğrulama hatası) iyimser arayüz yeni değeri ekranda
   tutuyor, kullanıcı kaydedildi sanıp sayfadan ayrılıyordu.

   Burada kesinti server action POST'ları ağ seviyesinde iptal edilerek
   taklit ediliyor — uygulama koduna test kancası eklenmedi.

   Hatanın TEMİZLENMESİ de sınanıyor: ilk denememde temizlenme her sekmenin
   kendi `.then()` çağrısına bağlıydı ve POST başarısızken bile
   temizlenebiliyordu. Artık yalnızca gerçekten çözülen kayıt temizler. */
const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const ctx=await br.newContext({viewport:{width:1280,height:1200},locale:"tr-TR",reducedMotion:"reduce"});
  const p=await ctx.newPage();
  await paneleGir(p, B, k);

  const durum=async()=>(await p.locator("header").innerText())
    .split("\n").find(x=>/Kaydedildi|Otomatik kayıt|Kaydedilemedi/.test(x)) ?? "(durum yok)";

  /* Zararsız bir alan seçiliyor: ilk ürünün açıklaması. Değeri yedeklenip
     sonunda geri yükleniyor ve geri yükleme DOĞRULANIYOR. */
  const not=p.locator('input[aria-label="Açıklama"]').first();
  const yedek=await not.inputValue();

  // ── 1. Kesintisiz kayıt ──
  await not.fill(yedek+" ");
  await p.waitForTimeout(2500);
  const d1=await durum();
  ok(/Kaydedildi \d{2}:\d{2}/.test(d1), `Kesintisiz kayıt: "${d1}"`);

  // ── 2. Kesinti: server action POST'ları iptal ──
  const kes=(r)=>r.request().method()==="POST" ? r.abort("failed") : r.continue();
  await ctx.route("**", kes);
  await not.fill(yedek+" xx");
  await p.waitForTimeout(3000);
  const d2=await durum();
  ok(/Kaydedilemedi/.test(d2), `Kesintide kullanıcı UYARILIYOR: "${d2}"`);

  // ── 3. Kesinti kalkınca hata temizlenmeli ──
  await ctx.unroute("**", kes);
  await p.waitForTimeout(300);
  await not.fill(yedek);
  await p.waitForTimeout(3500);
  const d3=await durum();
  ok(/Kaydedildi \d{2}:\d{2}/.test(d3), `Bağlantı dönünce hata temizlendi: "${d3}"`);

  // ── 4. Geri yükleme doğrulaması ──
  await p.reload({waitUntil:"networkidle"});
  await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.waitForTimeout(800);
  const son=await p.locator('input[aria-label="Açıklama"]').first().inputValue();
  ok(son===yedek, `GERİ ALMA DOĞRULANDI: açıklama ${JSON.stringify(yedek)} (bulunan ${JSON.stringify(son)})`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
