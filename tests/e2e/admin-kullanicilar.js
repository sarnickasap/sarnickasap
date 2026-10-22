const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const p=await (await br.newContext({viewport:{width:1280,height:1400},locale:"tr-TR"})).newPage();
  await paneleGir(p, B, k);
  await p.waitForSelector("header");
  /* Yumuşak geçişte giriş sayfası bir süre DOM'da kalabiliyor; panel tek
     <main> olarak oturana kadar bekle (yoksa seçiciler iki öğe buluyor). */
  await p.waitForFunction(() => document.querySelectorAll("main").length === 1,
    null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);

  await p.evaluate(()=>{const nn=(s)=>(s??"").normalize("NFC").trim();
    const b=[...document.querySelectorAll("aside button")].find(x=>nn(x.textContent).startsWith("Kullanıcılar")); if (b) b.click();});
  await p.waitForTimeout(600);

  ok((await p.locator("main").innerText()).includes("Yöneticiler"), "Kullanıcılar sekmesi açıldı");
  ok((await p.locator("main").innerText()).includes(k.eposta), "Mevcut hesap listede");
  ok(await p.locator('main :text-is("Siz")').count()===1, "Kendi hesabı 'Siz' olarak işaretli");
  /* Sil butonu yalnızca BAŞKA hesaplarda çıkmalı (kendini silemezsin).
     Eskiden "tek kullanıcı varsa hiç sil butonu yok" diye sabitti; ikinci
     bir yönetici varken bu yanlış. Artık ilişki kontrol ediliyor. */
  const silButon=await p.locator('main button[aria-label*="hesabını sil"]').count();
  ok(!(await p.locator(`main button[aria-label*="${k.eposta}"]`).count()),
     `Kendi hesabında sil butonu yok (${k.eposta})`);
  console.log(`   (listede sil butonu sayısı: ${silButon})`);

  // Şifre hash'i istemciye sızıyor mu?
  const html = await p.content();
  ok(!html.includes("$2b$"), "Şifre hash'i sayfada YOK");

  // Kısa şifreyle ekleme reddedilmeli (sunucu tarafı)
  await p.fill('main input[name=email]','test@ornek.com');
  await p.fill('main input[name=password]','kisa');
  await p.evaluate(()=>{const i=document.querySelector('main input[name=password]'); i.removeAttribute('minLength'); i.removeAttribute('minlength');});
  await p.locator('main form button[type=submit]').first().click();
  await p.waitForTimeout(1500);
  const m1=await p.locator('main [role=alert]').first().textContent().catch(()=>null);
  ok(m1?.includes("12 karakter"), `Kısa şifre reddedildi: ${JSON.stringify(m1)}`);

  // Geçerli kullanıcı ekle
  await p.fill('main input[name=email]','test@ornek.com');
  await p.fill('main input[name=name]','Test Kullanıcı');
  await p.fill('main input[name=password]','GuvenliSifre123!');
  await p.locator('main form button[type=submit]').first().click();
  await p.waitForTimeout(2000);
  ok((await p.locator("main").innerText()).includes("test@ornek.com eklendi"), "Kullanıcı eklendi");

  await p.reload({waitUntil:"networkidle"}); await p.waitForSelector("header"); await p.waitForTimeout(800);
  await p.evaluate(()=>{const nn=(s)=>(s??"").normalize("NFC").trim();
    const b=[...document.querySelectorAll("aside button")].find(x=>nn(x.textContent).startsWith("Kullanıcılar")); if (b) b.click();});
  await p.waitForTimeout(600);
  ok((await p.locator("main").innerText()).includes("test@ornek.com"), "Yenilemeden sonra listede");

  // Aynı e-posta tekrar
  await p.fill('main input[name=email]','test@ornek.com');
  await p.fill('main input[name=password]','BaskaSifre123!');
  await p.locator('main form button[type=submit]').first().click();
  await p.waitForTimeout(1500);
  ok((await p.locator("main").innerText()).includes("zaten kayıtlı"), "Yinelenen e-posta reddedildi");

  /* ── Sil ──
     DİKKAT: burada `.first()` KULLANMA. Bir kez `.first()` ile silindi ve
     listedeki İLK hesap — gerçek yöneticinin hesabı — üretim veritabanından
     uçtu (şifre hash'i geri getirilemedi, hesap yeni şifreyle yeniden
     açılmak zorunda kaldı). Silme her zaman test kendi oluşturduğu
     e-postaya göre hedeflenir. */
  const silHedef=p.locator('main button[aria-label*="test@ornek.com"]');
  ok(await silHedef.count()===1,
     `Sil butonu test hesabına özel hedeflendi (${await silHedef.count()} eşleşme)`);
  if (await silHedef.count()===1){
    p.once("dialog",d=>d.accept());
    await silHedef.click();
    await p.waitForTimeout(1500);
    ok(!(await p.locator("main").innerText()).includes("test@ornek.com"), "Test kullanıcısı silindi");
  }
  ok((await p.locator("main").innerText()).includes(k.eposta),
     "TEMİZLİK SONRASI: yönetici hesabı hâlâ listede");

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
