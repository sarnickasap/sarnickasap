<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Sarnıç Kasap — proje kuralları

Bu proje, Claude Design ile üretilmiş bir tasarımın **birebir (piksel düzeyinde)**
uygulamasıdır. Tasarım yeniden yorumlanmaz, "iyileştirilmez".

**Kaynak tasarım:** `../Sarnıç Kasap Web Sitesi/` (salt okunur referans)
**Kalıcı bağlam:** `../vault/Sarnıç Kasap/` — Obsidian vault

Koda dokunmadan önce vault'taki şu notları oku:
`00 - Proje Özeti` → `04 - Kararlar` → `05 - Açık Sorular` → `06 - İlerleme Günlüğü`

### ⚠️ --spacing: 1px

`app/globals.css` içinde Tailwind boşluk tabanı **1px**'e çekilmiştir:

| Sınıf | Bu projede | Normal Tailwind'de |
|---|---|---|
| `p-24` | 24px | 96px |
| `gap-14` | 14px | 56px |
| `py-112` | 112px | 448px |

Sınıf adındaki sayı **doğrudan tasarımdaki piksel değeridir**. Bu bilinçli bir
karardır: her sınıf adı `02 - Design Tokens.md`'deki değere doğrudan izlenebilir.
Tailwind'in alışıldık `p-4 = 16px` davranışı burada geçerli değildir.

### Renk tokenları

