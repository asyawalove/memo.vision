import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createPortfolio } from "./actions";
import { PortfolioCard } from "./portfolio-card";

export const metadata: Metadata = {
  title: "Мои портфолио",
};

function getGreeting(hour: number) {
  if (hour < 5) return "Доброй ночи";
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function getToday() {
  const formatted = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: portfolios }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", userData.user.id)
      .maybeSingle(),
    supabase
      .from("portfolios")
      .select("id, title, slug, cover_image_url, is_public")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const firstName = (profile?.display_name || profile?.username || "").split(" ")[0];

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting(new Date().getHours())}
            {firstName ? `, ${firstName}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground">{getToday()}</p>
        </div>

        <form action={createPortfolio}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            <Plus className="h-4 w-4" />
            Создать новое
          </button>
        </form>
      </div>

      {portfolios && portfolios.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio, index) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              username={profile?.username ?? ""}
              accentIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-card p-10 text-center shadow-[0_1px_2px_rgba(38,36,31,0.06)]">
          <p className="text-sm text-muted-foreground">
            У вас пока нет портфолио. Нажмите «Создать новое», чтобы начать.
          </p>
        </div>
      )}
    </main>
  );
}
