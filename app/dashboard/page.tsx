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
      .select("id, title, slug, is_public, updated_at, cover_style")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false }),
  ]);

  const firstName = (profile?.display_name || profile?.username || "").split(" ")[0];

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 sm:gap-8 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">
          {getGreeting(new Date().getHours())}
          {firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="text-sm text-muted-foreground">{getToday()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        <form action={createPortfolio} className="contents">
          <button
            type="submit"
            className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 text-muted-foreground transition-colors hover:border-black/35 hover:text-foreground"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Новое портфолио</span>
          </button>
        </form>

        {portfolios?.map((portfolio) => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            username={profile?.username ?? ""}
          />
        ))}
      </div>
    </main>
  );
}
