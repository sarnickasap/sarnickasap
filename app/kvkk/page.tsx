import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AltSayfa } from "@/components/site/alt-sayfa";
import { siteBilgisiGetir } from "@/lib/data";
import { ISLETME_ADI } from "@/lib/format";
import { altSayfaMetadata } from "@/lib/seo";
import {
  AKTARIMLAR,
  AMACLAR,
  HAKLAR,
  METIN_TARIHI,
  SAKLAMA,
  TARAYICI,
  TOPLAMA,
  VERI_KATEGORILERI,
  VERI_SORUMLUSU,
} from "./metin";

/* ──────────────────────────────────────────────────────────────────────────
   KVKK aydınlatma metni (K-37) — online sipariş formundaki onay kutusu
   buraya bağlanır. 6698 sayılı Kanun md. 10 ve Aydınlatma Yükümlülüğü
   Tebliği'ndeki başlıklara göre: veri sorumlusu, amaç–hukuki sebep
   eşleşmesi, aktarım, toplama yöntemi, haklar, başvuru.

   İçerik (./metin.ts) 2026-11-06'da sistemin (web sitesi + stok/sipariş
   programı + WhatsApp + e-posta) gerçekte işlediği verilere göre yazıldı.
   Sisteme yeni bir kişisel veri ya da hizmet sağlayıcı eklenirse metin.ts
   güncellenmeli. Adres ve telefon panelden (site_info) gelir.
   ────────────────────────────────────────────────────────────────────────── */

export async function generateMetadata(): Promise<Metadata> {
  const info = await siteBilgisiGetir();
  return altSayfaMetadata({
    baslik: "KVKK aydınlatma metni",
    aciklama: `${ISLETME_ADI} kişisel verilerin işlenmesine ilişkin aydınlatma metni.`,
    yol: "/kvkk",
    ogImageUrl: info.ogImageUrl,
  });
}

const BASLIK = "m-0 font-display text-20 font-semibold text-cream";
const ALT_BASLIK = "m-0 text-16 font-semibold text-cream";
const PARAGRAF = "m-0 text-16 leading-16 text-read";
const LISTE = "m-0 flex flex-col gap-6 pl-20 text-16 leading-16 text-read";

function Bolum({ baslik, children }: { baslik: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-10">
      <h2 className={BASLIK}>{baslik}</h2>
      {children}
    </section>
  );
}

function Liste({ ogeler }: { ogeler: readonly string[] }) {
  return (
    <ul className={LISTE}>
      {ogeler.map((o) => (
        <li key={o}>{o}</li>
      ))}
    </ul>
  );
}

