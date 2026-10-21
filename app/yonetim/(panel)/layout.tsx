import { oturumZorunlu } from "@/lib/session";

/* Panelin tamamı oturuma bağlı — statik kabuk mümkün değil. */
export const instant = false;

/* Paneli koruyan sunucu bileşeni.
   `/yonetim/giris` bu route group'un DIŞINDA olduğu için korumaya takılmaz. */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await oturumZorunlu();
  return <>{children}</>;
}
