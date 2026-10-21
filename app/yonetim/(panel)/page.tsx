import { oturumZorunlu } from "@/lib/session";
import { cikisYap } from "@/lib/actions/auth";

export const instant = false;

/* Geçici panel iskeleti — C2 aşamasında gerçek admin kabuğu gelecek. */
export default async function Panel() {
  const user = await oturumZorunlu();
  return (
    <main className="tema-admin min-h-screen bg-admin-bg p-20">
      <p className="text-14">Girişli: {user.email}</p>
      <form action={cikisYap}>
        <button className="mt-12 h-36 rounded-8 border border-admin-border bg-admin-card px-12 text-13 font-medium text-danger">
          Çıkış yap
        </button>
      </form>
    </main>
  );
}
