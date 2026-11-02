"use server";

import { redirect } from "next/navigation";
import { katalogGetir, siparisGonder } from "@/lib/stok";
import type { Katalog } from "@/lib/stok-sema";
import {
  SiparisFormSema,
  type SiparisDurumu,
  type SiparisFormu,
} from "@/lib/siparis-sema";
import { araToplam, enAzTutarKarsilaniyor, sepetSatirlari } from "@/lib/sepet-hesap";
import { aralikEtiketi, uygunAraliklar } from "@/lib/teslimat";
import { fiyat } from "@/lib/format";

/* ──────────────────────────────────────────────────────────────────────────
   Online sipariş — server action (K-37).

   Server action herkese açık bir HTTP uç noktasıdır: formdaki kısıtlara
   güvenilmez. Sıra: bal küpü → zod → güncel katalogla iş kuralları →
   stok programına iletim. Stok programı aynı kuralları YİNE denetler ve
   fiyatı kendisi hesaplar; buradaki kontrol kullanıcıya erken ve alan
   bazında hata göstermek içindir.
   ────────────────────────────────────────────────────────────────────────── */

const KAPALI = "Online sipariş şu an alınmıyor. WhatsApp’tan sipariş verebilirsiniz.";

function formuOku(fd: FormData): unknown {
  const metin = (ad: string) => String(fd.get(ad) ?? "");
  let kalemler: unknown = [];
  try {
    kalemler = JSON.parse(metin("kalemler") || "[]");
  } catch {
    kalemler = [];
  }
  return {
    clientRef: metin("clientRef"),
    ad: metin("ad"),
    telefon: metin("telefon"),
    tip: metin("tip"),
    tarih: metin("tarih"),
    aralik: metin("aralik"),
    bolge: metin("bolge"),
    adres: metin("adres"),
    not: metin("not"),
    kvkk: metin("kvkk"),
    kalemler,
  };
}

/** Güncel katalogla iş kuralları; ilk ihlalin mesajı ya da null. */
function kurallariDenetle(f: SiparisFormu, k: Katalog): string | null {
  const d = k.delivery;
  if (f.tip === "pickup" && !d.pickup) return "Gel-al şu an kapalı.";
  if (f.tip === "delivery" && !d.homeDelivery) return "Eve teslim şu an kapalı.";
  if (f.tip === "delivery" && !d.areas.some((a) => a.name === f.bolge)) {
    return "Seçtiğiniz bölgeye teslimat yapılmıyor.";
  }

  const satirlar = sepetSatirlari(f.kalemler, k.products);
  if (satirlar.some((s) => !s.urun)) {
    return "Sepetinizdeki bazı ürünler artık satışta değil. Sepeti kontrol edin.";
  }
  const toplam = araToplam(satirlar);
  if (f.tip === "delivery" && !enAzTutarKarsilaniyor(d, toplam)) {
    return `Eve teslim için en az sepet tutarı ${fiyat(d.minOrderTotal)}.`;
  }
  if (!uygunAraliklar(d, f.tarih, new Date()).includes(f.aralik)) {
    return "Seçtiğiniz saat artık uygun değil. Lütfen başka bir aralık seçin.";
  }
  return null;
}

function alanHatalari(issues: { path: PropertyKey[]; message: string }[]) {
  const sonuc: Record<string, string> = {};
  for (const i of issues) {
    const alan = String(i.path[0] ?? "genel");
    sonuc[alan] ??= i.message;
  }
  return sonuc;
}

export async function siparisVer(
  _onceki: SiparisDurumu,
  fd: FormData,
): Promise<SiparisDurumu> {
  // Bal küpü: insan bu alanı görmez; dolu geliyorsa bot.
  if (String(fd.get("website") ?? "") !== "") {
    return { hata: "Sipariş gönderilemedi.", alanHatalari: {} };
  }

  const ayrisan = SiparisFormSema.safeParse(formuOku(fd));
  if (!ayrisan.success) {
    return { hata: "Lütfen işaretli alanları düzeltin.", alanHatalari: alanHatalari(ayrisan.error.issues) };
  }
  const f = ayrisan.data;

  const katalog = await katalogGetir();
  if (!katalog || !katalog.ordersOpen) return { hata: KAPALI, alanHatalari: {} };

  const kuralHatasi = kurallariDenetle(f, katalog);
  if (kuralHatasi) return { hata: kuralHatasi, alanHatalari: {} };

  const yanit = await siparisGonder(stokGovdesi(f));
  if (!yanit.ok) return { hata: yanit.error, alanHatalari: {} };

  const q = new URLSearchParams({
    no: yanit.orderNo,
    tutar: String(yanit.estimatedTotal),
    ucret: String(yanit.deliveryFee),
    tip: f.tip,
    tarih: f.tarih,
    aralik: aralikEtiketi(katalog.delivery, f.aralik),
  });
  redirect(`/siparis/tamam?${q.toString()}`);
}

/** Sözleşmedeki gövde biçimi (web-api.md). */
function stokGovdesi(f: SiparisFormu) {
  const teslim = f.tip === "delivery";
  return {
    clientRef: f.clientRef,
    customer: { name: f.ad, phone: f.telefon },
    fulfillment: {
      type: f.tip,
      date: f.tarih,
      slot: f.aralik,
      ...(teslim ? { area: f.bolge, address: f.adres } : {}),
    },
    items: f.kalemler.map((k) => ({ code: k.code, qty: k.qty, note: k.note })),
    note: f.not,
    kvkkConsent: true,
  };
}
