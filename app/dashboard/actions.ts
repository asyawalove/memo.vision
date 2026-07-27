"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { COVER_COLORS, COVER_PATTERNS, type PortfolioCoverStyle } from "@/lib/cover-patterns";

export async function createPortfolio() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const randomCoverStyle: PortfolioCoverStyle = {
    pattern: COVER_PATTERNS[Math.floor(Math.random() * COVER_PATTERNS.length)].value,
    color: COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)],
  };

  const { data, error } = await supabase
    .from("portfolios")
    .insert({
      user_id: userData.user.id,
      title: "Untitled",
      slug: `untitled-${Date.now().toString(36)}`,
      is_public: false,
      cover_style: randomCoverStyle,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Не удалось создать портфолио" };
  }

  redirect(`/dashboard/portfolio/${data.id}/edit`);
}

export async function setPortfolioVisibility(portfolioId: string, isPublic: boolean) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Не авторизован" };
  }

  const { error } = await supabase
    .from("portfolios")
    .update({ is_public: isPublic })
    .eq("id", portfolioId)
    .eq("user_id", userData.user.id);

  revalidatePath("/dashboard");

  return { error: error?.message ?? null };
}

export async function setPortfolioCoverStyle(
  portfolioId: string,
  coverStyle: PortfolioCoverStyle
) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Не авторизован" };
  }

  const { error } = await supabase
    .from("portfolios")
    .update({ cover_style: coverStyle })
    .eq("id", portfolioId)
    .eq("user_id", userData.user.id);

  revalidatePath("/dashboard");

  return { error: error?.message ?? null };
}
