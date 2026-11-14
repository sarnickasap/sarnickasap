import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { MesajIkonu } from "@/components/icons";

/* Online sipariş kapalıyken (katalog alınamadı ya da stok programı
   `ordersOpen: false`) — mevcut WhatsApp siparişine yönlendirir (K-37). */
export function SiparisKapali({ waLink }: { waLink: string }) {
  return (
    <Banner
      status="info"
      title="Online sipariş şu an alınmıyor."
      description="Siparişinizi WhatsApp’tan iletebilirsiniz."
      endContent={
        <Button
          variant="primary"
          size="lg"
          label="WhatsApp’tan sipariş ver"
          icon={<MesajIkonu size={18} />}
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
        />
      }
    />
  );
}
