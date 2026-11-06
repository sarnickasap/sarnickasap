import { MesajIkonu } from "@/components/icons";
import { WA_MESAJ, waLink } from "@/lib/format";

/**
 * Stok programına ulaşılamadığında ürün listesi yerine gösterilir. Sitenin kendi
 * veritabanındaki eski/örnek fiyatlar müşteriye gerçekmiş gibi sunulmasın diye.
 */
export function FiyatlarGuncelleniyor({ whatsapp }: { whatsapp: string }) {
  return (
    <div className="flex flex-col items-start gap-16 rounded-12 border border-line p-24">
      <p className="m-0 text-16 leading-16 text-muted">
        Güncel fiyatlar şu an yüklenemedi, kısa süre içinde tekrar görünecek. Fiyat
        sormak ya da sipariş vermek için WhatsApp’tan yazabilirsiniz.
      </p>
      <a
        href={waLink(whatsapp, WA_MESAJ.genelSiparis)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-44 items-center gap-10 rounded-8 bg-brand px-20 text-15 font-semibold text-white transition-colors duration-150 ease-out-soft hover:bg-brand-hover"
      >
        <MesajIkonu size={18} />
        WhatsApp’tan yaz
      </a>
    </div>
  );
}
