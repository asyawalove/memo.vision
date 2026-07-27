import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { PortfolioPartialBlock } from "@/lib/editor/schema";
import { getFontClassName } from "@/lib/fonts";
import { createClient } from "@/lib/supabase/server";
import { PortfolioView } from "./portfolio-view-loader";

const getPublicPortfolio = cache(async (username: string, slug: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("portfolios")
    .select(
      "title, content, cover_image_url, background_color, text_color, font_family, profiles!inner(username, display_name)"
    )
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

  const profile = portfolio.profiles as unknown as {
    username: string;
    display_name: string | null;
  };
  const author = profile.display_name || `@${profile.username}`;

  return (
    <main className="flex flex-1 justify-center bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-6 space-y-2 sm:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">{portfolio.title}</h1>
          <p className="text-sm text-muted-foreground">от {author}</p>
        </div>

        <div
          className={`overflow-hidden rounded-3xl shadow-[0_1px_2px_rgba(38,36,31,0.06)] ${getFontClassName(portfolio.font_family)}`}
          style={{ backgroundColor: portfolio.background_color, color: portfolio.text_color }}
        >
          {portfolio.cover_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portfolio.cover_image_url}
              alt=""
              className="h-40 w-full object-cover sm:h-64"
            />
          )}
          <div className="overflow-x-auto p-4 sm:p-8">
            <PortfolioView content={portfolio.content as PortfolioPartialBlock[] | null} />
          </div>
        </div>
      </div>
    </main>
  );
}
