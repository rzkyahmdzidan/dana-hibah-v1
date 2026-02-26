import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import { getApprovedData } from "@/lib/dana-hibah-actions";
import { DanaHibah } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Ambil profile jika sudah login
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const approvedData = await getApprovedData();

  // Pending data hanya untuk admin/superadmin
  let pendingData: DanaHibah[] = [];
  if (user && (profile?.role === "admin" || profile?.role === "superadmin")) {
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
      email={user?.email ?? ""}
      role={profile?.role ?? "user"}
      fullName={profile?.full_name ?? ""}
      initialData={approvedData}
      pendingData={pendingData}
    />
  );
}