"use client";

import { useEffect } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";

/* Panel hata ekranı — TASARIMDA YOK (K-08 ile aynı gerekçe, K-34).

   Panelin kendi hata sınırı yoktu: sunucu bileşeni patlayınca (veritabanı
   erişilemez, oturum render sırasında düşmüş) kök `app/error.tsx` yakalıyordu
   — ziyaretçi için tasarlanmış KOYU ekran, üstelik tek çıkışı "Ana sayfaya
   dön". Yönetici için yanlış: ne panele dönebiliyor ne ne olduğunu anlıyor.

   Görsel dil giriş sayfasından alındı (Astryx Card, açık tema). Teknik
   ayrıntı gösterilmiyor — altyapı bilgisi sızdırmamak için; `digest`
   sunucu günlüğüyle eşleştirme içindir, kullanıcıya bir şey ifade etmez
   ama destek istenirse işe yarar. */

/** Düz <a>: "Panele dön" Next istemci geçişi yapmasın (bkz. aşağıda). */
function DuzBaglanti(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />;
}

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
    <main className="tema-admin flex min-h-screen items-center justify-center bg-[var(--color-background-body)] px-20 py-64">
      <Card maxWidth={420} className="flex w-full flex-col gap-16">
        <div className="flex flex-col gap-4">
          <Heading level={1}>Panel açılamadı</Heading>
          <Text type="supporting" as="p">
            Veriler yüklenirken bir sorun oluştu. Çoğu zaman geçicidir —
            tekrar deneyin. Sürerse bağlantınızı kontrol edin.
          </Text>
        </div>

        <div className="flex flex-wrap gap-8">
          <Button label="Tekrar dene" variant="primary" onClick={reset} />
          {/* Yumuşak geçiş DEĞİL: hata sınırı bozuk bir render yakaladı,
              aynı hatayı tekrar tetiklememek için tam sayfa yükleme. */}
          <Button label="Panele dön" href="/yonetim" as={DuzBaglanti} />
        </div>

        {error.digest && (
          <Text type="code" color="secondary">
            Hata kodu: {error.digest}
          </Text>
        )}
      </Card>
    </main>
  );
}
