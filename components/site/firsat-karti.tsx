import { fiyat, indirimOrani, waLink, WA_MESAJ } from "@/lib/format";

/* ──────────────────────────────────────────────────────────────────────────
   Fırsat Kartı — vault "Firsat Karti" notundan birebir.

     kart   bg #0a0a0a · r12 · p24 · flex-col · gap18   (KENARLIK YOK)
     üst    justify-between · items-center · gap12
       pil    12px/600 · py4 px10 · r999 · bg #2a1012 · #f8efea
       oran   13px/600 · #f87171
     metin  flex-col · gap6 · flex-1
       h3     DM Sans 24px/600 · ls -.015em · #f8efea
       p      14px · lh 1.5 · #a3a3a3
     fiyat  items-baseline · gap10
       yeni   DM Sans 30px/700 · beyaz
       eski   15px · #737373 · line-through
     buton  h40 · r8 · 1px #333333 · 14px/500 · #fafafa · ortalı
            hover → bg #171717, beyaz
   ────────────────────────────────────────────────────────────────────────── */

export type FirsatVerisi = {
  id: number;
  title: string;
  description: string;
  oldPrice: number;
  newPrice: number;
  until: string;
};

export function FirsatKarti({
  firsat,
  whatsapp,
}: {
  firsat: FirsatVerisi;
  whatsapp: string;
}) {
  const oran = indirimOrani(firsat.oldPrice, firsat.newPrice);

  return (
    <div className="flex flex-col gap-18 rounded-12 bg-ink p-24">
      <div className="flex items-center justify-between gap-12">
        <span className="rounded-pill bg-pill px-10 py-4 text-12 font-semibold text-cream">
          {firsat.until}
        </span>
        {/* Tasarımda indirim yoksa boş span yine render ediliyor — birebir */}
        <span className="text-13 font-semibold text-discount">{oran}</span>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <h3 className="m-0 font-display text-24 font-semibold tracking-deal text-cream break-words">
          {firsat.title}
        </h3>
        <p className="m-0 text-14 leading-15 text-muted">{firsat.description}</p>
      </div>

      <div className="flex items-baseline gap-10">
        <span className="font-display text-30 font-bold text-white">
          {fiyat(firsat.newPrice)}
        </span>
        {/* Tasarım: oldPrice yoksa boş string — span yine var */}
        <span className="text-15 text-muted-dark line-through">
          {firsat.oldPrice ? fiyat(firsat.oldPrice) : ""}
        </span>
      </div>

      <a
        href={waLink(whatsapp, WA_MESAJ.firsat(firsat.title))}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-40 items-center justify-center rounded-8 border border-edge text-14 font-medium text-body transition-colors duration-150 ease-out-soft hover:bg-hover hover:text-white"
      >
        Ayırt
      </a>
    </div>
  );
}
