import { Heading } from "@astryxdesign/core/Heading";
import { List, ListItem } from "@astryxdesign/core/List";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
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

   Astryx: VStack · Heading (h2/h3) · Text (paragraf) · List/ListItem
   (madde listeleri; amaç–hukuki sebep listesi `description` ile).
   Bölümler Collapsible DEĞİL: aydınlatma metni katmanlı/gizli olmadan
   okunabilmeli (KVKK aydınlatma yükümlülüğü) ve arama motorları için
   tüm metin açık kalmalı.
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
const ALT_BASLIK = "m-0 font-sans text-16 font-semibold text-cream";
const PARAGRAF = "m-0 text-16 leading-16 text-read";
const MADDE = "text-16 leading-16 text-read";

function Paragraf({ children }: { children: ReactNode }) {
  return (
    <Text as="p" className={PARAGRAF}>
      {children}
    </Text>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: ReactNode }) {
  return (
    <VStack as="section" className="gap-10">
      <Heading level={2} className={BASLIK}>
        {baslik}
      </Heading>
      {children}
    </VStack>
  );
}

/** Madde işaretli liste. Etiket ReactNode verilir: düz metin etiketini
 *  ListItem tek satıra kırpar, hukuki metin kırpılmamalı. */
function Liste({ children }: { children: ReactNode }) {
  return (
    <List listStyle="disc" density="compact" edge="flush" className="pl-20">
      {children}
    </List>
  );
}

function Madde({ children }: { children: ReactNode }) {
  return <ListItem label={<Text className={MADDE}>{children}</Text>} />;
}

function MetinListesi({ ogeler }: { ogeler: readonly string[] }) {
  return (
    <Liste>
      {ogeler.map((o) => (
        <Madde key={o}>{o}</Madde>
      ))}
    </Liste>
  );
}

