import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { MesajIkonu } from "@/components/icons";
import { WA_MESAJ, waLink } from "@/lib/format";

/**
 * Stok programına ulaşılamadığında ürün listesi yerine gösterilir. Sitenin kendi
 * veritabanındaki eski/örnek fiyatlar müşteriye gerçekmiş gibi sunulmasın diye.
 */
export function FiyatlarGuncelleniyor({ whatsapp }: { whatsapp: string }) {
  return (
    <Banner
      status="warning"
      title="Güncel fiyatlar şu an yüklenemedi."
      description="Kısa süre içinde tekrar görünecek. Fiyat sormak ya da sipariş vermek için WhatsApp’tan yazabilirsiniz."
      endContent={
        <Button
          variant="primary"
          size="lg"
          label="WhatsApp’tan yaz"
          icon={<MesajIkonu size={18} />}
          href={waLink(whatsapp, WA_MESAJ.genelSiparis)}
          target="_blank"
          rel="noopener noreferrer"
        />
      }
    />
  );
}
