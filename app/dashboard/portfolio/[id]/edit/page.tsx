import { notFound, redirect } from "next/navigation";
import type { PartialBlock } from "@blocknote/core";
import { createClient } from "@/lib/supabase/server";
import { PortfolioEditor } from "./portfolio-editor-loader";

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, title, content, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!portfolio || portfolio.user_id !== userData.user.id) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="border-b border-black/10 px-6 py-4 text-lg font-semibold dark:border-white/15">
        {portfolio.title}
      </h1>
      <PortfolioEditor
        portfolioId={portfolio.id}
        initialContent={portfolio.content as PartialBlock[] | null}
      />
    </main>
  );
}
