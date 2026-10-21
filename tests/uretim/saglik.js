const { chromium } = require('playwright');
const EXE='/Users/obi/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const B='https://www.sarnickasap.com';
let f=0; const ok=(c,m)=>{if(!c)f++;console.log((c?'✅':'❌')+' '+m);};
(async()=>{
  const br=await chromium.launch({executablePath:EXE});
  const ctx=await br.newContext({viewport:{width:1280,height:900},locale:'tr-TR'});
  const p=await ctx.newPage();
  const olay=[]; p.on('request',r=>{ if(/insights\/(view|event)/.test(r.url())) olay.push(r.url()); });

  await p.goto(B+'/',{waitUntil:'networkidle',timeout:45000});
  await p.waitForTimeout(3500);
  ok(await p.evaluate(()=>typeof window.va)==='function', 'Analytics yüklendi');
  /* Olayın GÖNDERİLDİĞİNİ otomasyonla doğrulayamıyoruz: Vercel Analytics
     bot/otomasyon trafiğini süzüyor ve kuyruğu boşaltmıyor. Doğrulanabilir
     olan, sayfa görüntülemesinin KUYRUĞA ALINDIĞI. Gerçek kullanıcı
     verisi Vercel panelinden kontrol edilmeli. */
  ok(await p.evaluate(()=>Array.isArray(window.vaq) ? window.vaq.length>0 : false),
     'Sayfa görüntüleme kuyruğa alındı (gerçek gönderim: Vercel panelinden bakılmalı)');

  const s=await p.evaluate(()=>document.body.innerText);
  ok(s.includes('Taze et'), 'Site içeriği geliyor');
  ok(s.includes('Şu an'), 'Açık/kapalı durumu hesaplanıyor');
  ok(!s.includes('Müşterilerimiz ne diyor'), 'Yorumlar bölümü gizli (gerçek yorum yok)');

  // Harita ertelemesi üretimde de çalışıyor mu
  let google=0; p.on('request',r=>{ if(/google/.test(r.url())) google++; });
  await p.goto(B+'/',{waitUntil:'networkidle'}); await p.waitForTimeout(2000);
  ok(google===0, `Harita ertelendi — açılışta Google'a ${google} istek`);

  // Favicon + SEO
  const ico=await p.evaluate(()=>document.querySelector('link[rel=icon]')?.getAttribute('href'));
  ok(!!ico, `Favicon var (${ico?.slice(0,30)})`);
  ok((await p.title()).includes('Sarnıç Kasap'), `Başlık: ${await p.title()}`);

  await br.close();
  console.log(f?`\n❌ ${f} BAŞARISIZ`:'\n✅ Üretim doğrulandı'); process.exit(f?1:0);
})();
