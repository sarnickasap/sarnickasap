/* KVKK aydınlatma metninin içeriği — yalnızca app/kvkk/page.tsx kullanır.
   2026-11-06'da sistemin gerçekte işlediği verilere göre yazıldı (web sitesi,
   stok/sipariş programı, WhatsApp Business, e-posta bildirimleri, yedekler).
   Yeni bir veri alanı, amaç ya da hizmet sağlayıcı eklenirse burası ve
   METIN_TARIHI güncellenmeli. */

export const METIN_TARIHI = "6 Kasım 2026";

export const VERI_SORUMLUSU = {
  ad: "Bekir Sarı",
  vergiDairesi: "Gaziemir Vergi Dairesi",
  vergiNo: "7460213928",
} as const;

export const VERI_KATEGORILERI = [
  {
    ad: "Kimlik",
    veriler:
      "Ad soyad; cari hesap ve fatura işlemleri için vergi kimlik numarası veya T.C. kimlik numarası.",
  },
  {
    ad: "İletişim",
    veriler:
      "Cep telefonu numarası, teslimat ve fatura adresi, teslimat bölgesi, cari hesabınız için verdiyseniz e-posta adresi.",
  },
  {
    ad: "Müşteri işlem",
    veriler:
      "Sipariş içeriği ve notları, teslim şekli, günü ve saat aralığı, alışveriş geçmişi, sadakat puanları, kurban hissesi kaydı (hissedar adları ve kesim tercihi).",
  },
  {
    ad: "Finans",
    veriler: "Cari hesap bakiyesi, veresiye ve tahsilat hareketleri, vergi dairesi.",
  },
  {
    ad: "Mesaj içerikleri",
    veriler:
      "WhatsApp hattımıza gönderdiğiniz mesajlar (metin, gönderdiğiniz görsel ve dosyaların açıklaması veya adı, paylaştığınız konum) ve WhatsApp profil adınız. Gönderdiğiniz görsel ve dosyaların kendisi sistemimizde saklanmaz; görüntülendiklerinde WhatsApp altyapısından alınır.",
  },
  {
    ad: "İşlem güvenliği",
    veriler:
      "“Hesabım” girişi için telefonunuza gönderilen tek kullanımlık kodun şifrelenmiş özeti ve oturum bilgisi.",
  },
  {
    ad: "Görsel kayıtlar",
    veriler: "Dükkânımızdaki güvenlik kameralarının görüntü kayıtları.",
  },
  {
    ad: "Müşteri yorumları",
    veriler: "Açık rızanızla sitemizde yayımlanan adınız ve yorumunuz.",
  },
] as const;

export const AMACLAR = [
  {
    amac:
      "Online, WhatsApp veya telefonla verdiğiniz siparişlerin alınması, hazırlanması, gel-al ya da eve teslim edilmesi ve siparişinizin durumu (ör. “siparişiniz hazır”) hakkında bilgilendirilmeniz.",
    sebep: "Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (md. 5/2-c).",
  },
  {
    amac:
      "Satış işlemlerinin yapılması, fatura ve fiş düzenlenmesi, muhasebe ve vergi kayıtlarının tutulması.",
    sebep:
      "Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi (md. 5/2-ç; Vergi Usul Kanunu, Türk Ticaret Kanunu) ve sözleşmenin ifası (md. 5/2-c).",
  },
  {
    amac: "Cari hesap ve veresiye takibi, tahsilat ve ödeme hatırlatmaları.",
    sebep:
      "Sözleşmenin ifası (md. 5/2-c) ve bir hakkın tesisi, kullanılması veya korunması (md. 5/2-e).",
  },
  {
    amac: "WhatsApp ve telefonla ilettiğiniz soru, talep ve şikâyetlerin cevaplanması.",
    sebep:
      "Sözleşmenin kurulmasıyla doğrudan ilgili olması (md. 5/2-c) ve meşru menfaatimiz (md. 5/2-f).",
  },
  {
    amac:
      "“Hesabım” sayfasında cari hesabınızı ve alışverişlerinizi görebilmeniz için kimliğinizin doğrulanması.",
    sebep: "Sözleşmenin ifası (md. 5/2-c) ve meşru menfaatimiz (md. 5/2-f).",
  },
  {
    amac: "Sadakat puanlarının kazandırılması ve kullandırılması.",
    sebep: "Sözleşmenin ifası (md. 5/2-c).",
  },
  {
    amac: "Kurban hissesi kayıtlarının alınması, kesim ve teslimin organize edilmesi.",
    sebep: "Sözleşmenin kurulması ve ifası (md. 5/2-c).",
  },
  {
    amac: "Alışverişiniz sonrasında hizmetimizi değerlendirmenizin istenmesi.",
    sebep:
      "Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (md. 5/2-f).",
  },
  {
    amac:
      "Bilgi güvenliğinin sağlanması, sahte veya kötüye kullanım amaçlı siparişlerin önlenmesi ve verilerin yedeklenmesi.",
    sebep:
      "Meşru menfaatimiz (md. 5/2-f) ve KVKK md. 12'deki veri güvenliği yükümlülüğü (md. 5/2-ç).",
  },
  {
    amac:
      "Dükkânımızın, çalışanlarımızın ve müşterilerimizin güvenliğinin sağlanması; hırsızlık ve benzeri olayların önlenmesi ve tespiti (güvenlik kameraları).",
    sebep:
      "Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatimiz (md. 5/2-f).",
  },
  {
    amac: "Olası uyuşmazlıklarda delil olarak kullanılması.",
    sebep: "Bir hakkın tesisi, kullanılması veya korunması (md. 5/2-e).",
  },
  {
    amac: "Müşteri yorumlarının adınızla birlikte sitemizde yayımlanması.",
    sebep:
      "Açık rızanız (md. 5/1). Rızanızı dilediğiniz zaman geri alabilirsiniz; yorumunuz yayından kaldırılır.",
  },
] as const;

