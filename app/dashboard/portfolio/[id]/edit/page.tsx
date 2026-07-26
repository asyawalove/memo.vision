import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import type { PortfolioPartialBlock } from "@/lib/editor/schema";
import type { PortfolioFont } from "@/lib/fonts";
import { createClient } from "@/lib/supabase/server";
import { PortfolioEditor } from "./portfolio-editor-loader";

const getOwnedPortfolio = cache(async (id: string) => {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { kind: "unauthenticated" as const };
  }

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select(
      "id, title, content, user_id, is_public, background_color, text_color, font_family, cover_image_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (!portfolio || portfolio.user_id !== userData.user.id) {
    return { kind: "not-found" as const };
  }

  return { kind: "ok" as const, portfolio, userId: userData.user.id };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getOwnedPortfolio(id);

  if (result.kind !== "ok") {
    return {};
  }

  return { title: result.portfolio.title };
}

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOwnedPortfolio(id);

  if (result.kind === "unauthenticated") {
    redirect("/login");
  }
  if (result.kind === "not-found") {
    notFound();
  }

  const { portfolio, userId } = result;

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center gap-4 border-b border-border px-8 py-5">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground/70 hover:bg-black/5"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">{portfolio.title}</h1>
        <span
          className={
            portfolio.is_public
              ? "rounded-full bg-accent-lime/60 px-3 py-1 text-xs font-medium text-foreground"
              : "rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {portfolio.is_public ? "Опубликовано" : "Черновик"}
        </span>
      </div>
      <PortfolioEditor
        portfolioId={portfolio.id}
        userId={userId}
        initialContent={portfolio.content as PortfolioPartialBlock[] | null}
        initialStyle={{
          backgroundColor: portfolio.background_color,
          textColor: portfolio.text_color,
          fontFamily: portfolio.font_family as PortfolioFont,
          coverImageUrl: portfolio.cover_image_url,
        }}
      />
    </main>
  );
}
