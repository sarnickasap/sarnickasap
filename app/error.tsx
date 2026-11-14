"use client";

import { Button } from "@astryxdesign/core/Button";
import { useEffect } from "react";
import { CTA, CTA_IKINCIL } from "@/components/site/siparis-stilleri";

/* Hata ekranı — TASARIMDA YOK (karar K-08).
   Teknik ayrıntı GÖSTERİLMEZ: ziyaretçiye bir şey ifade etmez ve
   altyapı hakkında bilgi sızdırabilir. */

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-28 bg-ink px-24 py-96 text-center">
      <div className="flex flex-col gap-12">
        <h1 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">
          Bir şeyler ters gitti
        </h1>
        <p className="m-0 max-w-[420px] text-16 leading-16 text-muted">
          Sayfa yüklenirken bir sorun oluştu. Tekrar denemek ister misiniz?
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-12">
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
      </div>
    </main>
  );
}