export const TOPLAMA = [
  "Web sitemizdeki online sipariş formu (elektronik, otomatik).",
  "WhatsApp Business hattımıza gönderdiğiniz mesajlar (elektronik, otomatik).",
  "Dükkânda, telefonda veya yazılı olarak bize ilettiğiniz bilgilerin kasa ve cari hesap programımıza girilmesi (kısmen otomatik).",
  "“Hesabım” sayfasına giriş için telefonunuza gönderilen tek kullanımlık kod (elektronik, otomatik).",
  "Dükkânımızdaki güvenlik kameraları (otomatik). Kamera bulunan alanlar uyarı yazısıyla belirtilir.",
] as const;

export const AKTARIMLAR = {
  yurtIci: [
    "Yetkili kamu kurum ve kuruluşları (vergi daireleri, yargı mercileri ve kolluk): kanuni yükümlülük ve talep hâlinde (md. 5/2-ç).",
    "Mali müşavirimiz: muhasebe ve vergi yükümlülüklerinin yerine getirilmesi için (md. 5/2-ç).",
    "Avukatımız: yalnızca bir uyuşmazlık hâlinde, hakkın tesisi ve korunması için (md. 5/2-e).",
  ],
  yurtDisi: [
    "Vercel Inc. (ABD): web sitesinin ve sipariş/cari hesap programının barındırılması, ürün görselleri ve otomatik yedekler.",
    "Neon (veritabanı hizmeti; sunucular Almanya ve ABD'de): sipariş, cari hesap ve site verilerinin saklanması.",
    "Resend (ABD): yeni sipariş bildirimlerinin işletmemize, ödeme hatırlatmalarının size e-postayla gönderilmesi.",
    "Meta Platforms (WhatsApp Business Platformu): WhatsApp yazışmaları, sipariş bilgilendirmeleri ve giriş kodlarının gönderilmesi.",
    "Google: yalnızca sitede “Haritayı göster”e bastığınızda haritanın yüklenmesi (bu sırada IP adresiniz Google'a iletilir) ve değerlendirme bağlantısını açtığınızda.",
  ],
} as const;

export const SAKLAMA = [
  "Satış, fatura, cari hesap, sipariş ve kurban kayıtları: ticari defter ve belgeler için öngörülen 10 yıl (Türk Ticaret Kanunu md. 82; Vergi Usul Kanunu md. 253).",
  "WhatsApp yazışmaları: iletişimin amacının gerektirdiği süre ve olası uyuşmazlıklar için zamanaşımı süresi boyunca, en fazla 10 yıl.",
  "Tek kullanımlık giriş kodları: en fazla 10 dakika; kullanıldığında silinir. “Hesabım” oturumu: 30 gün.",
  "Otomatik yedekler: 30 gün; daha eski yedekler silinir.",
  "Güvenlik kamerası kayıtları: kayıt cihazında en fazla 15 gün; süre sonunda yeni kayıtlar eskilerin üzerine yazılır. Bir olayın incelenmesi gerekirse ilgili kayıt, olay sonuçlanana kadar saklanır.",
  "Tarayıcınızdaki sepet: siparişiniz tamamlanana veya siz silene kadar yalnızca kendi cihazınızda.",
] as const;

export const TARAYICI = [
  "Web sitemizin herkese açık sayfaları çerez kullanmaz.",
  "Sepetiniz, tarayıcınızın yerel depolamasında (localStorage) yalnızca ürün kodu, miktar ve not olarak tutulur; siparişin iki kez gönderilmesini önleyen tek kullanımlık anahtar oturum depolamasında (sessionStorage) tutulur. Bunlar sitenin çalışması için zorunludur ve siz sipariş verene kadar bize gönderilmez.",
  "Ziyaret istatistikleri için Vercel Web Analytics kullanılır. Çerez kullanmaz ve sizi tanımlamaz; yalnızca toplu sayfa görüntüleme sayıları üretir.",
  "Harita, yalnızca “Haritayı göster”e bastığınızda Google Haritalar'dan yüklenir; Google bu sırada kendi çerezlerini kullanabilir.",
  "“Hesabım” sayfasına giriş yaptığınızda oturumunuzu sürdürmek için 30 gün geçerli, zorunlu bir oturum çerezi kullanılır.",
] as const;

export const HAKLAR = [
  "Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,",
  "İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,",
  "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,",
  "Eksik veya yanlış işlenmişse düzeltilmesini isteme,",
  "KVKK md. 7'de öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,",
  "Düzeltme, silme veya yok etme işlemlerinin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,",
  "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,",
  "Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.",
] as const;
