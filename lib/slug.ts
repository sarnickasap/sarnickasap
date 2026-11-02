/* ──────────────────────────────────────────────────────────────────────────
   Türkçe adres parçası (slug) — kategori sayfaları için (aşama 4).

   Kural (sırayla):
     1. Türkçe küçük harfe çevir (`tr-TR`: "I" → "ı", "İ" → "i")
     2. ç→c · ğ→g · ı→i · ö→o · ş→s · ü→u  (şapkalı â/î/û → a/i/u)
     3. "&" → " ve "
     4. Kalan aksanlar NFD ile ayrılıp atılır (é → e vb.)
     5. [a-z0-9] dışındaki her dizi tek "-" olur; baştaki/sondaki "-" atılır

   Örnekler (elle doğrulandı — bkz. 06 - İlerleme Günlüğü, aşama 4):
     "Dana"              → "dana"
     "Kıyma & köftelik"  → "kiyma-ve-koftelik"
     "Mangallık"         → "mangallik"
     "Şarküteri"         → "sarkuteri"
     "İç Organ / Sakatat"→ "ic-organ-sakatat"
     "  Kuzu  "          → "kuzu"
     "%%%"               → ""   (boş slug → sayfa üretilmez)

   Saf fonksiyon: tarayıcıda da sunucuda da aynı sonucu verir.
   ────────────────────────────────────────────────────────────────────────── */

const TURKCE_HARF: Readonly<Record<string, string>> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

export function turkceSlug(metin: string): string {
  return metin
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (h) => TURKCE_HARF[h] ?? h)
    .replace(/&/g, " ve ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
