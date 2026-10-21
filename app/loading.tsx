/* Yükleniyor — TASARIMDA YOK (karar K-08).
   Gösterişli bir iskelet yerine sade bir alan: site zaten statik kabukla
   anında geliyor, bu yalnızca ilk yüklemedeki kısa pencere için. */
export default function Yukleniyor() {
  return (
    <div
      role="status"
      aria-label="Sayfa yükleniyor"
      className="min-h-screen bg-ink"
    />
  );
}
