"use client";

import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Text } from "@astryxdesign/core/Text";
import { ToggleButton } from "@astryxdesign/core/ToggleButton";
import { VStack } from "@astryxdesign/core/VStack";
import { ArtiIkonu, CopIkonu } from "@/components/icons";

/* ──────────────────────────────────────────────────────────────────────────
   Admin primitifleri — Astryx tasarım sistemi üzerine.

   Astryx bileşenleri tema tokenlarını (themes/sarnic) kendisi kullanır.
   Yerel (native) form alanları yalnızca e2e testlerinin DOM sözleşmesi
   gerektirdiği yerlerde kalıyor — `select` (selectOption), `type=number` /
   `type=time` (her tuşta kayıt; Astryx NumberInput blur'da yazıyor) ve
   `<label>` içine sarılı alanlar (testler `main label … input` arıyor).
   Bu alanlar Astryx'in alan görünümünü aynı tokenlarla taklit eder.
   ────────────────────────────────────────────────────────────────────────── */

/* ⚠️ Tabanda font AĞIRLIĞI yok: çakışan iki Tailwind yardımcısından hangisinin
   kazanacağını sınıf sırası değil CSS sırası belirler. Ağırlık kullanım
   yerinde verilir (etiket içindekiler `font-normal`, ürün adı `font-medium`). */
const ALAN_TABAN =
  "min-w-0 rounded-[var(--radius-element)] border border-[var(--color-border-emphasized)] bg-[var(--color-background-surface)] text-14 text-[var(--color-text-primary)] transition-[border-color] duration-150 focus:border-[var(--color-accent)] disabled:opacity-50";

/** Tek satırlık yerel alan kutusu, iç boşluksuz (birim ekli sarmalayıcı için). */
export const ALAN_KUTUSU = `${ALAN_TABAN} h-[var(--size-element-md)]`;

/** Tek satırlık yerel alan (input/select) — Astryx `md` yüksekliğinde. */
export const ALAN = `${ALAN_KUTUSU} px-8`;

/** Çok satırlı yerel alan (textarea). */
export const COK_SATIRLI_ALAN = `${ALAN_TABAN} resize-y px-8 py-6 leading-15`;

/** Yerel alanı saran görünür etiket — Astryx FieldLabel ölçüsünde. */
export const ETIKET =
  "flex flex-col gap-6 text-14 font-medium text-[var(--color-text-primary)]";

/** Satırlar arası ayraç (liste kartlarında). */
export const SATIR_AYRACI = "border-b border-[var(--color-border)]";

/** Sayfanın birincil eylemi ("Yeni ürün", "Görsel ekle" …). */
export function AnaButon({
  etiket,
  onClick,
}: {
  etiket: string;
  onClick: () => void;
}) {
  return (
    <Button
      label={etiket}
      variant="primary"
      icon={<ArtiIkonu size={16} />}
      onClick={onClick}
    />
  );
}

export function SayfaBasligi({
  baslik,
  altMetin,
  aksiyon,
}: {
  baslik: string;
  altMetin: string;
  aksiyon?: React.ReactNode;
}) {
  return (
    <HStack wrap="wrap" hAlign="between" vAlign="end" gap={3}>
      <VStack gap={1}>
        <Heading level={1}>{baslik}</Heading>
        <Text type="supporting" as="p">
          {altMetin}
        </Text>
      </VStack>
      {aksiyon}
    </HStack>
  );
}

/** Yayında/Gizli, Stokta/Tükendi gibi iki durumlu düğme (`aria-pressed`). */
export function DurumToggle({
  acik,
  acikMetin,
  kapaliMetin,
  onChange,
}: {
  acik: boolean;
  acikMetin: string;
  kapaliMetin: string;
  onChange: () => void;
}) {
  return (
    <ToggleButton
      label={acik ? acikMetin : kapaliMetin}
      isPressed={acik}
      onPressedChange={onChange}
      className="min-w-92 flex-none"
    />
  );
}

export function SilButonu({
  onClick,
  kucuk = false,
  etiket,
}: {
  onClick: () => void;
  kucuk?: boolean;
  etiket: string;
}) {
  return (
    <IconButton
      label={etiket}
      tooltip={etiket}
      variant="ghost"
      size={kucuk ? "sm" : "md"}
      icon={<CopIkonu size={kucuk ? 15 : 16} />}
      onClick={onClick}
    />
  );
}

/** Astryx Card. `rounded-12` sınıfı e2e testlerinin kart seçicisi
 *  (`main .rounded-12`) — yarıçap zaten tema tokenıyla aynı (12px). */
export function Kart({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card padding={0} className={`rounded-12 ${className}`}>
      {children}
    </Card>
  );
}

/** Hata (`role="alert"`) veya başarı (`role="status"`) bildirimi. */
export function DurumMesaji({
  tur,
  metin,
  id,
}: {
  tur: "hata" | "basari";
  metin: string;
  id?: string;
}) {
  const hata = tur === "hata";
  return (
    <Banner
      id={id}
      status={hata ? "error" : "success"}
      title={metin}
      role={hata ? "alert" : "status"}
    />
  );
}