Tasarımdaki hex değerleri `@theme` içinde isimlendirilmiştir. Ham hex yazma,
token kullan. İki token kontrast için bilinçli olarak değiştirilmiştir (karar K-21):
`--color-muted-dark` (#737373→#8a8a8a) ve `--color-faint-light` (#a3a3a3→#6b6b6b).
Aynı hex'lerin kontrastı yeterli olan diğer kullanımları korunmuştur.

### Değiştirilmeyecekler

Tasarımda **yok** ve eklenmeyecek: gölge (`box-shadow`), medya sorgusu
(responsive içseldir: `auto-fit`/`minmax`/`clamp`), tasarımda olmayan renk/ölçü.

Tasarımdan **onaylı 10 sapma** için bkz. `04 - Kararlar.md` → "Tasarımdan sapmalar".

### Görsel doğrulama

Referans görüntüler: `../vault/Sarnıç Kasap/_referans/` (4 genişlik: 1440/1280/834/390)
Playwright, önbellekteki Chromium'u `executablePath` ile kullanır:
`~/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
(`npx playwright install` ÇALIŞTIRMA — paket 1248 ister, önbellekte 1234 var.)

### ⚠️ Turbopack CSS önbelleği

`app/globals.css` içindeki `@theme` tokenları değiştirildiğinde `next build`
**eski CSS'i yeniden kullanabiliyor** — hata vermeden. Bu, görsel karşılaştırmayı
sessizce yanıltır: kod doğru, ekranda eski stil.

Token değiştirdiysen derlemeden önce:
```bash
rm -rf .next && npx next build
```
Doğrulama: `grep -o '\-\-color-<token>:[^;]*' .next/static/chunks/*.css`

### Oturum okuma

`auth()` doğrudan çağrılmaz — `lib/session.ts` içindeki `oturumAl()` /
`oturumZorunlu()` kullanılır. Sebep: Auth.js CSRF jetonu için
`crypto.getRandomValues()` çağırıyor; Cache Components altında bu, prerender'ı
bozuyor. Yardımcılar `connection()` ile rotayı istek zamanına taşıyor.
Oturuma bağlı sayfa/layout'lara ayrıca `export const instant = false` gerekir.

### ⚠️ `vercel env pull` yerel değişkenleri siler

`.env.local` dosyası Vercel'deki değişkenlerden yeniden üretilir. Yalnızca
yerelde gereken ve bilerek Vercel'e eklenmeyen `AUTH_TRUST_HOST="true"`
satırı pull sonrası kaybolur ve giriş `UntrustedHost` hatası verir.
Pull yaptıysan satırı geri ekle.

### ⚠️ Testleri çıktıya göre DEĞERLENDİRME — çıkış koduna bak

```bash
node tests/kos.js                 # tüm e2e, çıkış kodu tabanlı
node tests/kos.js admin markalar  # ada göre süz
node tests/gecici-admin.js        # geçici yönetici açar, koşar, siler
```

`0 = geçti · 2 = atlandı · diğer = başarısız`. **Çıktı üretmeden 0 dönen test
`ŞÜPHELİ` sayılır ve başarısız raporlanır.** Sebep: `grep -c "❌"` ile
değerlendirirken ilk satırda çöken testler (eksik `ADMIN_EMAIL`) hiç `❌`
basmıyor, "0 hata → geçti" okunuyordu. Dört admin testi ve erişilebilirlik
testinin panel bölümü bu yüzden uzun süre hiç koşmadı.

Admin testleri `ADMIN_EMAIL` / `ADMIN_PW` ister; **`.env.local`'de yok** ve
olmamalı. `tests/gecici-admin.js` bunu çözer.

### ✅ Testler AYRI veritabanında çalışır (K-35)

`sarnic_test` — aynı Neon projesi, ayrı veritabanı. `.env.local` içinde
`TEST_DATABASE_URL`. `tests/kos.js` bunu doğrular, gerekirse Next'i o
veritabanıyla **derler** (`use cache` + PPR statik kabuğu derleme anında
üretiyor; sunucuyu test veritabanıyla başlatmak YETMİYOR), sunucuyu kendisi
başlatır ve **nöbetçi kontrolle** sunulan verinin test veritabanından
geldiğini doğrular.

`node tests/kos.js` ya da `node tests/gecici-admin.js` dışında bir yolla
test çalıştırma — ikisi de üretime yazmayı reddeder.

> Blob deposu hâlâ **paylaşımlı**. Test yüklemeleri kendi dosyasını siliyor
> ama test çökerse yetim blob kalabilir. `npx vercel blob list` ile kontrol et.

### ⚠️ Yine de: üretim veritabanına yazan test kendi verisini silmek ZORUNDA

İzolasyon birinci savunma, bu ikinci. Yerel betikler (onarım, inceleme)
hâlâ **canlı Neon veritabanını** kullanıyor.

- Silmeyi **kendi oluşturduğun e-postaya / ön eke göre** hedefle.
- `.first()`, `.nth(n)` gibi **konuma dayalı hedefleme YASAK** — yalnızca
  silmede değil, **her türlü düzenlemede**. İki kez üretim verisi kaybedildi:
  1. `admin-kullanicilar` `.first()` ile **gerçek yöneticinin hesabını**
     sildi; şifre hash'i geri gelmedi.
  2. `admin-kampanyalar` `nth(once)` ile listenin sonuna baktı, ama
     `firsatEkle` yeni kaydı `sort: enKucuk - 1` ile **BAŞA** ekliyor;
     mevcut iki fırsatın adı değiştirilip **silindi**.
- "Ekle"den sonra yeni kaydı **varsayılan/boş değerinden** bul ve
  **tam bir tane** olduğunu doğrula; sonra kendi değerini yaz ve bundan
  sonra hep o değerle hedefle.
- Ekleme sonrası **sabit bekleme kullanma**; sayının arttığını
  `waitForFunction` ile bekle (Neon gecikmesinde 1,3 sn yetmiyor).
- Koşum sonunda silmeyi/geri almayı **doğrula** (`count === 0`, yenileyip
  değer karşılaştır).

> Ekleme eylemlerinin sıralaması tek tip DEĞİL: `firsatEkle` başa
> (`enKucuk - 1`), `markaEkle` sona (`enBuyuk + 1`) ekliyor. Konuma asla
> güvenme.

### axe taramasında `reducedMotion: "reduce"` zorunlu

Kaydırmayla açılan bölümün üst öğesi `opacity: 0` iken axe etkin opaklığı
hesaba katıp **sahte `color-contrast` ihlali** üretir. Ölçülen örnek:
`#urunler` eyebrow, rengi `#e0464e` (K-21'de onaylı), etkin opaklık 0.000.
`reduce` ile 1.000 ve sonuç kararlı.

### Testlerde sabit içerik sayısı yazma

Ürün/marka listesini kullanıcı yönetiyor. Sabit sayılar (19 ürün, 5 logo)
her ekleme/silmede **yanlış alarm** veriyordu. Sayıları sayfadan türet ve
**ilişkileri** doğrula (kategori toplamları = Tümü, ok sayısı = ürün − tükendi).

### Güvenlik başlıkları (K-32)

`next.config.ts` → `headers()`. CSP'de `script-src 'unsafe-inline'` **zorunlu**
(Next.js satır içi bootstrap script'i yazıyor; nonce PPR kabuğunu bozar).
Yeni bir dış kaynak (font, CDN, API) eklerken CSP'yi güncelle — aksi halde
tarayıcı **sessizce** engeller. Regresyon: `node tests/kos.js guvenlik`.

### ⚠️ `npm run db:seed` ÜRETİMİ SİLER

Yerel geliştirme `.env.local` ile **üretim** veritabanına bağlanıyor. Seed
ürünleri, fırsatları, galeriyi, kategorileri, saatleri ve site bilgilerini
silip yer tutucu verilerle değiştirir.

Artık koruma var: ne kaybedileceğini sayıp durur. Bilerek sıfırlamak için
`SEED_ONAY="evet, sil" npm run db:seed`. Bu komutu **asla** refleksle
çalıştırma.

### Testlerde sabit `waitForTimeout` ile kayıt bekleme

Gecikmeli kayıt 600 ms + sunucu gidiş dönüşü. Sabit bekleme bir koşumda
yetmedi, `panelTazele` bekleyen yazmayı iptal etti ve **üretimde Pazar
kapanış saati yanlış kaldı**. Kayıt damgasının ilerlemesini bekle ve
"Kaydedilemedi" görürsen testi düşür (`admin-iletisim`'deki `kayitBekle`).

Aynısı animasyon ölçümü için de geçerli: `animasyon` testi 900 ms sabit
bekleyip opaklığı 0.994'te yakalıyordu. Opaklık `#galeri`'de değil
**`GoruntuyeGirince` sarmalayıcısında** — bekleme doğru öğeyi hedeflemeli.

### Backend değişmezleri

`node tests/kos.js backend` — CHECK kısıtları, indeksler, son yönetici
koruması, seed koruması. Bu kontroller uygulama katmanını atlayan yolları
(seed, onarım betikleri, `drizzle-kit studio`, doğrudan SQL) koruyor.
