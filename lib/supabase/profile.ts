import type { SupabaseClient, User } from "@supabase/supabase-js";

function usernameFromEmail(email: string) {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");

  return base || "user";
}

const UNIQUE_VIOLATION = "23505";

export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const username = usernameFromEmail(user.email ?? user.id);

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    username,
    display_name: "",
  });

  if (error?.code === UNIQUE_VIOLATION) {
    await supabase.from("profiles").insert({
      id: user.id,
      username: `${username}_${Math.random().toString(36).slice(2, 8)}`,
      display_name: "",
    });
  }
}