export default async function KvkkSayfasi() {
  const info = await siteBilgisiGetir();

  return (
    <AltSayfa ust="Kişisel veriler" baslik="KVKK aydınlatma metni">
      <VStack as="article" className="gap-28">
        <Paragraf>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) md. 10 ve Aydınlatma
          Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca;
          web sitemizi ziyaret eden, online ya da WhatsApp üzerinden sipariş veren, dükkânımızdan
          alışveriş yapan ve cari hesabı bulunan müşterilerimizi bilgilendirmek için hazırlanmıştır.
        </Paragraf>

        <Bolum baslik="1. Veri sorumlusu">
          <Paragraf>
            Veri sorumlusu, “{ISLETME_ADI}” adıyla faaliyet gösteren şahıs işletmesinin sahibi{" "}
            <strong className="font-semibold text-cream">{VERI_SORUMLUSU.ad}</strong>’dır.
          </Paragraf>
          <Liste>
            <Madde>
              Vergi dairesi ve no: {VERI_SORUMLUSU.vergiDairesi}, {VERI_SORUMLUSU.vergiNo}
            </Madde>
            <Madde>Adres: {info.address}</Madde>
            <Madde>Telefon: {info.phone}</Madde>
          </Liste>
        </Bolum>

        <Bolum baslik="2. İşlenen kişisel veriler">
          <Liste>
            {VERI_KATEGORILERI.map((k) => (
              <Madde key={k.ad}>
                <strong className="font-semibold text-cream">{k.ad}:</strong> {k.veriler}
              </Madde>
            ))}
          </Liste>
          <Paragraf>
            Özel nitelikli kişisel veri (sağlık, din, biyometrik veri vb.) talep etmiyoruz. Sipariş
            notu veya mesaj alanlarına bu tür bilgileri yazmamanızı rica ederiz.
          </Paragraf>
        </Bolum>

        <Bolum baslik="3. İşleme amaçları ve hukuki sebepler">
          <Paragraf>
            Kişisel verileriniz aşağıdaki amaçlarla ve her amacın altında belirtilen KVKK md. 5
            hukuki sebebine dayanılarak işlenir:
          </Paragraf>
          <List hasDividers className="rounded-8 border border-line">
            {AMACLAR.map((a) => (
              <ListItem
                key={a.amac}
                label={<Text className={MADDE}>{a.amac}</Text>}
                description={
                  <Text type="supporting" className="text-14 leading-16">
                    Hukuki sebep: {a.sebep}
                  </Text>
                }
              />
            ))}
          </List>
        </Bolum>

        <Bolum baslik="4. Toplama yöntemi">
          <MetinListesi ogeler={TOPLAMA} />
        </Bolum>

        <Bolum baslik="5. Kişisel verilerin aktarılması">
          <Paragraf>
            Kişisel verileriniz satılmaz ve pazarlama amacıyla üçüncü kişilerle paylaşılmaz.
            Yalnızca aşağıdaki alıcılara, belirtilen amaçla ve gerektiği ölçüde aktarılır.
          </Paragraf>
          <Heading level={3} className={ALT_BASLIK}>Yurt içi</Heading>
          <MetinListesi ogeler={AKTARIMLAR.yurtIci} />
          <Heading level={3} className={ALT_BASLIK}>Yurt dışı (hizmet sağlayıcılar)</Heading>
          <Paragraf>
            Web sitemiz, sipariş ve cari hesap programımız ile mesajlaşma altyapımız, sunucuları
            yurt dışında bulunan hizmet sağlayıcılarda çalışır. Bu nedenle verileriniz KVKK md. 9
            kapsamında, yalnızca hizmetin sunulması amacıyla aşağıdaki sağlayıcıların sunucularına
            aktarılır:
          </Paragraf>
          <MetinListesi ogeler={AKTARIMLAR.yurtDisi} />
          <Paragraf>
            Yurt dışı aktarımlarda uygulanan güvenceler hakkında bilgi almak için 9. maddedeki
            yollarla bize başvurabilirsiniz.
          </Paragraf>
        </Bolum>

        <Bolum baslik="6. Saklama süreleri">
          <MetinListesi ogeler={SAKLAMA} />
          <Paragraf>
            Süre dolduğunda veya işleme şartları ortadan kalktığında veriler silinir, yok edilir ya
            da anonim hâle getirilir.
          </Paragraf>
        </Bolum>

        <Bolum baslik="7. Çerezler ve tarayıcı depolama">
          <MetinListesi ogeler={TARAYICI} />
        </Bolum>

        <Bolum baslik="8. KVKK md. 11 kapsamındaki haklarınız">
          <MetinListesi ogeler={HAKLAR} />
        </Bolum>

        <Bolum baslik="9. Başvuru">
          <Paragraf>
            Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında
            Tebliğ uyarınca Türkçe olarak; kimliğinizi gösterir belgeyle şahsen ya da ıslak imzalı
            dilekçeyle posta veya noter aracılığıyla {info.address} adresine iletebilirsiniz.
            Başvurunuzda adınız soyadınız, imzanız, T.C. kimlik numaranız (yabancılar için uyruk ve
            pasaport ya da kimlik numarası), tebligata esas adresiniz, varsa e-posta adresiniz,
            telefon numaranız ve talep konunuz bulunmalıdır.
          </Paragraf>
          <Paragraf>
            Talebiniz niteliğine göre en geç 30 gün içinde ücretsiz sonuçlandırılır; işlemin ayrıca
            bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulunca belirlenen tarifedeki
            ücret alınabilir. Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya
            süresinde cevap verilmemesi hâlinde KVKK md. 14 uyarınca Kişisel Verileri Koruma
            Kuruluna şikâyette bulunabilirsiniz.
          </Paragraf>
        </Bolum>

        <Text as="p" className="m-0 text-13 text-muted-dark">Son güncelleme: {METIN_TARIHI}</Text>
      </VStack>
    </AltSayfa>
  );
}
