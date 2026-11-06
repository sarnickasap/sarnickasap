import type { Metadata } from "next";
import { AltSayfa } from "@/components/site/alt-sayfa";
import { siteBilgisiGetir } from "@/lib/data";
import { ISLETME_ADI, telLink } from "@/lib/format";
import { altSayfaMetadata } from "@/lib/seo";

/* ──────────────────────────────────────────────────────────────────────────
   KVKK aydınlatma metni (K-37) — online sipariş formundaki onay kutusu
   buraya bağlanır. İşletme adresi ve telefonu panelden (site_info) gelir;
   elle güncellenecek ikinci bir yer yok.
   ────────────────────────────────────────────────────────────────────────── */

/* Kök layout'un canonical'ı ve og:url'si ana sayfa; alt sayfa kendi
   adresini söylemeli (aşama 4 SEO temizliği). */
export async function generateMetadata(): Promise<Metadata> {
  const info = await siteBilgisiGetir();
  return altSayfaMetadata({
    baslik: "KVKK aydınlatma metni",
    aciklama: "Sarnıç Kasap online sipariş kişisel verilerin korunması aydınlatma metni.",
    yol: "/kvkk",
    ogImageUrl: info.ogImageUrl,
  });
}

const BASLIK = "m-0 font-display text-20 font-semibold text-cream";
const PARAGRAF = "m-0 text-16 leading-16 text-read";
const LISTE = "m-0 flex flex-col gap-6 pl-20 text-16 leading-16 text-read";

export default async function KvkkSayfasi() {
  const info = await siteBilgisiGetir();

  return (
    <AltSayfa ust="Kişisel veriler" baslik="KVKK aydınlatma metni">
      <article className="flex flex-col gap-24">
        <section className="flex flex-col gap-10">
          <h2 className={BASLIK}>Veri sorumlusu</h2>
          <p className={PARAGRAF}>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu{" "}
            {ISLETME_ADI}’tır. Adres: {info.address}. Telefon: {info.phone}.
          </p>
        </section>

        <section className="flex flex-col gap-10">
          <h2 className={BASLIK}>İşlenen veriler ve amaç</h2>
          <p className={PARAGRAF}>
            Online sipariş verdiğinizde adınız soyadınız, cep telefonu numaranız, teslimat
            adresiniz ve bölgeniz, sipariş içeriğiniz ve notlarınız işlenir. Bu veriler yalnızca
            siparişinizin hazırlanması, teslim edilmesi ve sipariş hakkında sizinle iletişim
            kurulması amacıyla kullanılır. Pazarlama amacıyla kullanılmaz ve satılmaz.
          </p>
        </section>

        <section className="flex flex-col gap-10">
          <h2 className={BASLIK}>Verilerin aktarılması</h2>
          <p className={PARAGRAF}>
            Siparişiniz, hazırlanabilmesi için işletmemizin stok ve sipariş programına iletilir. Bu
            web sitesi ve sipariş programı, sunucuları yurt dışında da bulunabilen bulut hizmet
            sağlayıcılarında (barındırma ve veritabanı hizmetleri) çalışır; verileriniz yalnızca
            hizmetin sunulması için bu sağlayıcıların sunucularında saklanır (KVKK md. 9).
            WhatsApp’tan yazdığınızda mesajlarınız WhatsApp (Meta) üzerinden iletilir. Bunların
            dışında verileriniz üçüncü kişilerle paylaşılmaz; yalnızca yasal yükümlülük hâlinde
            yetkili kurumlara aktarılabilir.
          </p>
        </section>

        <section className="flex flex-col gap-10">
          <h2 className={BASLIK}>Hukuki sebep ve toplama yöntemi</h2>
          <p className={PARAGRAF}>
            Verileriniz bu web sitesindeki sipariş formu aracılığıyla elektronik ortamda toplanır ve
            KVKK md. 5/2-c (bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması) ile
            md. 5/2-ç (veri sorumlusunun hukuki yükümlülüğü) hukuki sebeplerine dayanılarak işlenir.
          </p>
        </section>

        <section className="flex flex-col gap-10">
          <h2 className={BASLIK}>Saklama süresi</h2>
          <p className={PARAGRAF}>
            Sipariş kayıtları, vergi ve ticaret mevzuatının öngördüğü yasal saklama süreleri boyunca
            saklanır; sürenin sonunda silinir, yok edilir ya da anonim hâle getirilir.
          </p>
        </section>

        <section className="flex flex-col gap-10">
          <h2 className={BASLIK}>KVKK md. 11 kapsamındaki haklarınız</h2>
          <ul className={LISTE}>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme,</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>KVKK md. 7 şartları çerçevesinde silinmesini veya yok edilmesini isteme,</li>
            <li>Düzeltme ve silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
            <li>Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme,</li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-10">
          <h2 className={BASLIK}>Başvuru</h2>
          <p className={PARAGRAF}>
            Haklarınıza ilişkin taleplerinizi {info.address} adresine yazılı olarak ya da{" "}
            <a href={telLink(info.whatsapp)} className="text-cream underline underline-offset-2">
              {info.phone}
            </a>{" "}
            numaralı telefondan bize iletebilirsiniz. Talepleriniz en geç 30 gün içinde ücretsiz
            olarak sonuçlandırılır.
          </p>
        </section>
      </article>
    </AltSayfa>
  );
}
