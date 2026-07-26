"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPortfolio() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("portfolios")
    .insert({
      user_id: userData.user.id,
      title: "Untitled",
      slug: `untitled-${Date.now().toString(36)}`,
      is_public: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/dashboard");
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
