import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        Вы вошли как {data.user.email}
      </p>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
        >
          Выйти
        </button>
      </form>
    </main>
  );
}