export default async function KvkkSayfasi() {
  const info = await siteBilgisiGetir();

  return (
    <AltSayfa ust="Kişisel veriler" baslik="KVKK aydınlatma metni">
      <article className="flex flex-col gap-28">
        <p className={PARAGRAF}>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) md. 10 ve Aydınlatma
          Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca;
          web sitemizi ziyaret eden, online ya da WhatsApp üzerinden sipariş veren, dükkânımızdan
          alışveriş yapan ve cari hesabı bulunan müşterilerimizi bilgilendirmek için hazırlanmıştır.
        </p>

        <Bolum baslik="1. Veri sorumlusu">
          <p className={PARAGRAF}>
            Veri sorumlusu, “{ISLETME_ADI}” adıyla faaliyet gösteren şahıs işletmesinin sahibi{" "}
            <strong className="font-semibold text-cream">{VERI_SORUMLUSU.ad}</strong>’dır.
          </p>
          <ul className={LISTE}>
            <li>
              Vergi dairesi ve no: {VERI_SORUMLUSU.vergiDairesi}, {VERI_SORUMLUSU.vergiNo}
            </li>
            <li>Adres: {info.address}</li>
            <li>Telefon: {info.phone}</li>
          </ul>
        </Bolum>

        <Bolum baslik="2. İşlenen kişisel veriler">
          <ul className={LISTE}>
            {VERI_KATEGORILERI.map((k) => (
              <li key={k.ad}>
                <strong className="font-semibold text-cream">{k.ad}:</strong> {k.veriler}
              </li>
            ))}
          </ul>
          <p className={PARAGRAF}>
            Özel nitelikli kişisel veri (sağlık, din, biyometrik veri vb.) talep etmiyoruz. Sipariş
            notu veya mesaj alanlarına bu tür bilgileri yazmamanızı rica ederiz.
          </p>
        </Bolum>

        <Bolum baslik="3. İşleme amaçları ve hukuki sebepler">
          <p className={PARAGRAF}>
            Kişisel verileriniz aşağıdaki amaçlarla ve her amacın altında belirtilen KVKK md. 5
            hukuki sebebine dayanılarak işlenir:
          </p>
          <ul className="m-0 flex list-none flex-col gap-12 p-0">
            {AMACLAR.map((a) => (
              <li key={a.amac} className="flex flex-col gap-4 rounded-8 border border-line p-14">
                <span className="text-16 leading-16 text-read">{a.amac}</span>
                <span className="text-14 leading-16 text-muted">Hukuki sebep: {a.sebep}</span>
              </li>
            ))}
          </ul>
        </Bolum>

        <Bolum baslik="4. Toplama yöntemi">
          <Liste ogeler={TOPLAMA} />
        </Bolum>

        <Bolum baslik="5. Kişisel verilerin aktarılması">
          <p className={PARAGRAF}>
            Kişisel verileriniz satılmaz ve pazarlama amacıyla üçüncü kişilerle paylaşılmaz.
            Yalnızca aşağıdaki alıcılara, belirtilen amaçla ve gerektiği ölçüde aktarılır.
          </p>
          <h3 className={ALT_BASLIK}>Yurt içi</h3>
          <Liste ogeler={AKTARIMLAR.yurtIci} />
          <h3 className={ALT_BASLIK}>Yurt dışı (hizmet sağlayıcılar)</h3>
          <p className={PARAGRAF}>
            Web sitemiz, sipariş ve cari hesap programımız ile mesajlaşma altyapımız, sunucuları
            yurt dışında bulunan hizmet sağlayıcılarda çalışır. Bu nedenle verileriniz KVKK md. 9
            kapsamında, yalnızca hizmetin sunulması amacıyla aşağıdaki sağlayıcıların sunucularına
            aktarılır:
          </p>
          <Liste ogeler={AKTARIMLAR.yurtDisi} />
          <p className={PARAGRAF}>
            Yurt dışı aktarımlarda uygulanan güvenceler hakkında bilgi almak için 9. maddedeki
            yollarla bize başvurabilirsiniz.
          </p>
        </Bolum>

        <Bolum baslik="6. Saklama süreleri">
          <Liste ogeler={SAKLAMA} />
          <p className={PARAGRAF}>
            Süre dolduğunda veya işleme şartları ortadan kalktığında veriler silinir, yok edilir ya
            da anonim hâle getirilir.
          </p>
        </Bolum>

        <Bolum baslik="7. Çerezler ve tarayıcı depolama">
          <Liste ogeler={TARAYICI} />
        </Bolum>

        <Bolum baslik="8. KVKK md. 11 kapsamındaki haklarınız">
          <Liste ogeler={HAKLAR} />
        </Bolum>

        <Bolum baslik="9. Başvuru">
          <p className={PARAGRAF}>
            Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında
            Tebliğ uyarınca Türkçe olarak; kimliğinizi gösterir belgeyle şahsen ya da ıslak imzalı
            dilekçeyle posta veya noter aracılığıyla {info.address} adresine iletebilirsiniz.
            Başvurunuzda adınız soyadınız, imzanız, T.C. kimlik numaranız (yabancılar için uyruk ve
            pasaport ya da kimlik numarası), tebligata esas adresiniz, varsa e-posta adresiniz,
            telefon numaranız ve talep konunuz bulunmalıdır.
          </p>
          <p className={PARAGRAF}>
            Talebiniz niteliğine göre en geç 30 gün içinde ücretsiz sonuçlandırılır; işlemin ayrıca
            bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulunca belirlenen tarifedeki
            ücret alınabilir. Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya
            süresinde cevap verilmemesi hâlinde KVKK md. 14 uyarınca Kişisel Verileri Koruma
            Kuruluna şikâyette bulunabilirsiniz.
          </p>
        </Bolum>

        <p className="m-0 text-13 text-muted-dark">Son güncelleme: {METIN_TARIHI}</p>
      </article>
    </AltSayfa>
  );
}
