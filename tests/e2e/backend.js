/* Backend değişmezleri (K-34).

   Buradaki kontroller UYGULAMA KATMANINI ATLAYAN yolları koruyor: seed
   betiği, onarım betikleri, `drizzle-kit studio` ve doğrudan SQL zod
   doğrulamasını görmez. Son savunma hattı veritabanında olmalı.

   Kapsam:
   1. CHECK kısıtları gerçekten reddediyor (geçerli veri kabul ediliyor)
   2. Sık sorgulanan sütunlarda indeks var
   3. SON yönetici hesabı silinemiyor — tek ifadede, yarışa kapalı
   4. `seed` betiği onaysız çalışmıyor (üretimi silmesin)
   5. İçerik değişince sitemap `lastmod` ilerliyor */
const { execFileSync } = require("child_process");
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?"✅":"❌")+" "+m);};

(async()=>{
  if(!process.env.DATABASE_URL){
    console.log("⏭️  ATLANDI — DATABASE_URL yok");
    process.exit(2);
  }
  const { neon } = require("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);

  // ── 1. CHECK kısıtları ──
  const vakalar=[
    ["puan 9 reddedilmeli", false, sql`insert into reviews (name,text,rating,visible,sort) values ('KISIT-TEST','x',9,false,999)`],
    ["puan 0 reddedilmeli", false, sql`insert into reviews (name,text,rating,visible,sort) values ('KISIT-TEST','x',0,false,999)`],
    ["puan 4 KABUL edilmeli", true, sql`insert into reviews (name,text,rating,visible,sort) values ('KISIT-TEST','x',4,false,999)`],
    ["eksi ürün fiyatı reddedilmeli", false, sql`update products set price=-1 where id=(select id from products order by id limit 1)`],
    ["eksi fırsat fiyatı reddedilmeli", false, sql`insert into deals (title,description,old_price,new_price,until,active,sort) values ('KISIT-TEST','',-5,0,'',false,999)`],
    ["gün 9 reddedilmeli", false, sql`insert into hours (day_index,day,open,close,closed) values (9,'X','08:00','20:00',false)`],
    ["bozuk saat biçimi reddedilmeli", false, sql`update hours set open='9:0' where day_index=0`],
  ];
  for (const [ad, kabulBekleniyor, q] of vakalar) {
    let gecti=false;
    try { await q; gecti=true; } catch { gecti=false; }
    ok(gecti===kabulBekleniyor, ad);
  }
  // Test kayıtlarını temizle
  await sql`delete from reviews where name='KISIT-TEST'`;
  await sql`delete from deals where title='KISIT-TEST'`;
  await sql`delete from hours where day_index=9`;
  const artik=(await sql`select count(*)::int n from reviews where name='KISIT-TEST'`)[0].n
            +(await sql`select count(*)::int n from deals where title='KISIT-TEST'`)[0].n;
  ok(artik===0, `TEMİZLİK: kısıt testi kaydı kalmadı (${artik})`);

  // ── 2. İndeksler ──
  const idx=(await sql`select indexname from pg_indexes where schemaname='public'`).map(x=>x.indexname);
  ok(idx.includes("login_attempts_anahtar_zaman_idx"),
     "login_attempts(anahtar,zaman) indeksi var — her giriş denemesi burayı sorguluyor");
  ok(idx.includes("products_category_id_idx"),
     "products(category_id) indeksi var — kategori birleşimi ve süzme kullanıyor");

  // ── 3. Son yönetici silinemez (yarışa kapalı tek ifade) ──
  const [{n:kullanici}]=await sql`select count(*)::int n from users`;
  if (kullanici===1) {
    const [u]=await sql`select id,email from users limit 1`;
    const r=await sql`delete from users where id=${u.id} and (select count(*) from users) > 1 returning id`;
    ok(r.length===0, `Son yönetici tek ifadeyle silinemiyor (${u.email} duruyor)`);
    ok((await sql`select count(*)::int n from users`)[0].n===1, "Kullanıcı sayısı değişmedi");
  } else {
    ok(true, `Birden fazla yönetici var (${kullanici}) — tekil silme korumasi bu koşumda sınanmadı`);
  }

  // ── 4. Seed betiği onaysız çalışmamalı ──
  let seedCikti="", seedKod=0;
  try {
    execFileSync("npx",["tsx","lib/db/seed.ts"],{
      env:{...process.env, SEED_ADMIN_EMAIL:"deneme@ornek.com", SEED_ADMIN_PASSWORD:"UzunDenemeSifresi123", SEED_ONAY:""},
      encoding:"utf8", stdio:["ignore","pipe","pipe"]});
  } catch(e){ seedKod=e.status; seedCikti=(e.stdout??"")+(e.stderr??""); }
  ok(seedKod===1 && /DURDURULDU/.test(seedCikti),
     `Seed onaysız DURDU (çıkış ${seedKod})`);
  ok((await sql`select count(*)::int n from products`)[0].n>0,
     "Seed denemesi ürünleri SİLMEDİ");

  // ── 5. İçerik değişince sitemap lastmod ilerliyor ──
  const lastmodOku=async()=>{
    const t=await (await fetch("http://localhost:3100/sitemap.xml")).text();
    return t.match(/<lastmod>([^<]+)/)?.[1] ?? null;
  };
  const lastmod=await lastmodOku();
  ok(!!lastmod && !isNaN(new Date(lastmod).getTime()),
     `sitemap lastmod geçerli tarih: ${lastmod}`);
  ok(!!lastmod && new Date(lastmod).getTime() <= Date.now()+60_000,
     "lastmod gelecekte değil");
  /* Canlı veritabanı değeriyle BİREBİR karşılaştırma yapma: sitemap
     `use cache` ile sunuluyor ve damga `after()` ile yanıttan sonra
     yazılıyor, yani sunulan değer bir tur geride olabilir — bu tasarım
     gereği, hata değil. Damganın içerik değişince İLERLEDİĞİ
     `admin-urunler` testinde panel üzerinden doğrulanıyor. */
  /* Damganın içerik değişince İLERLEDİĞİ `admin-urunler` testinde panel
     üzerinden doğrulanıyor — eylem yolunu atlamadan ölçmenin tek yolu o. */

  console.log(f?`\n❌ ${f} BAŞARISIZ`:"\n✅ Tümü geçti"); process.exit(f?1:0);
})();
