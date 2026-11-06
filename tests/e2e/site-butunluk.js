/* Sitenin tüm bölümleri ve gerçek-veri kararları yerinde mi? */
const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};
(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const p=await (await br.newContext({viewport:{width:1280,height:900},locale:"tr-TR"})).newPage();
  await p.goto("http://localhost:3100/",{waitUntil:"networkidle"});

  for (const [id,ad] of [["top","Hero"],["firsatlar","Fırsatlar"],["urunler","Ürünler"],
                         ["hakkimizda","Hakkımızda"],["iletisim","İletişim"]])
    ok(await p.locator("#"+id).count()===1, `${ad} bölümü var`);

  ok(await p.locator("#yorumlar").count()===0, "Yorumlar gizli (gerçek yorum yok — K-15)");
  ok(await p.locator('header nav a[href="#yorumlar"]').count()===0, "Yorumlar nav linki de gizli — ölü bağlantı yok (K-08)");
  ok(await p.locator("footer").count()===1, "Footer var");

  // Harita adresten türetiliyor mu (K-16)
  // Harita yalnızca "Haritayı göster"e basınca yükleniyor (K-26, aşama 4).
  await p.evaluate(()=>document.querySelector("#iletisim")?.scrollIntoView());
  await p.locator('#iletisim button:has-text("Haritayı göster")').click();
  await p.waitForSelector("#iletisim iframe",{timeout:15000});
  const src = await p.locator("#iletisim iframe").getAttribute("src");
  ok(decodeURIComponent(src).includes("Atatürk, B. Menderes Cad. 126/D, Gaziemir, İzmir"),
     "Harita adresten türetiliyor (K-16)");
  ok(decodeURIComponent(src).startsWith("https://maps.google.com/maps?q=Sarnıç Kasap,"),
     "Sorgu işletme adıyla başlıyor (pin için şart)");
  ok(src.includes("output=embed") && src.includes("z=16"), "Harita biçimi tasarımdaki gibi");
  const filtre = await p.locator("#iletisim iframe").evaluate(e=>getComputedStyle(e).filter);
  ok(filtre.includes("grayscale(1)") && filtre.includes("invert(0.92)"), `Harita filtresi: ${filtre}`);

  // Yol tarifi bağlantısı (aşama 4)
  const tarif = p.locator('#iletisim a:has-text("Yol tarifi al")');
  ok(await tarif.count()===1, "Yol tarifi bağlantısı var");
  const tarifHref = decodeURIComponent(await tarif.getAttribute("href") ?? "");
  ok(tarifHref.startsWith("https://www.google.com/maps/dir/?api=1&destination=Sarnıç Kasap,"),
     `Yol tarifi Google Haritalar biçiminde: ${tarifHref.slice(0,70)}`);
  ok(await tarif.getAttribute("target")==="_blank" && (await tarif.getAttribute("rel")??"").includes("noopener"),
     "Yol tarifi yeni sekmede, rel=noopener");

  // Çalışma saatleri: bugün vurgulu
  const vurgu = await p.locator('#iletisim [aria-current="date"]').count();
  ok(vurgu===1, `Çalışma saatlerinde 1 gün vurgulu (${vurgu})`);

  // Galeri: görseli olmayan satırlar boş kutu olarak çıkmaz; hiç görsel yoksa bölüm ve linki gizli
  ok(await p.locator("#galeri").count()===0, "Görselsiz galeri bölümü gizli");
  ok(await p.locator('header nav a[href="#galeri"]').count()===0, "Galeri nav linki de gizli");
  ok(await p.getByText("fotoğraf: dükkân").count()===0, "Hakkımızda'da yer tutucu yok");

  // Footer yılı
  const ft = await p.locator("footer").innerText();
  ok(ft.includes(`© ${new Date().getFullYear()}`), `Footer yılı dinamik: ${ft.split("\n")[0]}`);

  /* Footer "Kategoriler" (K-39): sunucuda üretilmiş, taranabilir bağlantılar.
     Sayı sabit DEĞİL — sitemap'teki kategori adresleriyle birebir aynı küme
     olmalı ve her biri 200 dönmeli. JS'siz HTML'de de bulunmalı. */
  const fk=await p.locator('footer nav[aria-labelledby="footer-kategoriler"] a').evaluateAll(a=>a.map(x=>new URL(x.href).pathname));
  const smHam=await (await fetch("http://localhost:3100/sitemap.xml")).text();
  const smKat=[...smHam.matchAll(/<loc>[^<]*?(\/urunler\/[^<]+)<\/loc>/g)].map(m=>m[1]);
  ok(fk.length>0 && fk.length===smKat.length && fk.every(y=>smKat.includes(y)),
    `Footer kategori bağlantıları = sitemap kategorileri (${fk.length}/${smKat.length})`);
  const hamHtml=await (await fetch("http://localhost:3100/")).text();
  ok(fk.every(y=>hamHtml.includes(`href="${y}"`)), "Footer kategori bağlantıları sunucu HTML'inde (tıklamasız)");
  const durumlar=await Promise.all(fk.map(y=>fetch("http://localhost:3100"+y).then(r=>r.status)));
  ok(durumlar.every(d=>d===200), `Footer kategori sayfaları 200 (${durumlar.join(",")})`);

  // target=_blank bağlantılarda rel
  const kotu = await p.locator('a[target="_blank"]:not([rel*="noopener"])').count();
  ok(kotu===0, `target="_blank" bağlantıların hepsinde rel="noopener" (eksik: ${kotu})`);

  /* ── SEO adresleri tek ve YÖNLENMEYEN ana makinede olmalı ──
     Hata: `SITE_URL` apex'te kalmıştı, apex ise www'ye 308 yönlendiriyor.
     canonical / og:url / JSON-LD url / sitemap / robots hepsi yönlenen
     adresi gösteriyordu. Hepsi aynı kaynaktan geldiği için tek kontrol
     yeterli, ama her birini ayrı doğrula — biri elle yazılırsa yakalanır. */
  const seo=await p.evaluate(()=>({
    canonical:document.querySelector('link[rel=canonical]')?.getAttribute("href"),
    ogUrl:document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
    ogImage:document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
    ld:(()=>{try{return JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).url}catch{return null}})(),
  }));
  const TEMEL="http://localhost:3100";
  const sm=await (await fetch(TEMEL+"/sitemap.xml")).text();
  const rb=await (await fetch(TEMEL+"/robots.txt")).text();
  const adresler={canonical:seo.canonical, "og:url":seo.ogUrl, "og:image":seo.ogImage,
                  "json-ld url":seo.ld, sitemap:sm.match(/<loc>([^<]+)/)?.[1],
                  "robots sitemap":rb.match(/Sitemap:\s*(\S+)/)?.[1]};
  const makine=(u)=>{try{return new URL(u).host}catch{return "(okunamadı)"}};
  /* og:image panelden ayrı bir görsele (site_info.og_image_url, Blob) bağlanabilir — aşama 4.
     O durumda tek-makine kontrolüne girmez; yine de apex'i göstermemeli. */
  const blobMu=(u)=>/\.public\.blob\.vercel-storage\.com$/.test(makine(u));
  const makineler=[...new Set(Object.entries(adresler)
    .filter(([ad,u])=>!(ad==="og:image"&&blobMu(u))).map(([,u])=>makine(u)))];
  ok(makineler.length===1, `Tüm SEO adresleri tek ana makinede: ${makineler.join(", ")}`);
  for (const [ad,u] of Object.entries(adresler))
    ok(!!u && !/^https?:\/\/sarnickasap\.com/.test(u),
       `${ad} yönlenmeyen adreste: ${u ?? "YOK"}`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
