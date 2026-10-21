/* ──────────────────────────────────────────────────────────────────────────
   Fotoğraf Yer Tutucusu — vault "Foto Yer Tutucu" notundan birebir.

     aspect-ratio 4/3 · r12 · 1px dashed #333333
     bg repeating-linear-gradient(135deg,#121212 0 12px,#161616 12px 24px)
     ortalı · mono 12px · #737373 (K-21 → #8a8a8a)

   Site genelinde 2 yerde: Hakkımızda sol kolon ve URL'siz galeri figürleri.
   Admin karşılığı FARKLIDIR (r8, #d4d4d4 kesikli, düz #fafafa zemin).
   ────────────────────────────────────────────────────────────────────────── */

export function FotoYerTutucu({ yazi }: { yazi: string }) {
  return (
    <div className="placeholder-stripes flex aspect-[4/3] items-center justify-center rounded-12 border border-dashed border-edge">
      <span className="font-mono text-12 text-muted-dark">{yazi}</span>
    </div>
  );
}
