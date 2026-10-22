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

/* ── Kayıt hatası yayını (K-34) ──────────────────────────────────────────

   ESKİDEN: `void calistir()` — söz ateşlenip unutuluyordu ve panelde
   hiçbir `.catch()` yoktu. Sunucu eylemi reddederse (veritabanı
   erişilemez, oturum düşmüş, doğrulama hatası) kullanıcı HİÇBİR ŞEY
   görmüyordu: iyimser arayüz yeni fiyatı ekranda tutuyor, kullanıcı
   kaydedildi sanıp sayfadan ayrılıyordu.

   Bağlam/prop zinciri kurmak yerine küçük bir yayın kullanılıyor: hook
   her hatayı buraya bildirir, panel başlığı dinler. Tek abone var ama
   her sekme otomatik kapsanıyor — yeni sekme eklenince unutulamaz. */
/* Durum TEK yerden yayınlanıyor: sarmalı hem başarıyı hem hatayı bildirir.

   İlk denemede yalnızca HATA yayınlanıyordu; hatanın temizlenmesi her
   sekmenin kendi `.then(onDegisti)` çağrısına bırakılmıştı. Ölçümde bu
   güvenilmez çıktı — POST başarısız olduğu hâlde hata temizlenebiliyordu.
   Artık "temizle" sinyali yalnızca sözün GERÇEKTEN çözülmesinden gelir. */
type Sonuc = { tamam: true } | { tamam: false; hata: unknown };
type Dinleyici = (s: Sonuc) => void;
const dinleyiciler = new Set<Dinleyici>();

/** Aboneliği bırakan fonksiyon döner. React temizleyicisi `void`
 *  beklediği için `Set.delete`'in boolean'ı dışarı sızdırılmıyor. */
export function kayitSonucuDinle(d: Dinleyici): () => void {
  dinleyiciler.add(d);
  return () => {
    dinleyiciler.delete(d);
  };
}

function bildir(s: Sonuc) {
  if (!s.tamam) console.error("Kayıt başarısız:", s.hata);
  dinleyiciler.forEach((d) => d(s));
}

export function useGecikmeliKayit(gecikmeMs = 600) {
  const zamanlayicilar = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /** Bekleyen yazmalar — anahtar → çalıştırılacak iş. */
  const bekleyen = useRef(new Map<string, () => void>());

  useEffect(() => {
    const z = zamanlayicilar.current;
    const b = bekleyen.current;

    /* Bekleyen yazmaları BOŞALT, iptal etme.

       Eskiden temizleyici `clearTimeout` yapıp haritayı siliyordu: 600 ms'lik
       gecikme dolmadan kullanıcı sayfayı yenilerse ya da sekme değiştirirse
       yazma SESSİZCE DÜŞÜYORDU. Kullanıcı yazdığı değeri ekranda görüyor,
       yeniliyor ve değer kaybolmuş oluyordu.

       Ölçümde yakalandı: `admin-iletisim` testinde Pazar kapanış saatinin
       geri yüklenmesi tam da bu yüzden tutmadı ve üretimde yanlış saat kaldı.

       Sert yenilemede tarayıcı isteği yarıda kesebilir; bu tam güvence
       değil ama yazmayı hiç başlatmamaktan kesinlikle iyi. Yumuşak geçişte
       (sekme değiştirme) tam koruma sağlar. */
    const bosalt = () => {
      z.forEach((t) => clearTimeout(t));
      z.clear();
      const isler = [...b.values()];
      b.clear();
      isler.forEach((is) => is());
    };

    /* Sayfa gizlenirken de boşalt — mobilde sekme değiştirmek `unmount`
       tetiklemiyor ama `visibilitychange` tetikliyor. */
    const gizlendi = () => {
      if (document.visibilityState === "hidden") bosalt();
    };
    document.addEventListener("visibilitychange", gizlendi);

    return () => {
      document.removeEventListener("visibilitychange", gizlendi);
      bosalt();
    };
  }, []);

  return useCallback(
    (
      anahtar: string,
      calistir: () => void | Promise<unknown>,
      hemen = false,
    ) => {
      const sarmali = () => {
        bekleyen.current.delete(anahtar);
        Promise.resolve()
          .then(calistir)
          .then(() => bildir({ tamam: true }))
          .catch((hata) => bildir({ tamam: false, hata }));
      };

      if (hemen) {
        sarmali();
        return;
      }

      const m = zamanlayicilar.current;
      const mevcut = m.get(anahtar);
      if (mevcut) clearTimeout(mevcut);
      bekleyen.current.set(anahtar, sarmali);
      m.set(
        anahtar,
        setTimeout(() => {
          m.delete(anahtar);
          sarmali();
        }, gecikmeMs),
      );
    },
    [gecikmeMs],
  );
}

/** Tasarım: 'Kaydedildi ' + HH:MM — ilk açılışta 'Otomatik kayıt açık'.
 *  Hata durumu tasarımda YOK; aynı metin alanı kullanılıyor, yeni bir
 *  arayüz öğesi eklenmedi. */
export function kayitDurumMetni(sonKayit: Date | null, hata = false) {
  if (hata) return "Kaydedilemedi — bağlantıyı kontrol edip tekrar deneyin";
  if (!sonKayit) return "Otomatik kayıt açık";
  const ss = String(sonKayit.getHours()).padStart(2, "0");
  const dd = String(sonKayit.getMinutes()).padStart(2, "0");
  return `Kaydedildi ${ss}:${dd}`;
}
