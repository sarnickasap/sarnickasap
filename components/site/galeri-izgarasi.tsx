"use client";

import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Grid } from "@astryxdesign/core/Grid";
import { Lightbox } from "@astryxdesign/core/Lightbox";
import { Text } from "@astryxdesign/core/Text";
import { useState } from "react";

/* Galeri ızgarası + tam ekran görüntüleyici (Astryx Grid · AspectRatio ·
   Lightbox). Durum (açık fotoğraf) istemcide; süzme ve güvenli adres
   kontrolü sunucuda (galeri.tsx) yapılır.

   Ölçü: Grid `minWidth 300 · max 4` → 1280'lik kapta en çok 4 sütun, dar
   ekranda tek sütun. `max` olmadan 300px'ten dar telefonda taşardı.
   Tıklanabilir öğe <button>: klavyeyle açılır, odak halkası temanın
   (--focus-outline-color). Lightbox kapanınca odak düğmeye döner.
   Lightbox ilk tıklamada kurulur: kapalıyken de görselleri DOM'a basıp
   indirtiyordu (+ `#galeri img` sayısını şişiriyordu, admin-galeri testi). */

export type GaleriFotografi = { id: number; src: string; caption: string };

export function GaleriIzgarasi({
  fotograflar,
}: {
  fotograflar: GaleriFotografi[];
}) {
  const [acikIndeks, setAcikIndeks] = useState<number | null>(null);
  /* Lightbox kapalıyken de <dialog> içinde görselleri basıyor (ve tarayıcı
     onları hemen indiriyor). İlk tıklamaya kadar hiç kurulmaz; sonra
     kapanış animasyonu ve odağın geri dönüşü için kurulu kalır. */
  const [kuruldu, setKuruldu] = useState(false);

  const ac = (i: number) => {
    setKuruldu(true);
    setAcikIndeks(i);
  };

  return (
    <>
      <Grid columns={{ minWidth: 300, max: 4 }} gap={4}>
        {fotograflar.map((g, i) => (
          <figure key={g.id} className="m-0 flex flex-col gap-10">
            <button
              type="button"
              onClick={() => ac(i)}
              aria-label={g.caption ? `Büyüt: ${g.caption}` : "Fotoğrafı büyüt"}
              className="block w-full cursor-zoom-in overflow-hidden rounded-12 border-0 bg-hover p-0"
            >
              <AspectRatio ratio={4 / 3} fit="cover">
                {/* Blob görseli — next/image uzak alan adı yapılandırması
                      gerektirir; düz <img>. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={300}
                />
              </AspectRatio>
            </button>
            {g.caption && (
              <figcaption>
                <Text type="supporting" className="text-14">
                  {g.caption}
                </Text>
              </figcaption>
            )}
          </figure>
        ))}
      </Grid>

      {kuruldu && (
        <Lightbox
          isOpen={acikIndeks !== null}
          onOpenChange={(acik) => {
            if (!acik) setAcikIndeks(null);
          }}
          media={fotograflar.map((g) => ({
            src: g.src,
            alt: g.caption,
            caption: g.caption || undefined,
          }))}
          index={acikIndeks ?? 0}
          onIndexChange={setAcikIndeks}
        />
      )}
    </>
  );
}
