import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "superadmin") redirect("/dashboard");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <UsersClient
      currentUserId={user.id}
      users={users ?? []}
      currentRole={profile.role}
      currentEmail={user.email ?? ""}
    />
  );
}