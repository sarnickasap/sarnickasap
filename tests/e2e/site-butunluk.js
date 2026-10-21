/* Sitenin tüm bölümleri ve gerçek-veri kararları yerinde mi? */
const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};
(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const p=await (await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR"})).newPage();
  await p.goto("http://localhost:3100/",{waitUntil:"networkidle"});

  for (const [id,ad] of [["top","Hero"],["firsatlar","Fırsatlar"],["urunler","Ürünler"],
                         ["hakkimizda","Hakkımızda"],["galeri","Galeri"],["iletisim","İletişim"]])
    ok(await p.locator("#"+id).count()===1, `${ad} bölümü var`);

  ok(await p.locator("#yorumlar").count()===0, "Yorumlar gizli (gerçek yorum yok — K-15)");
  ok(await p.locator('header nav a[href="#yorumlar"]').count()===0, "Yorumlar nav linki de gizli — ölü bağlantı yok (K-08)");
  ok(await p.locator("footer").count()===1, "Footer var");

  // Harita adresten türetiliyor mu (K-16)
  // Harita görünüme yaklaşana kadar yüklenmiyor (D5) — önce oraya kaydır.
  await p.evaluate(()=>document.querySelector("#iletisim")?.scrollIntoView());
  await p.waitForSelector("#iletisim iframe",{timeout:15000});
  const src = await p.locator("#iletisim iframe").getAttribute("src");
  ok(decodeURIComponent(src).includes("Atatürk, B. Menderes Cad. 126/D, Gaziemir, İzmir"),
     "Harita adresten türetiliyor (K-16)");
  ok(src.includes("output=embed") && src.includes("z=16"), "Harita biçimi tasarımdaki gibi");
  const filtre = await p.locator("#iletisim iframe").evaluate(e=>getComputedStyle(e).filter);
  ok(filtre.includes("grayscale(1)") && filtre.includes("invert(0.92)"), `Harita filtresi: ${filtre}`);

  // Çalışma saatleri: bugün vurgulu
  const vurgu = await p.locator('#iletisim [aria-current="date"]').count();
  ok(vurgu===1, `Çalışma saatlerinde 1 gün vurgulu (${vurgu})`);

  // Galeri yer tutucuları
  ok(await p.locator("#galeri figure").count()===6, "6 galeri figürü");
  ok(await p.locator("#galeri img").count()===0, "Görsel URL'i yok → hepsi yer tutucu");

  // Footer yılı
  const ft = await p.locator("footer").innerText();
  ok(ft.includes(`© ${new Date().getFullYear()}`), `Footer yılı dinamik: ${ft.split("\n")[0]}`);

  // target=_blank bağlantılarda rel
  const kotu = await p.locator('a[target="_blank"]:not([rel*="noopener"])').count();
  ok(kotu===0, `target="_blank" bağlantıların hepsinde rel="noopener" (eksik: ${kotu})`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
