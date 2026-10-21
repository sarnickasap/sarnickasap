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
