"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDisplayName(displayName: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: "Не авторизован" };
  }

  const trimmed = displayName.trim().slice(0, 60);

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed || null })
    .eq("id", userData.user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { error: error?.message ?? null };
}
