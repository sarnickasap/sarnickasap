/* Toplu fiyat sekmesi: kategori süzme, önizleme, yuvarlama, uygulama.

   ⚠️ EN RİSKLİ TEST — bir kategorideki TÜM fiyatları değiştirir ve bunlar
   doğrudan canlı sitede görünür. Desen:
     1. hedef kategorinin fiyatları ANLIK GÖRÜNTÜye alınır
     2. önizlemedeki "eski → yeni" okunur (beklenen değer buradan gelir,
        hesabı testte YENİDEN YAZMAK yanlış olur — iki taraf da yanılırsa
        test hatayı göremez; önizleme ayrıca UI sözleşmesi)
     3. uygulanır, veritabanına yazıldığı yenilemeyle doğrulanır
     4. Ürünler sekmesinden tek tek GERİ YÜKLENİR
     5. geri yükleme YENİLENEREK doğrulanır — tutmazsa test düşer

   Küçük bir kategori seçilir ki geri yükleme az alan tutsun. */
const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
const YUZDE="10";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

const sekmeAc=async(p,ad)=>{ await p.evaluate((h)=>{const n=(s)=>(s??"").normalize("NFC").trim();
  const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith(h)); if(b) b.click();},ad);
  await p.waitForTimeout(800); };
const panelTazele=async(p,ad)=>{ await p.reload({waitUntil:"networkidle"}); await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.waitForTimeout(500); await sekmeAc(p,ad); };

/** Ürünler sekmesindeki ad → fiyat eşlemesi. */
const fiyatlariOku=(p)=>p.evaluate(()=>Object.fromEntries(
  [...document.querySelectorAll('input[aria-label="Ürün adı"]')].map(i=>[
    i.value, i.parentElement?.querySelector('input[aria-label="Kilo fiyatı"]')?.value ?? null])));

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const ctx=await br.newContext({viewport:{width:1280,height:1600},locale:"tr-TR",reducedMotion:"reduce"});
  const p=await ctx.newPage();
  await paneleGir(p, B, k);

  // ── 1. ANLIK GÖRÜNTÜ (Ürünler sekmesi) ──
  await sekmeAc(p,"Ürünler");
  const yedek=await fiyatlariOku(p);
  ok(Object.keys(yedek).length>0, `${Object.keys(yedek).length} ürünün fiyatı yedeklendi`);

  await sekmeAc(p,"Toplu fiyat");
  ok((await p.locator("main").innerText()).includes("Toplu fiyat güncelleme"), "Toplu fiyat sekmesi açıldı");

  // En AZ ürünlü kategoriyi seç — geri yükleme yükü en küçük olsun
  const secici=p.locator("main label").filter({hasText:"Kategori"}).locator("select");
  const kategoriler=await secici.locator("option").allTextContents();
  let hedefKat=null, enAz=Infinity;
  for (const c of kategoriler.filter(x=>x!=="Tümü")) {
    await secici.selectOption(c); await p.waitForTimeout(350);
    const n=await p.locator('main .rounded-12').last().locator("> div").count();
    if (n-1>0 && n-1<enAz) { enAz=n-1; hedefKat=c; }
  }
  ok(!!hedefKat, `En küçük kategori seçildi: ${hedefKat} (${enAz} ürün)`);
  await secici.selectOption(hedefKat); await p.waitForTimeout(400);

  await p.locator("main label").filter({hasText:"Değişim"}).locator("input").fill(YUZDE);
  await p.waitForTimeout(500);
  await p.locator("main label").filter({hasText:"Yuvarlama"}).locator("select").selectOption("1");
  await p.waitForTimeout(500);

  // ── 2. ÖNİZLEME ──
  /* Önizleme satırı:  <span>Ad · Kategori</span>
       <span><span.text-faint-light>ESKİ</span> → <strong>YENİ</strong></span>
     YENİ fiyat <strong> içinde — span listesinin sonu DEĞİL. İlk yazımda
     son span'i aldım ve eski fiyatı "yeni" sandım; test, uygulama doğru
     çalıştığı hâlde düştü. */
  const onizleme=await p.evaluate(()=>{
    const kart=[...document.querySelectorAll("main .rounded-12")].pop();
    return [...kart.querySelectorAll(":scope > div")].slice(1).map(r=>({
      ad: r.querySelector("span")?.innerText.split("·")[0].trim(),
      eski: r.querySelector("span:last-of-type > span")?.innerText.trim(),
      yeni: r.querySelector("strong")?.innerText.trim(),
    }));
  });
  ok(onizleme.length===enAz, `Önizlemede ${onizleme.length} satır (${enAz} bekleniyordu)`);
  ok(onizleme.every(x=>x.yeni&&x.yeni!==x.eski), `Önizleme yeni fiyat gösteriyor: ${onizleme.map(x=>`${x.ad} ${x.eski}→${x.yeni}`).join(" | ").slice(0,90)}`);

  const dugme=p.locator("main button").filter({hasText:"ürüne uygula"});
  ok((await dugme.innerText()).startsWith(String(enAz)), `Düğme hedef sayısını yazıyor: "${await dugme.innerText()}"`);

  // ── 3. UYGULA ──
  p.on("dialog",d=>d.accept());
  await dugme.click();
  await p.waitForTimeout(3500); // action + location.reload()
  await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await sekmeAc(p,"Ürünler");
  const sonra=await fiyatlariOku(p);

  const normal=(s)=>String(s??"").replace(/[^\d.,]/g,"").replace(/\./g,"").replace(",",".");
  let dogru=0;
  for (const o of onizleme) {
    if (normal(sonra[o.ad])===normal(o.yeni)) dogru++;
    else ok(false, `${o.ad}: beklenen ${o.yeni}, bulunan ${sonra[o.ad]}`);
  }
  ok(dogru===onizleme.length, `${dogru}/${onizleme.length} ürün önizlemedeki değere yazıldı`);

  const degismeyen=Object.keys(yedek).filter(a=>!onizleme.some(o=>o.ad===a));
  ok(degismeyen.every(a=>sonra[a]===yedek[a]),
     `Diğer ${degismeyen.length} kategorideki fiyatlara DOKUNULMADI`);

  // ── 4. GERİ YÜKLE ──
  for (const o of onizleme) {
    const girdi=p.locator('main .rounded-12 > div').filter({has:p.locator(`input[value="${o.ad}"]`)})
      .locator('input[aria-label="Kilo fiyatı"]');
    await girdi.fill(yedek[o.ad]);
    await p.waitForTimeout(400);
  }
  await p.waitForTimeout(2000);

  // ── 5. DOĞRULA ──
  await panelTazele(p,"Ürünler");
  const geri=await fiyatlariOku(p);
  const eksik=Object.keys(yedek).filter(a=>geri[a]!==yedek[a]);
  ok(eksik.length===0,
     eksik.length? `GERİ ALMA BAŞARISIZ: ${eksik.map(a=>`${a} ${yedek[a]}→${geri[a]}`).join(", ")}`
                 : `GERİ ALMA DOĞRULANDI: ${Object.keys(yedek).length} fiyatın hepsi ilk hâlinde`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
