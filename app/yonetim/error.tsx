"use client";

import { useEffect } from "react";

/* Panel hata ekranı — TASARIMDA YOK (K-08 ile aynı gerekçe, K-34).

   Panelin kendi hata sınırı yoktu: sunucu bileşeni patlayınca (veritabanı
   erişilemez, oturum render sırasında düşmüş) kök `app/error.tsx` yakalıyordu
   — ziyaretçi için tasarlanmış KOYU ekran, üstelik tek çıkışı "Ana sayfaya
   dön". Yönetici için yanlış: ne panele dönebiliyor ne ne olduğunu anlıyor.

   Görsel dil giriş sayfasından alındı (`tema-admin`, açık tema). Teknik
   ayrıntı gösterilmiyor — altyapı bilgisi sızdırmamak için; `digest`
   sunucu günlüğüyle eşleştirme içindir, kullanıcıya bir şey ifade etmez
   ama destek istenirse işe yarar. */

export default function PanelHatasi({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Panel hatası:", error);
  }, [error]);

  return (
    <main className="tema-admin flex min-h-screen items-center justify-center bg-admin-bg px-20 py-64">
      <div className="flex w-full max-w-[420px] flex-col gap-16 rounded-12 border border-admin-border bg-admin-card p-20">
        <div className="flex flex-col gap-4">
          <h1 className="m-0 font-display text-28 font-bold tracking-admin-h1 text-black">
            Panel açılamadı
          </h1>
          <p className="m-0 text-14 leading-15 text-admin-muted">
            Veriler yüklenirken bir sorun oluştu. Çoğu zaman geçicidir —
            tekrar deneyin. Sürerse bağlantınızı kontrol edin.
          </p>
        </div>

        <div className="flex flex-wrap gap-8">
          <button
            type="button"
            onClick={reset}
            className="h-38 cursor-pointer rounded-8 border-0 bg-brand px-18 text-14 font-semibold text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover"
          >
            Tekrar dene
          </button>
          {/* Yumuşak geçiş DEĞİL: hata sınırı bozuk bir render yakaladı,
              aynı hatayı tekrar tetiklememek için tam sayfa yükleme. */}
          <a
            href="/yonetim"
            className="flex h-38 items-center rounded-8 border border-admin-border bg-admin-card px-14 text-14 font-medium text-black no-underline transition-colors duration-150 ease-out-soft hover:bg-admin-row"
          >
            Panele dön
          </a>
        </div>

        {error.digest && (
          <p className="m-0 font-mono text-12 text-admin-muted">
            Hata kodu: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
