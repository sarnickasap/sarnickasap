import { Step, Stepper } from "@astryxdesign/core/Stepper";

/* ──────────────────────────────────────────────────────────────────────────
   Online sipariş adımları (sepet → bilgiler → alındı) — TASARIMDA YOK (K-37).
   Astryx Stepper; alt sayfa kabuğunun `ustBilgi` yuvasında, başlığın üstünde.
   Doğrusal akış: adımlar tıklanmaz (geri dönüş sayfadaki düğmelerle).
   ────────────────────────────────────────────────────────────────────────── */

const ADIMLAR = ["Sepet", "Bilgiler", "Alındı"] as const;

export function SiparisAdimlari({ adim }: { adim: 0 | 1 | 2 }) {
  const bitti = adim === ADIMLAR.length - 1;
  return (
    <Stepper activeStep={adim} label="Sipariş adımları" density="compact" className="mb-8">
      {ADIMLAR.map((etiket, i) => (
        <Step key={etiket} step={i} label={etiket} status={bitti && i === adim ? "success" : undefined} />
      ))}
    </Stepper>
  );
}
