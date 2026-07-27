import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DisplayNameForm } from "./display-name-form";

export const metadata: Metadata = {
  title: "Настройки",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userData.user.id)
    .maybeSingle();

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl font-bold sm:text-2xl">Настройки</h1>

      <div className="max-w-sm rounded-3xl bg-card p-6 shadow-[0_1px_2px_rgba(38,36,31,0.06)]">
        <DisplayNameForm initialDisplayName={profile?.display_name ?? ""} />
      </div>

      <div className="max-w-sm rounded-3xl bg-card p-6 shadow-[0_1px_2px_rgba(38,36,31,0.06)]">
        <p className="mb-4 text-sm text-muted-foreground">Управление аккаунтом</p>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Выйти
          </button>
        </form>
      </div>
    </main>
  );
}
