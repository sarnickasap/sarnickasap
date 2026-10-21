/* Tasarımın `sarnic-store.js` dosyasındaki DEFAULT nesnesi.
   Hem ilk seed hem de "Varsayılan verilere dön" eylemi bunu kullanır.

   ⚠️ Yorumlar bilerek YOK (K-15): gerçek değiller, uydurma yorum
   yayınlanmayacak. Tasarımın DEFAULT'unda 3 yorum vardı. */

export const KATEGORILER = [
  "Dana", "Kuzu", "Tavuk", "Kıyma & köftelik", "Mangallık", "Hazır marine", "Sakatat",
];

/** [ad, kategori, fiyat, not, stokta] */
export const URUNLER: [string, string, number, string, boolean][] = [
  ["Dana kuşbaşı", "Dana", 890, "Sinirsiz, but ve kol", true],
  ["Dana antrikot", "Dana", 1150, "Kemiksiz, dilimlenmiş", true],
  ["Dana bonfile", "Dana", 1450, "Bütün veya madalyon", true],
  ["Dana kaburga", "Dana", 720, "Fırınlık, kemikli", true],
  ["Kuzu pirzola", "Kuzu", 1250, "Günlük kesim", true],
  ["Kuzu but", "Kuzu", 980, "Kemikli, bütün veya yarım", true],
  ["Kuzu kol", "Kuzu", 920, "Fırın ve haşlama için", false],
  ["Tavuk göğüs", "Tavuk", 260, "Fileto", true],
  ["Tavuk kanat", "Tavuk", 230, "", true],
  ["Tavuk baget", "Tavuk", 190, "", true],
  ["Dana kıyma", "Kıyma & köftelik", 820, "Az yağlı, iki kez çekilmiş", true],
  ["Köftelik kıyma", "Kıyma & köftelik", 850, "Dana-kuzu karışık", true],
  ["Kasap köfte", "Kıyma & köftelik", 900, "Hazır baharatlı", true],
  ["Kuzu şiş", "Mangallık", 1100, "Şişe dizilmiş", true],
  ["Dana dallas", "Mangallık", 1300, "Kemikli, 3 cm", true],
  ["Marine tavuk şiş", "Hazır marine", 340, "Yoğurtlu, baharatlı", true],
  ["Marine dana bonfile", "Hazır marine", 1500, "Kekikli, zeytinyağlı", true],
  ["Kuzu ciğer", "Sakatat", 600, "", true],
  ["Dana işkembe", "Sakatat", 380, "Temizlenmiş", true],
];

export const FIRSATLAR = [
  { title: "Mangal paketi", description: "1 kg köfte, 1 kg tavuk şiş, 500 g kuzu pirzola", oldPrice: 1850, newPrice: 1590, until: "Pazar akşamına kadar", active: true },
  { title: "Dana kıyma", description: "Haftanın fırsatı, 2 kg ve üzeri alımlarda", oldPrice: 820, newPrice: 760, until: "Bu hafta", active: true },
  { title: "Marine tavuk şiş", description: "Günün ürünü", oldPrice: 340, newPrice: 299, until: "Bugün", active: true },
];

export const GALERI = [
  "Dükkân vitrini", "Kesim tezgâhı", "Dana antrikot",
  "Kuzu pirzola", "Mangal paketi", "Ekibimiz",
];

export const SAATLER: [string, string, string][] = [
  ["Pazartesi", "08:00", "20:00"],
  ["Salı", "08:00", "20:00"],
  ["Çarşamba", "08:00", "20:00"],
  ["Perşembe", "08:00", "20:00"],
  ["Cuma", "08:00", "20:00"],
  ["Cumartesi", "08:00", "20:00"],
  ["Pazar", "09:00", "14:00"],
];

export const BILGI = {
  phone: "0552 126 98 35",
  whatsapp: "905521269835",
  address: "Atatürk, B. Menderes Cad. 126/D, Gaziemir, İzmir",
  heroTitle: "Taze et, doğru kesim.",
  heroSub:
    "Gaziemir’de dana, kuzu ve tavukta günlük kesim. Siparişinizi WhatsApp’tan iletin, siz gelmeden hazırlayalım.",
  about:
    "Sarnıç Kasap, Gaziemir’de mahalle kasaplığını sürdüren bir aile işletmesidir. Etlerimizi güvendiğimiz üreticilerden alır, dükkânda kendimiz parçalar ve isteğinize göre keseriz. Kuşbaşından mangallığa, köftelikten marine ürünlere kadar her siparişi aynı özenle hazırlarız.",
  seoTitle: "Sarnıç Kasap — Gaziemir’de taze et, doğru kesim",
  seoDescription:
    "Gaziemir’de dana, kuzu ve tavukta günlük kesim. Kilo fiyatları, haftanın fırsatları ve WhatsApp’tan sipariş.",
};
