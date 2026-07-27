import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", userData.user.id)
    .maybeSingle();

  const displayName =
    profile?.display_name || profile?.username || userData.user.email || "";

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Sidebar displayName={displayName} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
