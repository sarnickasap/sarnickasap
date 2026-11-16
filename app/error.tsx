"use client";

import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { useEffect } from "react";
import { BOS_SAYFA } from "@/components/site/bilgi-bolum-basligi";
import { CTA, CTA_IKINCIL } from "@/components/site/siparis-stilleri";

/* Hata ekranı — TASARIMDA YOK (karar K-08).
   Teknik ayrıntı GÖSTERİLMEZ: ziyaretçiye bir şey ifade etmez ve
   altyapı hakkında bilgi sızdırabilir.
   Astryx EmptyState (başlık h1 + açıklama + iki eylem). */

/** Tam sayfa yüklemesi için düz <a> — Astryx Button'un varsayılan bağlantısı
 *  (LinkProvider → next/link) yumuşak geçiş yapar; aşağıdaki nota bakın. */
function DuzBaglanti(props: React.ComponentProps<"a">) {
  return <a {...props} />;
}

export default function Hata({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sayfa hatası:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-24 py-96">
      <EmptyState
        headingLevel={1}
        className={BOS_SAYFA}
        title="Bir şeyler ters gitti"
        description="Sayfa yüklenirken bir sorun oluştu. Tekrar denemek ister misiniz?"
        actions={
          <>
            <Button variant="primary" size="lg" label="Tekrar dene" onClick={reset} className={CTA} />
            {/* Bilerek next/link DEĞİL: hata sınırı bozuk bir render durumunu
                yakaladı; yumuşak geçiş aynı hatayı tekrar tetikleyebilir.
                Tam sayfa yükleme temiz bir başlangıç verir. */}
            <Button
              size="lg"
              label="Ana sayfa"
              href="/"
              as={DuzBaglanti}
              className={CTA_IKINCIL}
            />
          </>
        }
      />
    </main>
  );
}
