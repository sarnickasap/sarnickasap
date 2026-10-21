"use client";

import { useCallback, useEffect, useRef } from "react";

/* ──────────────────────────────────────────────────────────────────────────
   Gecikmeli (debounced) otomatik kayıt.

   Tasarım her tuş vuruşunda localStorage'a yazıyordu — maliyeti sıfırdı.
   Burada her tuş vuruşu bir veritabanı yazması demek; 600 ms bekleyip
   son değeri yazıyoruz. Kullanıcı açısından görünür fark yok ("Kaydedildi
   HH:MM" yine çıkıyor), yalnız yazma sıklığı düşüyor.

   Anahtar bazlı: aynı alanın ardışık değişiklikleri tek yazmada birleşir,
   farklı alanlar birbirini iptal etmez.
   ────────────────────────────────────────────────────────────────────────── */

export function useGecikmeliKayit(gecikmeMs = 600) {
  const zamanlayicilar = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const m = zamanlayicilar.current;
    return () => {
      m.forEach((t) => clearTimeout(t));
      m.clear();
    };
  }, []);

  return useCallback(
    (anahtar: string, calistir: () => void | Promise<unknown>) => {
      const m = zamanlayicilar.current;
      const mevcut = m.get(anahtar);
      if (mevcut) clearTimeout(mevcut);
      m.set(
        anahtar,
        setTimeout(() => {
          m.delete(anahtar);
          void calistir();
        }, gecikmeMs),
      );
    },
    [gecikmeMs],
  );
}

/** Tasarım: 'Kaydedildi ' + HH:MM — ilk açılışta 'Otomatik kayıt açık' */
export function kayitDurumMetni(sonKayit: Date | null) {
  if (!sonKayit) return "Otomatik kayıt açık";
  const ss = String(sonKayit.getHours()).padStart(2, "0");
  const dd = String(sonKayit.getMinutes()).padStart(2, "0");
  return `Kaydedildi ${ss}:${dd}`;
}
