/* Güvenlik taramasında kapatılan açıkların regresyon testi (K-32).

   Kapsam:
   1. Güvenlik başlıkları (CSP, nosniff, Referrer-Policy, Permissions-Policy,
      X-Frame-Options, HSTS) — taramada yalnızca HSTS vardı.
   2. JSON-LD kaçışı — `JSON.stringify` tek başına `</script>` geçiriyordu.
   3. Panelin önbelleğe alınmaması.
   4. Kimliksiz erişimde /yonetim → giriş sayfası.
   5. Giriş hız sınırı — önce hiç yoktu, sınırsız şifre denenebiliyordu.

   5. madde veritabanına yazdığı için kendi kayıtlarını SİLER. Yerelde IP
   anahtarı ÖLÇÜLDÜ: `i:::1` (Node yerel adresi; "bilinmiyor" sanmıştım,
   yanlıştı). Yalnızca yerel döngü adresleri siliniyor — üretimdeki gerçek
   IP kayıtlarına dokunulmaz. */
const YEREL_IP=["i:::1","i:127.0.0.1","i:bilinmiyor"];
const { chromium } = require("playwright");
const EXE="/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const B="http://localhost:3100";
const SAHTE="hiz-siniri-test@sarnickasap.invalid";
const SINIR_EPOSTA=8; // lib/hiz-siniri.ts ile aynı olmalı
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  if(!process.env.DATABASE_URL){
    console.log("⏭️  ATLANDI — DATABASE_URL yok (hız sınırı temizliği yapılamaz)");
    process.exit(2);
  }
  const { neon } = require("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);

  // ── 1. Başlıklar ──
  const r=await fetch(B+"/");
  const bekle={
    "content-security-policy": /default-src 'self'/,
    "x-content-type-options": /^nosniff$/,
    "referrer-policy": /strict-origin-when-cross-origin/,
    "permissions-policy": /camera=\(\)/,
    "x-frame-options": /^DENY$/,
    "strict-transport-security": /max-age=\d{7,}/,
  };
  for(const [ad,desen] of Object.entries(bekle)){
    const v=r.headers.get(ad);
    ok(!!v&&desen.test(v), `${ad}: ${v?v.slice(0,46):"YOK"}`);
  }
  // Harita ve Blob CSP'de izinli mi — yoksa site görsel olarak bozulur
  const csp=r.headers.get("content-security-policy")??"";
  ok(csp.includes("https://maps.google.com"), "CSP harita iframe'ine izin veriyor");
  ok(csp.includes("blob.vercel-storage.com"), "CSP marka logolarına izin veriyor");
  ok(/frame-ancestors 'none'/.test(csp), "CSP frame-ancestors 'none' (clickjacking)");

  // ── 2. JSON-LD kaçışı ──
  const html=await r.text();
  const ld=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  ok(ld.length>0, `${ld.length} JSON-LD bloğu bulundu`);
  ok(ld.every(x=>!x.includes("</")), "JSON-LD'de ham '</' yok (script kapatma kaçışlı)");
  ok(ld.every(x=>{try{JSON.parse(x);return true}catch{return false}}), "JSON-LD hâlâ geçerli JSON");

  // ── 3. Panel önbelleğe alınmıyor ──
  const ry=await fetch(B+"/yonetim",{redirect:"manual"});
  ok(/no-store/.test(ry.headers.get("cache-control")??""),
     `/yonetim cache-control: ${ry.headers.get("cache-control")}`);

  // ── 4. Kimliksiz erişim ──
  const br=await chromium.launch({executablePath:EXE});
  const p=await (await br.newContext({locale:"tr-TR"})).newPage();
  await p.goto(B+"/yonetim",{waitUntil:"networkidle"});
  ok(p.url().includes("giris"), `Kimliksiz /yonetim → ${new URL(p.url()).pathname}`);

  // ── 5. Hız sınırı ──
  await sql`delete from login_attempts where anahtar = ${"e:"+SAHTE} or anahtar = any(${YEREL_IP})`;
  let engelMesaji=null, ilkMesaj=null;
  for(let i=1;i<=SINIR_EPOSTA+1;i++){
    await p.goto(B+"/yonetim/giris",{waitUntil:"networkidle"});
    await p.fill("input[name=email]",SAHTE);
    await p.fill("input[name=password]","yanlis-sifre-"+i);
    await p.click("button[type=submit]");
    /* Metin DOLANA kadar bekle. Sadece `waitForSelector` yetmiyor: öğe
       metni yerleşmeden görünüyor ve boş string okunuyordu — bu yüzden
       sınırın devreye girdiği mesaj kaçırılmıştı. */
    await p.waitForFunction(()=>{
      const e=document.querySelector("[role=alert]");
      return e && e.innerText.trim().length>0;
    },null,{timeout:20000});
    const m=(await p.locator("[role=alert]").first().innerText()).trim();
    if(i===1) ilkMesaj=m;
    if(/çok fazla/i.test(m)){ engelMesaji=m; console.log(`   ${i}. denemede engellendi`); break; }
  }
  ok(ilkMesaj==="E-posta veya şifre hatalı.",
     `Hata mesajı hesabın varlığını ele vermiyor: "${ilkMesaj}"`);
  ok(!!engelMesaji, `Hız sınırı devreye girdi: "${engelMesaji??"GİRMEDİ — sınırsız deneme!"}"`);

  // Temizlik — kendi kayıtlarını sil, üretim IP'lerine dokunma
  await sql`delete from login_attempts where anahtar = ${"e:"+SAHTE} or anahtar = any(${YEREL_IP})`;
  const [{n}]=await sql`select count(*)::int n from login_attempts
    where anahtar = ${"e:"+SAHTE} or anahtar = any(${YEREL_IP})`;
  ok(n===0, `TEMİZLİK: test kayıtları silindi (${n} kaldı)`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
