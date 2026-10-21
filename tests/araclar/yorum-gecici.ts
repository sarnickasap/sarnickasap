/* SADECE GÖRSEL DOĞRULAMA İÇİN. Tasarımın referans görüntüsü bu 3 yorumu
   içeriyor; piksel karşılaştırması aynı veriyi gerektiriyor.
   Doğrulama bitince `temizle` ile silinir — bu yorumlar GERÇEK DEĞİL (K-15). */
import "dotenv/config";
import { db } from "../../lib/db";
import { reviews } from "../../lib/db/schema";

const VERI = [
  { name: "Ayşe K.", text: "Kıymayı gözümün önünde çektiler, köfteler harika oldu. WhatsApp’tan sipariş verip yarım saatte aldım.", rating: 5, visible: true, sort: 0 },
  { name: "Murat D.", text: "Mangallık için ne istediğimi anlatmam yetti, kesimler tam istediğim kalınlıktaydı.", rating: 5, visible: true, sort: 1 },
  { name: "Selin T.", text: "Fiyatlar net, etler taze. Pazar sabahı açık olmaları çok iyi.", rating: 4, visible: true, sort: 2 },
];

async function main() {
  await db.delete(reviews);
  if (process.argv[2] === "ekle") {
    await db.insert(reviews).values(VERI);
    console.log("3 geçici yorum eklendi (DOĞRULAMA İÇİN)");
  } else {
    console.log("yorumlar temizlendi");
  }
}
main();
