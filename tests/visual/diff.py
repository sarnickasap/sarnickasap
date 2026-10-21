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


def karsilastir(ref_yol, uyg_yol, fark_yol):
    a = Image.open(ref_yol).convert("RGB")
    b = Image.open(uyg_yol).convert("RGB")

    if a.size != b.size:
        return {"boyutFarkli": True, "ref": a.size, "uyg": b.size}

    diff = ImageChops.difference(a, b)
    # Kanal başına en büyük sapma
    mask = diff.convert("L").point(lambda p: 255 if p > ESIK else 0)
    kutu = mask.getbbox()
    farkli = sum(mask.point(lambda p: 1 if p else 0).getdata())
    toplam = a.size[0] * a.size[1]

    # Fark haritası: farklar kırmızı, zemin soluk
    harita = a.copy().convert("RGB")
    kirmizi = Image.new("RGB", a.size, (255, 0, 80))
    harita.paste(kirmizi, mask=mask)
    harita.save(fark_yol)

    ekstrem = diff.getextrema()
    return {
        "boyutFarkli": False,
        "boyut": a.size,
        "farkliPiksel": farkli,
        "toplamPiksel": toplam,
        "oran": farkli / toplam,
        "kutu": kutu,
        "maxSapma": max(e[1] for e in ekstrem),
    }


def main():
    sonuclar = json.loads(sys.argv[1])
    cikti = sys.argv[2]

    satirlar = []
    hepsiTemiz = True

    for s in sonuclar:
        w = s["w"]
        fark_yol = f"{cikti}/{w}-fark.png"
        r = karsilastir(s["refDosya"], s["uygDosya"], fark_yol)

        rk, uk = s["refKutu"], s["uygKutu"]
        boyut = f"tasarım {rk['g']}×{rk['y']} · uygulama {uk['g']}×{uk['y']}"

        if r["boyutFarkli"]:
            hepsiTemiz = False
            satirlar.append(
                f"  {w:>5}px  ❌ BOYUT FARKLI  {boyut}\n"
                f"            görüntü: {r['ref']} ≠ {r['uyg']}"
            )
            continue

        if r["farkliPiksel"] == 0:
            satirlar.append(f"  {w:>5}px  ✅ birebir aynı   ({boyut})")
        else:
            hepsiTemiz = False
            yuzde = r["oran"] * 100
            x0, y0, x1, y1 = r["kutu"]
            # DPR 2 → CSS pikseline çevir
            satirlar.append(
                f"  {w:>5}px  ❌ {r['farkliPiksel']:,} farklı piksel "
                f"({yuzde:.3f}%) · max sapma {r['maxSapma']}\n"
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
