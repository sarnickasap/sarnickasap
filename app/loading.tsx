import { Skeleton } from "@astryxdesign/core/Skeleton";
import { VStack } from "@astryxdesign/core/VStack";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";

/* Yükleniyor — TASARIMDA YOK (karar K-08).
   Site zaten statik kabukla anında geliyor; bu yalnızca ilk yüklemedeki
   kısa pencere için. Astryx Skeleton: sayfa başlığı + bölüm başlığı +
   iki metin satırı biçiminde sade bir iskelet (gösterişsiz, sayfanın
   gerçek düzenini taklit etmeye çalışmıyor). Skeleton'ın parıltısı
   `prefers-reduced-motion` altında durur (Astryx). */
export default function Yukleniyor() {
  return (
    <div role="status" className="min-h-screen bg-ink">
      <VisuallyHidden>Sayfa yükleniyor</VisuallyHidden>
      <VStack
        gap={4}
        aria-hidden="true"
        className="mx-auto max-w-[1280px] px-24 py-112"
      >
        <Skeleton width={96} height={12} radius={1} />
        <Skeleton width="min(100%, 420px)" height={48} radius={2} index={1} />
        <Skeleton width="min(100%, 640px)" height={16} radius={1} index={2} />
        <Skeleton width="min(100%, 520px)" height={16} radius={1} index={3} />
      </VStack>
    </div>
  );
}
