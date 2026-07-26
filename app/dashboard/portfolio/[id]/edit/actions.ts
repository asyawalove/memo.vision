"use server";

import type { PortfolioPartialBlock } from "@/lib/editor/schema";
import { createClient } from "@/lib/supabase/server";

export async function savePortfolioContent(
  portfolioId: string,
  content: PortfolioPartialBlock[]
) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Не авторизован" };
  }

  const { error } = await supabase
    .from("portfolios")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", portfolioId)
    .eq("user_id", userData.user.id);

  return { error: error?.message ?? null };
}

export type PortfolioStyle = {
  background_color: string;
  text_color: string;
  font_family: string;
  cover_image_url: string | null;
};

export async function savePortfolioStyle(
  portfolioId: string,
  style: Partial<PortfolioStyle>
) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Не авторизован" };
  }

  const { error } = await supabase
    .from("portfolios")
    .update({ ...style, updated_at: new Date().toISOString() })
    .eq("id", portfolioId)
    .eq("user_id", userData.user.id);

  return { error: error?.message ?? null };
}
