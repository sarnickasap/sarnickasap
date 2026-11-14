"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput, type TextInputProps } from "@astryxdesign/core/TextInput";

/* ──────────────────────────────────────────────────────────────────────────
   Sunucu eylemli formlar (giriş, yönetici ekleme, şifre değiştirme) için
   Astryx TextInput.

   TextInput kontrollü bir alan; yerel <input> ise React'in form eylemi
   bitince yaptığı `form.reset()` ile boşalıyordu. Aynı davranış için
   değer formun `reset` olayında sıfırlanır.

   TextInput'un tipinde yerel doğrulama öznitelikleri (`required`,
   `minLength`) yok; geri kalan özellikler <input>'a aynen aktarıldığı için
   tarayıcı doğrulaması buradan korunuyor. (`isRequired` kullanılmadı:
   yalnız aria-required koyar ve görünür bir "zorunlu" etiketi ekler.)
   ────────────────────────────────────────────────────────────────────────── */

type FormAlaniProps = Omit<TextInputProps, "value" | "onChange" | "ref"> & {
  required?: boolean;
  minLength?: number;
};

export function FormAlani({ required, minLength, ...props }: FormAlaniProps) {
  const [deger, setDeger] = useState("");
  const girdi = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = girdi.current?.form;
    if (!form) return;
    const sifirla = () => setDeger("");
    form.addEventListener("reset", sifirla);
    return () => form.removeEventListener("reset", sifirla);
  }, []);

  const yerelDogrulama = { required, minLength };
  return (
    <TextInput
      {...props}
      {...yerelDogrulama}
      ref={girdi}
      value={deger}
      onChange={setDeger}
    />
  );
}
