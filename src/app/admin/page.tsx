import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPanelClient from "./AdminPanelClient";
import { getPendingUploads } from "@/lib/dana-hibah-actions";
import Navbar from "@/app/components/dashboard/Navbar";

export const dynamic = "force-dynamic";

export default async function AdminPanelPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    redirect("/dashboard");
  }

  const pendingRaw = await getPendingUploads();

  const uploaderIds = pendingRaw.map((p) => p.uploadedBy);
  let uploaderProfiles: Record<string, { full_name: string; email: string }> = {};

  if (uploaderIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", uploaderIds);

    if (profiles) {
      for (const p of profiles) {
        uploaderProfiles[p.id] = { full_name: p.full_name, email: p.email };
      }
    }
  }

  const pendingUploads = pendingRaw.map((p) => ({
    uploadedBy: p.uploadedBy,
    role: p.role,
    count: p.count,
    uploadedAt: p.uploadedAt,
    rows: (p as any).rows ?? [],
    uploaderName: uploaderProfiles[p.uploadedBy]?.full_name || "",
    uploaderEmail: uploaderProfiles[p.uploadedBy]?.email || "",
  }));

  return (
    <>
      <Navbar email={user.email ?? ""} role={profile.role} fullName={profile.full_name ?? ""} />
      <AdminPanelClient pendingUploads={pendingUploads} role={profile.role} />
    </>
  );
}
