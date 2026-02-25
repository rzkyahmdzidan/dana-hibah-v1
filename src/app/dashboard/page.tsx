import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import { getApprovedData } from "@/lib/dana-hibah-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const approvedData = await getApprovedData();

  // Admin/superadmin: tampilkan juga data pending milik sendiri
  let pendingData: DanaHibah[] = [];
  if (profile?.role === "admin" || profile?.role === "superadmin") {
    const { data } = await supabase
      .from("dana_hibah")
      .select("*")
      .eq("uploaded_by", user.id)
      .eq("status", "pending")
      .order("no", { ascending: true });
    pendingData = (data as DanaHibah[]) || [];
  }

  return (
    <DashboardClient
      email={user.email ?? ""}
      role={profile?.role ?? "user"}
      fullName={profile?.full_name ?? ""}
      initialData={approvedData}
      pendingData={pendingData}
    />
  );
}