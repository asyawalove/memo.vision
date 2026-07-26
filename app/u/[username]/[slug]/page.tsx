import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PartialBlock } from "@blocknote/core";
import { createClient } from "@/lib/supabase/server";
import { PortfolioView } from "./portfolio-view-loader";

const getPublicPortfolio = cache(async (username: string, slug: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("portfolios")
    .select("title, content, cover_image_url, profiles!inner(username)")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("profiles.username", username)
    .maybeSingle();

  return data;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const portfolio = await getPublicPortfolio(username, slug);

  if (!portfolio) {
    return { title: "Портфолио не найдено" };
  }

  return {
    title: portfolio.title,
    openGraph: {
      title: portfolio.title,
      images: portfolio.cover_image_url ? [portfolio.cover_image_url] : undefined,
    },
  };
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const portfolio = await getPublicPortfolio(username, slug);

  if (!portfolio) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col">
      <h1 className="border-b border-black/10 px-6 py-4 text-lg font-semibold dark:border-white/15">
        {portfolio.title}
      </h1>
      <div className="flex-1 overflow-y-auto p-6">
        <PortfolioView content={portfolio.content as PartialBlock[] | null} />
      </div>
    </main>
  );
}
