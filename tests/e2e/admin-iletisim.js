/* İletişim & saatler sekmesi: işletme bilgileri ve çalışma saatleri.

   ⚠️ ÜRETİM verisini DEĞİŞTİRİR — ve bu sekmede değiştirilen her şey
   (telefon, adres, giriş başlığı, saatler) doğrudan canlı sitede görünür.
   Bu yüzden desen katı:
     1. mevcut değerler ANLIK GÖRÜNTÜye alınır
     2. değiştirilir, sitede yansıdığı doğrulanır
     3. geri yüklenir
     4. YENİLENİP geri yüklemenin tuttuğu DOĞRULANIR — tutmazsa test düşer
   Geri yükleme doğrulanmazsa kullanıcının iletişim bilgileri bozuk kalır. */
const { chromium } = require("playwright");
const { kimlikZorunlu, paneleGir } = require("./_ortak");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

const sekmeAc=async(p,ad)=>{ await p.evaluate((h)=>{const n=(s)=>(s??"").normalize("NFC").trim();
  const b=[...document.querySelectorAll("aside button")].find(x=>n(x.textContent).startsWith(h)); if(b) b.click();},ad);
  await p.waitForTimeout(800); };
const panelTazele=async(p,ad)=>{ await p.reload({waitUntil:"networkidle"}); await p.waitForSelector("header");
  await p.waitForFunction(()=>document.querySelectorAll("main").length===1,null,{timeout:15000}).catch(()=>{});
  await p.waitForTimeout(500); await sekmeAc(p,ad); };

/** Etiket metninden girdiyi bul — alanların aria-label'ı yok, <label> içindeler. */
const alan=(p,etiket)=>p.locator("main label").filter({hasText:etiket}).locator("input, textarea").first();

(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const k=kimlikZorunlu(br);
  const ctx=await br.newContext({viewport:{width:1280,height:1600},locale:"tr-TR",reducedMotion:"reduce"});
  const p=await ctx.newPage();
  await paneleGir(p, B, k);
  const site=await ctx.newPage();

  await sekmeAc(p,"İletişim");
  ok((await p.locator("main").innerText()).includes("İletişim ve çalışma saatleri"), "İletişim sekmesi açıldı");

  // ── 1. ANLIK GÖRÜNTÜ ──
  const ALANLAR=["Telefon","Adres","Giriş başlığı"];
  const yedek={};
  for (const a of ALANLAR) yedek[a]=await alan(p,a).inputValue();
  const pazarAcilis=await p.locator('input[aria-label="Pazar açılış saati"]').inputValue();
  const pazarKapanis=await p.locator('input[aria-label="Pazar kapanış saati"]').inputValue();
  ok(Object.values(yedek).every(v=>v.length>0), `Yedek alındı: ${JSON.stringify(yedek).slice(0,90)}…`);
  ok(/^\d{2}:\d{2}$/.test(pazarAcilis), `Pazar saati yedeklendi: ${pazarAcilis}–${pazarKapanis}`);

  // ── 2. DEĞİŞTİR ──
  const YENI={Telefon:"0500 000 00 00", Adres:"TEST—Deneme Mahallesi 1/A, Gaziemir",
              "Giriş başlığı":"TEST—Giriş başlığı denemesi"};
  for (const a of ALANLAR){ await alan(p,a).fill(YENI[a]); await p.waitForTimeout(250); }
  await p.locator('input[aria-label="Pazar açılış saati"]').fill("11:00");
  await p.waitForTimeout(250);
  await p.locator('input[aria-label="Pazar kapanış saati"]').fill("16:00");
  await p.waitForTimeout(2200);

  await panelTazele(p,"İletişim");
  for (const a of ALANLAR)
    ok(await alan(p,a).inputValue()===YENI[a], `${a} kaydedildi`);
  ok(await p.locator('input[aria-label="Pazar açılış saati"]').inputValue()==="11:00", "Pazar açılış kaydedildi");

  // ── 3. SİTEDE YANSIDI MI (updateTag) ──
  await site.goto(B+"/",{waitUntil:"networkidle"});
  await site.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}});
  await site.waitForTimeout(700);
  const il=await site.locator("#iletisim").innerText();
  ok(il.includes(YENI["Adres"]), "Adres sitede güncellendi");
  ok(il.includes("0500 000 00 00"), "Telefon sitede güncellendi");
  ok(il.includes("11:00 – 16:00"), "Pazar saati sitede güncellendi");
  ok((await site.locator("#top, header").first().innerText().catch(()=>"")+await site.innerText("body")).includes(YENI["Giriş başlığı"]),
     "Giriş başlığı sitede güncellendi");

  // ── 4. GERİ YÜKLE ──
  for (const a of ALANLAR){ await alan(p,a).fill(yedek[a]); await p.waitForTimeout(250); }
  await p.locator('input[aria-label="Pazar açılış saati"]').fill(pazarAcilis);
  await p.waitForTimeout(250);
  await p.locator('input[aria-label="Pazar kapanış saati"]').fill(pazarKapanis);
  await p.waitForTimeout(2200);

  // ── 5. GERİ YÜKLEMEYİ DOĞRULA (yenileyerek) ──
  await panelTazele(p,"İletişim");
  let geriTamam=true;
  for (const a of ALANLAR){
    const v=await alan(p,a).inputValue();
    const t=v===yedek[a]; if(!t) geriTamam=false;
    ok(t, `GERİ ALMA — ${a}: ${JSON.stringify(v)}`);
  }
  const pa=await p.locator('input[aria-label="Pazar açılış saati"]').inputValue();
  const pk=await p.locator('input[aria-label="Pazar kapanış saati"]').inputValue();
  if(pa!==pazarAcilis||pk!==pazarKapanis) geriTamam=false;
  ok(pa===pazarAcilis&&pk===pazarKapanis, `GERİ ALMA — Pazar saati: ${pa}–${pk}`);

  await site.reload({waitUntil:"networkidle"}); await site.waitForTimeout(700);
  const son=await site.innerText("body");
  ok(!son.includes("TEST—") && !son.includes("0500 000 00 00"),
     "Sitede TEST— izi kalmadı");
  ok(geriTamam, "TÜM alanlar ve saatler ilk hâline döndü");

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
