import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/* ──────────────────────────────────────────────────────────────────────────
   Auth.js v5 — Credentials + bcrypt (karar K-06, K-17)

   Tasarımda giriş ekranı YOK; panel herkese açıktı. Şifreli giriş kullanıcı
   isteğiyle eklendi (onaylı sapma #2).

   Not: Koruma `middleware` ile değil, `app/yonetim/(panel)/layout.tsx`
   içinde `auth()` çağrısıyla yapılıyor. Sebep: bcrypt ve veritabanı
   sorgusu Node runtime gerektiriyor; layout koruması bu kısıtı tamamen
   ortadan kaldırıyor ve "split config" karmaşasına gerek bırakmıyor.
   ────────────────────────────────────────────────────────────────────────── */

/** Hiçbir parolayla eşleşmeyen, geçerli bir cost-12 bcrypt hash'i.
 *  Kullanıcı bulunamadığında compare'in gerçek işi yapması için kullanılır. */
const DUMMY_HASH =
  "$2b$12$2hQhYttfJT1t4j2yU0RFZ.OjSN9PmNbMOKBpjObBp6.GjSA/h9hmq";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // 30 gün
  pages: {
    signIn: "/yonetim/giris",
    error: "/yonetim/giris",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        /* Kullanıcı yoksa da bcrypt.compare çalıştırılır: aksi halde yanıt
           süresi farkı "bu e-posta kayıtlı mı" bilgisini sızdırır.

           Yer tutucunun GEÇERLİ bir cost-12 bcrypt hash'i olması şart.
           Geçersiz bir dizge verilirse compare anında `false` döner ve
           tam da engellemeye çalıştığımız zamanlama farkı oluşur
           (ölçüldü: geçersiz hash ile 201ms'e karşı 475ms). */
        const hash = user?.passwordHash ?? DUMMY_HASH;
        const ok = await bcrypt.compare(parsed.data.password, hash);

        if (!user || !ok) return null;

        return { id: String(user.id), email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
});
