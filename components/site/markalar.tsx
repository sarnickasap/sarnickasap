/* ──────────────────────────────────────────────────────────────────────────
   Çalıştığımız markalar — akan şerit. TASARIMDA YOK (K-31).

   ── Neden Hakkımızda'nın hemen altında? ──
   Hakkımızda metni zaten şunu söylüyor:
     "Etlerimizi güvendiğimiz üreticilerden alır…"
   Şerit bu cümlenin görsel kanıtı; hemen altında olması iddiayı destekliyor.
   Ayrıca Hero → Fırsatlar → Ürünler satın alma akışını bölmüyor ve
   Hakkımızda (#0f0f0f) ile Galeri (#0a0a0a) arasındaki doğal dikişe oturuyor.

   ── Görsel dil tasarımdan ──
   zemin    #0a0a0a (Hakkımızda'nın #0f0f0f'inden sonra alternasyon sürüyor)
   kenarlık alt 1px #1f1f1f (bölüm ayracı deseni)
   padding  py-72 (Fırsatlar'la aynı "ikincil bölüm" ağırlığı)
   eyebrow  12px/600 · ls .12em · uppercase · #e0464e — diğer bölümlerle aynı
   gap      32 (Fırsatlar'la aynı)
   Yeni token veya ölçü icat edilmedi.

   ── Hareket ──
   CSS animasyonu; JavaScript gerekmiyor. `prefers-reduced-motion: reduce`
   altında akış durur ve logolar sarmalı bir ızgaraya döner (K-20).
   Süre logo sayısına göre ayarlanır ki hız sabit kalsın.

   ── Erişilebilirlik ──
   Şerit sonsuz akabilsin diye liste İKİ KEZ basılır; ikinci kopya
   `aria-hidden` ve odaklanılamaz — ekran okuyucu ve klavye için tek liste.
   ────────────────────────────────────────────────────────────────────────── */

export type MarkaVerisi = {
  id: number;
  name: string;
  logoUrl: string;
  linkUrl: string;
};

/** Logo başına saniye — toplam süre logo sayısıyla ölçeklenir. */
const LOGO_BASINA_SN = 4;

function Logo({ marka, kopya = false }: { marka: MarkaVerisi; kopya?: boolean }) {
  const govde = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={marka.logoUrl}
      alt={kopya ? "" : marka.name}
      loading="lazy"
      className="block h-40 w-auto max-w-[160px] object-contain opacity-70 transition-opacity duration-150 ease-out-soft group-hover/logo:opacity-100"
    />
  );

  if (!marka.linkUrl) {
    return <div className="group/logo flex flex-none items-center">{govde}</div>;
  }

  return (
    <a
      href={marka.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={kopya ? -1 : undefined}
      aria-hidden={kopya || undefined}
      className="group/logo flex flex-none items-center rounded-8"
    >
      {govde}
    </a>
  );
}

export function Markalar({ markalar }: { markalar: MarkaVerisi[] }) {
  // Logosu olmayan marka gösterilmez; hiç yoksa bölüm tamamen gizlenir
  const gorunen = markalar.filter((m) => m.logoUrl);
  if (gorunen.length === 0) return null;

  const sure = gorunen.length * LOGO_BASINA_SN;

  return (
    <section id="markalar" className="border-b border-line">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-32 px-24 py-72">
        <span className="text-12 font-semibold tracking-eyebrow uppercase text-brand-accent">
          Çalıştığımız üreticiler
        </span>

        {/* Kenarlarda yumuşak kaybolma — şeridin kesik görünmesini önler */}
        <div className="marka-serit relative overflow-hidden">
          <ul
            className="marka-ray m-0 flex w-max list-none items-center gap-56 p-0"
            style={{ ["--marka-sure" as string]: `${sure}s` }}
          >
            {gorunen.map((m) => (
              <li key={m.id}>
                <Logo marka={m} />
              </li>
            ))}
            {/* Sonsuz akış için ikinci kopya — ekran okuyucudan gizli */}
            {gorunen.map((m) => (
              <li key={`kopya-${m.id}`} aria-hidden>
                <Logo marka={m} kopya />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
