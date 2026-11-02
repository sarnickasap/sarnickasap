"use client";

import { useEffect } from "react";
import { sepetiTemizle, siparisRefTemizle } from "@/lib/sepet";

/* Sipariş başarıyla iletildikten sonra sepeti ve sipariş kimliğini
   (clientRef) temizler — bir sonraki sipariş yeni kimlikle başlar. */
export function SepetiTemizle() {
  useEffect(() => {
    sepetiTemizle();
    siparisRefTemizle();
  }, []);
  return null;
}
