/* ──────────────────────────────────────────────────────────────────────────
   Logo — DÜZ <img>, bilerek.

   Tasarım logoyu düz bir <img> ile, ham PNG'yi tarayıcıda ölçekleyerek
   gösteriyor. `next/image` ile (unoptimized olsa bile) piksel farkı oluşuyor:
   admin header'ında 535 piksel (max sapma 76), ölçüldü. Düz <img>'ye
   geçilince fark 0'a indi.

   next/image burada zaten bir fayda sağlamıyordu: optimizasyon kapalı,
   boyutlar sabit, görsel sayfanın üstünde (tembel yükleme istenmiyor).
   ────────────────────────────────────────────────────────────────────────── */

export function Logo({
  genislik,
  yukseklik,
  alt,
  className,
  style,
}: {
  genislik: number;
  yukseklik: number;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt={alt}
      width={genislik}
      height={yukseklik}
      fetchPriority="high"
      className={className}
      style={style}
    />
  );
}
