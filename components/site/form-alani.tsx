import { ETIKET, HATA } from "./siparis-stilleri";

/* Etiket + alan + hata satırı. Hata metninin kimliği `${id}-hata`;
   girdiye `aria-describedby` ve `aria-invalid` için `alanAria()` kullanılır. */

export function alanAria(id: string, hata: string | undefined) {
  return hata ? { "aria-invalid": true, "aria-describedby": `${id}-hata` } : {};
}

export function FormAlani({
  id,
  etiket,
  hata,
  children,
}: {
  id: string;
  etiket: string;
  hata?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <label htmlFor={id} className={ETIKET}>
        {etiket}
      </label>
      {children}
      {hata && (
        <p id={`${id}-hata`} className={HATA}>
          {hata}
        </p>
      )}
    </div>
  );
}
