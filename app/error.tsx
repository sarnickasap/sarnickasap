"use client";

import { useEffect } from "react";

/* Hata ekranı — TASARIMDA YOK (karar K-08).
   Teknik ayrıntı GÖSTERİLMEZ: ziyaretçiye bir şey ifade etmez ve
   altyapı hakkında bilgi sızdırabilir. */

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
        <button
          type="button"
          onClick={reset}
          className="flex h-48 cursor-pointer items-center rounded-8 bg-brand px-22 text-15 font-semibold text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover"
        >
          Tekrar dene
        </button>
        {/* Bilerek <Link> DEĞİL: hata sınırı bozuk bir render durumunu
            yakaladı; yumuşak geçiş aynı hatayı tekrar tetikleyebilir.
            Tam sayfa yükleme temiz bir başlangıç verir. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="flex h-48 items-center rounded-8 border border-edge px-22 text-15 font-medium text-body transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-white"
        >
          Ana sayfa
        </a>
      </div>
    </main>
  );
}
