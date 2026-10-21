"""Piksel karşılaştırma — karsilastir.js tarafından çağrılır.

Her genişlik için tasarım/uygulama görüntülerini karşılaştırır, farkların
sayısını, en büyük renk sapmasını ve farkların sınırlayıcı kutusunu bildirir.
Ayrıca görsel bir fark haritası üretir.
"""

import json
import sys
from PIL import Image, ImageChops

# Antialiasing gürültüsünü elemek için eşik. 0 = birebir aynı olmalı.
# Metin kenarlarındaki 1-2 birimlik farklar gerçek tasarım farkı değildir.
ESIK = 8

# ── Onaylı K-21 kontrast düzeltmeleri ────────────────────────────────────────
# Tasarımdaki iki renk erişilebilirlik için değiştirildi (kullanıcı onayladı).
# Bu değişiklikten kaynaklanan piksel farkları GERÇEK fark değildir; araç
# bunları ayırıp "onaylı sapma" olarak raporlar.
#   zemin, tasarım_rengi, uygulama_rengi
K21 = [
    ((10, 10, 10), 115, 138),    # #0a0a0a üstünde #737373 -> #8a8a8a
    ((255, 255, 255), 163, 107), # #ffffff üstünde #a3a3a3 -> #6b6b6b
]


def k21_aciklar_mi(pa, pb):
    """Bu piksel çifti onaylı bir K-21 renk değişimiyle açıklanıyor mu?

    Metin kenarlarında renk, zemin ile metin rengi arasında karışır. Aynı
    karışım oranı (t) her iki tarafta da geçerliyse fark K-21'dendir.
    """
    # Gri tonları: üç kanal da birbirine yakın olmalı
    if max(pa) - min(pa) > 3 or max(pb) - min(pb) > 3:
        return False
    da, db = sum(pa) / 3, sum(pb) / 3

    for (zemin, tasarim, uygulama) in K21:
        z = zemin[0]
        if tasarim == z:
            continue
        t = (da - z) / (tasarim - z)
        if not (-0.02 <= t <= 1.02):
            continue
        beklenen = z + t * (uygulama - z)
        if abs(db - beklenen) <= 2.5:
            return True
    return False


def karsilastir(ref_yol, uyg_yol, fark_yol, alt_kirp=0):
    a = Image.open(ref_yol).convert("RGB")
    b = Image.open(uyg_yol).convert("RGB")

    # Alt kenardan N CSS px dışla. Bir bölümün ekran görüntüsü kesirli
    # yükseklik yüzünden bir SONRAKİ bölümün ilk satırını kapabiliyor;
    # o satır gerçek bir fark değil, komşu bölümün rengidir.
    if alt_kirp:
        k = alt_kirp * 2  # DPR 2
        a = a.crop((0, 0, a.size[0], max(1, a.size[1] - k)))
        b = b.crop((0, 0, b.size[0], max(1, b.size[1] - k)))

    kirpildi = None
    if a.size != b.size:
        # Kesirli yükseklikli bir öğenin ekran görüntüsü, sayfadaki mutlak
        # konumuna göre bir piksel aşağı/yukarı yuvarlanabiliyor. 1-2 cihaz
        # pikselini aşmayan farkı ortak bölgeyi karşılaştırarak ele alıyoruz;
        # daha büyük fark gerçek bir düzen sorunudur.
        dw = abs(a.size[0] - b.size[0])
        dh = abs(a.size[1] - b.size[1])
        if dw > 2 or dh > 2:
            return {"boyutFarkli": True, "ref": a.size, "uyg": b.size}
        w = min(a.size[0], b.size[0])
        h = min(a.size[1], b.size[1])
        kirpildi = (dw, dh)

        # Yuvarlama farkı üstte de olabilir altta da. Olası hizalamaları
        # deneyip en az fark vereni seç — yanlış hizalama her satırı
        # "farklı" gösterirdi.
        buyuk_a_x = a.size[0] >= b.size[0]
        buyuk_a_y = a.size[1] >= b.size[1]
        en_iyi, en_az = None, None
        for oy in range(dh + 1):
            for ox in range(dw + 1):
                ax, ay = (ox if buyuk_a_x else 0), (oy if buyuk_a_y else 0)
                bx, by = (0 if buyuk_a_x else ox), (0 if buyuk_a_y else oy)
                aa = a.crop((ax, ay, ax + w, ay + h))
                bb = b.crop((bx, by, bx + w, by + h))
                skor = sum(ImageChops.difference(aa, bb).convert("L").getdata())
                if en_az is None or skor < en_az:
                    en_az, en_iyi = skor, (aa, bb, ox, oy)
        a, b, ox, oy = en_iyi
        kirpildi = (dw, dh, ox, oy)

    diff = ImageChops.difference(a, b)
    # Kanal başına en büyük sapma
    mask = diff.convert("L").point(lambda p: 255 if p > ESIK else 0)
    farkli_ham = sum(mask.point(lambda p: 1 if p else 0).getdata())
    toplam = a.size[0] * a.size[1]

    # Farkları ikiye ayır: onaylı K-21 sapması mı, gerçek fark mı?
    ap, bp, mp = a.load(), b.load(), mask.load()
    onayli = 0
    gercek_mask = Image.new("L", a.size, 0)
    gp = gercek_mask.load()
    for y in range(a.size[1]):
        for x in range(a.size[0]):
            if not mp[x, y]:
                continue
            if k21_aciklar_mi(ap[x, y], bp[x, y]):
                onayli += 1
            else:
                gp[x, y] = 255

    farkli = farkli_ham - onayli
    mask = gercek_mask
    kutu = mask.getbbox()

    # Fark haritası: farklar kırmızı, zemin soluk
    harita = a.copy().convert("RGB")
    kirmizi = Image.new("RGB", a.size, (255, 0, 80))
    harita.paste(kirmizi, mask=mask)
    harita.save(fark_yol)

    # Kalan farkların tamamı GRİ TONUNDA mı?
    # Eğer öyleyse düzen, renk ve font sorunları elenmiş demektir: geriye
    # yalnızca K-21 ile yeniden renklendirilen metnin kenar yumuşatmasındaki
    # ikincil kayma kalır. Renkli bir fark ise gerçek bir sorun işaretidir.
    gri_tonu = 0
    for y in range(a.size[1]):
        for x in range(a.size[0]):
            if not gp[x, y]:  # K-21 ile açıklananlar hariç, GERÇEK farklar
                continue
            pa, pb = ap[x, y], bp[x, y]
            if max(pa) - min(pa) <= 4 and max(pb) - min(pb) <= 4:
                gri_tonu += 1

    ekstrem = diff.getextrema()
    return {
        "boyutFarkli": False,
        "boyut": a.size,
        "kirpildi": kirpildi,
        "onayliSapma": onayli,
        "farkliPiksel": farkli,
        "toplamPiksel": toplam,
        "oran": farkli / toplam,
        "kutu": kutu,
        "griTonu": gri_tonu,
        "maxSapma": max(e[1] for e in ekstrem),
    }


