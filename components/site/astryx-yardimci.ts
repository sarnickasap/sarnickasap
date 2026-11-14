/* Astryx bileşenleriyle çalışırken iki küçük köprü. */

/** Sunucu eyleminin alan hatasını Astryx form alanlarının `status` biçimine
 *  çevirir. Hata yoksa `undefined` — alan normal görünür. `type: "error"`
 *  alanda `aria-invalid` ayarlar ve mesajı alana bağlar. */
export function alanDurumu(hata: string | undefined) {
  return hata ? { type: "error" as const, message: hata } : undefined;
}

/** Astryx prop tiplerinde olmayan yerel HTML nitelikleri. Bileşenler kalan
 *  nitelikleri asıl öğeye (<input>, <a>) aktarıyor; tipler aktarmıyor.
 *  `isRequired` yerine `required`: Astryx'in "Required" etiketi Türkçe
 *  katalog yüklenmeden İngilizce görünürdü. */
type YerelNitelikler = { maxLength?: number; required?: boolean; title?: string };

export function yerelNitelikler(n: YerelNitelikler): object {
  return n;
}
