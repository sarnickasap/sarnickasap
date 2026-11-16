import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { MesajIkonu } from "@/components/icons";
import { Logo } from "@/components/logo";
import { BOS_SAYFA } from "@/components/site/bilgi-bolum-basligi";
import { CTA } from "@/components/site/siparis-stilleri";

/* 404 — TASARIMDA YOK (karar K-08). Sitenin kendi diliyle kuruldu:
   #0a0a0a zemin, DM Sans başlık, Astryx birincil buton (marka kırmızısı).
   Astryx EmptyState: logo (icon yuvası) + başlık (h1) + açıklama + eylem.
   Başlık/açıklama ölçüleri sitenin bölüm başlığı diliyle (BOS_SAYFA). */

export const metadata = { title: "Sayfa bulunamadı" };

export default function Bulunamadi() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-24 py-96">
      <EmptyState
        headingLevel={1}
        className={BOS_SAYFA}
        icon={
          <Logo
            genislik={1420}
            yukseklik={1350}
            alt=""
            className="block h-auto w-[220px] max-w-full"
          />
        }
        title="Sayfa bulunamadı"
        description="Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir."
        actions={
          <Button
            variant="primary"
            size="lg"
            label="Ana sayfaya dön"
            href="/"
            icon={<MesajIkonu size={18} />}
            className={CTA}
          />
        }
      />
    </main>
  );
}