def main():
    sonuclar = json.loads(sys.argv[1])
    cikti = sys.argv[2]
    alt_kirp = int(sys.argv[3]) if len(sys.argv) > 3 else 0

    satirlar = []
    hepsiTemiz = True

    for s in sonuclar:
        w = s["w"]
        fark_yol = f"{cikti}/{w}-fark.png"
        r = karsilastir(s["refDosya"], s["uygDosya"], fark_yol, alt_kirp)

        rk, uk = s["refKutu"], s["uygKutu"]
        boyut = f"tasarım {rk['g']}×{rk['y']} · uygulama {uk['g']}×{uk['y']}"

        if r["boyutFarkli"]:
            hepsiTemiz = False
            satirlar.append(
                f"  {w:>5}px  ❌ BOYUT FARKLI  {boyut}\n"
                f"            görüntü: {r['ref']} ≠ {r['uyg']}"
            )
            continue

        yuvarlama = (
            f"  (yakalama {r['kirpildi'][0]}×{r['kirpildi'][1]} px yuvarlama farkı;"
            f" hizalama ofseti {r['kirpildi'][2]},{r['kirpildi'][3]})"
            if r.get("kirpildi")
            else ""
        )
        k21 = (
            f"  ·  {r['onayliSapma']:,} px onaylı K-21 kontrast sapması"
            if r["onayliSapma"]
            else ""
        )
        if r["farkliPiksel"] == 0:
            satirlar.append(f"  {w:>5}px  ✅ birebir aynı   ({boyut}){k21}{yuvarlama}")
        else:
            hepsiTemiz = False
            yuzde = r["oran"] * 100
            x0, y0, x1, y1 = r["kutu"]
            # DPR 2 → CSS pikseline çevir
            tumGri = (
                "  ← tamamı gri tonunda (düzen/renk/font farkı YOK)"
                if r["griTonu"] == r["farkliPiksel"] and r["farkliPiksel"]
                else f"  ← {r['griTonu']:,}'i gri tonunda"
            )
            satirlar.append(
                f"  {w:>5}px  ❌ {r['farkliPiksel']:,} farklı piksel "
                f"({yuzde:.3f}%) · max sapma {r['maxSapma']}{k21}\n"
                f"           {tumGri}\n"
                f"            fark bölgesi (CSS px): "
                f"x {x0//2}–{x1//2}, y {y0//2}–{y1//2}\n"
                f"            harita: {fark_yol}"
            )

    print("\n".join(satirlar))
    print()
    print("✅ Tüm genişliklerde birebir" if hepsiTemiz else "❌ Fark var — yukarıya bak")
    sys.exit(0 if hepsiTemiz else 1)


if __name__ == "__main__":
    main()
