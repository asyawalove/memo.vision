"use server";

import type { Block } from "@blocknote/core";
import { createClient } from "@/lib/supabase/server";

export async function savePortfolioContent(portfolioId: string, content: Block[]) {
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
