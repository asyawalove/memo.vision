import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPortfolio } from "./actions";
import { PortfolioCard } from "./portfolio-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: portfolios }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("portfolios")
      .select("id, title, slug, cover_image_url, is_public")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Мои портфолио</h1>
        <div className="flex items-center gap-2">
          <form action={createPortfolio}>
            <button
              type="submit"
              className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
            >
              Создать новое
            </button>
          </form>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>

      {portfolios && portfolios.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              username={profile?.username ?? ""}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-black/60 dark:text-white/60">
          У вас пока нет портфолио.
        </p>
      )}
    </main>
  );
}
