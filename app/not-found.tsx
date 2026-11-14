import { Button } from "@astryxdesign/core/Button";
import { MesajIkonu } from "@/components/icons";
import { Logo } from "@/components/logo";
import { CTA } from "@/components/site/siparis-stilleri";

/* 404 — TASARIMDA YOK (karar K-08). Sitenin kendi diliyle kuruldu:
   #0a0a0a zemin, DM Sans başlık, Astryx birincil buton (marka kırmızısı). */

export const metadata = { title: "Sayfa bulunamadı" };

export default function Bulunamadi() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-28 bg-ink px-24 py-96 text-center">
      <Logo
        genislik={1420}
        yukseklik={1350}
        alt=""
        className="block h-auto w-full max-w-[220px]"
      />
      <div className="flex flex-col gap-12">
        <h1 className="m-0 font-display text-h2 leading-h2 font-bold tracking-h2 text-cream">
          Sayfa bulunamadı
        </h1>
        <p className="m-0 max-w-[420px] text-16 leading-16 text-muted">
          Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-12">
        <Button
          variant="primary"
          size="lg"
          label="Ana sayfaya dön"
          href="/"
          icon={<MesajIkonu size={18} />}
          className={CTA}
        />
      </div>
    </main>
  );
}
