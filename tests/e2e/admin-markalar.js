/* Markalar sekmesi: ekleme, logo yükleme, güvenlik denetimleri, SİLME.

   ÖNEMLİ — bu test ÜRETİM veritabanına yazıyor. Eski hâli 5 marka ekleyip
   hiç silmiyordu; sahte markalar canlı sitede kaldı. Artık:
   · adlar "TEST—" ön ekli, böylece panelde görülürse kaynağı belli
   · test sonunda eklediği her markayı panelden SİLER (blob da silinir)
   · silme doğrulanır; doğrulanmazsa test BAŞARISIZ olur
   Logo dosyaları da testin içinde üretiliyor; /tmp bağımlılığı yok. */
const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const fs = require("fs");
const os = require("os");
const path = require("path");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};
const ADLAR=["TEST—Ege Et","TEST—Anadolu Besi"];

/** 1×1 saydam PNG — logo yerine geçer, boyutu önemsiz. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64");

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const dizin=fs.mkdtempSync(path.join(os.tmpdir(),"marka-test-"));
  const png=path.join(dizin,"logo.png"); fs.writeFileSync(png, PNG);
  // Güvenlik denetimi için: betik içeren SVG ve yanlış uzantılı dosya
  const kotuSvg=path.join(dizin,"kotu.svg");
  fs.writeFileSync(kotuSvg, '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const temizSvg=path.join(dizin,"temiz.svg");
  fs.writeFileSync(temizSvg, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#fff"/></svg>');

  const p=await (await br.newContext({viewport:{width:1280,height:1400},locale:"tr-TR"})).newPage();
  await paneleGir(p, B, k);

  await p.evaluate(()=>{const n=(s)=>(s??"").normalize("NFC").trim();
    const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith("Markalar")); if(b) b.click();});
  await p.waitForTimeout(600);
  ok((await p.locator("main").innerText()).includes("Çalıştığımız üreticiler"), "Markalar sekmesi açıldı");

  const kart=()=>p.locator('main .grid > div');
  const basta=await kart().count();

  /* ── Ekleme + logo yükleme ──
     ⚠️ KONUMA GÖRE HEDEFLEME YASAK (AGENTS.md). Eskiden `nth(basta+i)` ile
     sona bakılıyordu; bu, ekleme sıralamasının sona eklediği VARSAYIMINA
     dayanıyor. `admin-kampanyalar`'da aynı varsayım yanlış çıktı ve mevcut
     iki fırsat silindi. Marka tablosu şu an boş olduğu için zarar görülmedi,
     ama kullanıcı logo yükledikten sonra ONUN markalarını bozabilirdi.
     Yeni kayıt varsayılan adıyla bulunur, tek olduğu doğrulanır, adı
     yazılır ve bundan sonra hep adla hedeflenir. */
  for (const ad of ADLAR){
    const oncekiSayi=await kart().count();
    await p.locator('main button:has-text("Marka ekle")').click();
    await p.waitForFunction((n)=>document.querySelectorAll('main input[aria-label="Marka adı"]').length===n+1,
      oncekiSayi,{timeout:20000}).catch(()=>{});
    const varsayilan=p.locator('main .grid > div').filter({has:p.locator('input[value="Yeni marka"]')});
    ok(await varsayilan.count()===1, `Yeni kart varsayılan adıyla tek bulundu (${await varsayilan.count()})`);
    await varsayilan.first().locator('input[aria-label="Marka adı"]').fill(ad);
    await p.waitForFunction((a)=>document.querySelector(`main input[value="${a}"]`)!==null,ad,{timeout:15000}).catch(()=>{});
    await p.locator('main .grid > div').filter({has:p.locator(`input[value="${ad}"]`)})
      .locator('input[type=file]').setInputFiles(png);
    await p.waitForTimeout(2500);
  }
  /** Bundan sonra kartlar hep ADLA hedeflenir. */
  const marka=(ad)=>p.locator('main .grid > div').filter({has:p.locator(`input[value="${ad}"]`)});
  ok(await kart().count()===basta+ADLAR.length, `${ADLAR.length} marka eklendi (${await kart().count()-basta})`);
  const src=await marka(ADLAR[0]).locator("img").getAttribute("src");
  ok(!!src?.includes("blob.vercel-storage.com"), `Logo Vercel Blob'da: ${src?.slice(0,46)}…`);
  ok(!!src?.endsWith(".png"), `Uzanti MIME'dan türetildi (.png): ${src?.split("/").pop()}`);

  // ── Güvenlik: betik içeren SVG reddedilmeli (K-32) ──
  await marka(ADLAR[0]).locator('input[type=file]').setInputFiles(kotuSvg);
  /* Sabit bekleme KULLANMA: uyarı metni geç doluyor ve koşul boş string
     okuyordu — mesaj doğru olduğu hâlde test düşüyordu. */
  const uyari=p.locator('main [role=alert]');
  const uyariMetni=await p.waitForFunction(()=>{
    const e=document.querySelector('main [role=alert]');
    const t=e?.innerText?.trim();
    return t && t.length>0 ? t : null;
  },null,{timeout:20000}).then(h=>h.jsonValue()).catch(()=>null);
  ok(!!uyariMetni && /güvenlik/i.test(uyariMetni),
     `Betikli SVG reddedildi: ${uyariMetni ? uyariMetni.slice(0,60) : "UYARI YOK"}`);
  const srcSonra=await marka(ADLAR[0]).locator("img").getAttribute("src");
  ok(srcSonra===src, "Reddedilen yükleme mevcut logoyu değiştirmedi");

  // ── Temiz SVG kabul edilmeli ──
  await marka(ADLAR[0]).locator('input[type=file]').setInputFiles(temizSvg);
  await p.waitForTimeout(2500);
  const svgSrc=await marka(ADLAR[0]).locator("img").getAttribute("src");
  ok(!!svgSrc?.endsWith(".svg"), `Temiz SVG kabul edildi (.svg): ${svgSrc?.split("/").pop()}`);

  // ── TEMİZLİK: eklenen her markayı sil ──
  p.on("dialog", (d)=>d.accept());
  for (const ad of ADLAR){
    const hedef=kart().filter({has:p.locator(`input[value="${ad}"]`)});
    if (await hedef.count()===0) continue;
    await hedef.first().locator('button[aria-label*="sil"]').click();
    await p.waitForTimeout(1500);
  }
  const sonda=await kart().count();
  ok(sonda===basta, `TEMİZLİK: eklenen markalar silindi (${basta} → ${sonda})`);
  const kalan=await p.locator('main input[value^="TEST—"]').count();
  ok(kalan===0, `Panelde TEST— markası kalmadı (${kalan})`);

  fs.rmSync(dizin,{recursive:true,force:true});
  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
