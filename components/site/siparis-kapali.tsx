import { MesajIkonu } from "@/components/icons";
import { BIRINCIL, KART } from "./siparis-stilleri";

/* Online sipariş kapalıyken (katalog alınamadı ya da stok programı
   `ordersOpen: false`) — mevcut WhatsApp siparişine yönlendirir (K-37). */
export function SiparisKapali({ waLink }: { waLink: string }) {
  return (
    <div className={KART}>
      <p className="m-0 text-16 leading-16 text-read">
        Online sipariş şu an alınmıyor. Siparişinizi WhatsApp’tan iletebilirsiniz.
      </p>
      <div className="flex">
        <a href={waLink} target="_blank" rel="noopener noreferrer" className={BIRINCIL}>
          <MesajIkonu size={18} />
          WhatsApp’tan sipariş ver
        </a>
      </div>
    </div>
  );
}
