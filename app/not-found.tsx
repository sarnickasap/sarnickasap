import Link from "next/link";
import { MesajIkonu } from "@/components/icons";
import { Logo } from "@/components/logo";

/* 404 — TASARIMDA YOK (karar K-08). Sitenin kendi diliyle kuruldu:
   #0a0a0a zemin, DM Sans başlık, kırmızı birincil buton, outline ikincil. */

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
        <Link
          href="/"
          className="flex h-48 items-center gap-10 rounded-8 bg-brand px-22 text-15 font-semibold text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover"
        >
          <MesajIkonu size={18} />
          Ana sayfaya dön
        </Link>
      </div>
    </main>
  );
}
