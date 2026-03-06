"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DanaHibah, Dipa } from "@/lib/types";
import { parseExcelDualSheet } from "@/lib/utils";

// Upload data (admin/superadmin) → status pending
export async function uploadDanaHibah(rows: DanaHibah[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return { error: "Tidak memiliki akses" };
  }

  // Hapus data pending milik user ini dulu (replace upload)
  await supabase.from("dana_hibah").delete().eq("uploaded_by", user.id).eq("status", "pending");

  const insertData = rows.map((row) => ({
    no: row.no,
    tipe_hibah: row.tipe_hibah,
    no_sphl: row.no_sphl,
    tanggal_sphl: row.tanggal_sphl && row.tanggal_sphl !== "" ? row.tanggal_sphl : null,
    kode_kppn: row.kode_kppn,
    ba_eselon_i: row.ba_eselon_i,
    kode_satker: row.kode_satker,
    nama_satker: row.nama_satker,
    lokasi_satker: row.lokasi_satker,
    no_register: row.no_register,
    mata_uang: row.mata_uang,
    nilai_belanja: row.nilai_belanja,
    nilai_pendapatan: row.nilai_pendapatan,
    status: "pending",
    uploaded_by: user.id,
  }));

  const { error } = await supabase.from("dana_hibah").insert(insertData);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true, count: rows.length };
}

// Approve semua pending dari satu uploader
export async function approveDanaHibah(uploadedBy: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "superadmin") return { error: "Hanya superadmin yang bisa approve" };

  const { error } = await supabase.from("dana_hibah").update({ status: "approved" }).eq("uploaded_by", uploadedBy).eq("status", "pending");

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

// Reject semua pending dari satu uploader
export async function rejectDanaHibah(uploadedBy: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "superadmin") return { error: "Hanya superadmin yang bisa reject" };

  const { error } = await supabase.from("dana_hibah").delete().eq("uploaded_by", uploadedBy).eq("status", "pending");

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteApprovedData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "superadmin") return { error: "Hanya superadmin yang bisa menghapus" };

  await supabase.from("dana_hibah").delete().eq("status", "approved");
  await supabase.from("dipa").delete().eq("status", "approved");

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

// Hapus data approved per bulan tertentu
export async function deleteApprovedByMonth(uploadedBy: string, monthKey: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "superadmin") return { error: "Hanya superadmin yang bisa menghapus" };

  if (!monthKey || monthKey === "unknown") return { error: "Bulan tidak valid" };

  const startDate = `${monthKey}-01`;
  const endDate = `${monthKey}-31`;

  const [{ error: spmError }, { error: dipaError }] = await Promise.all([
    supabase.from("dana_hibah").delete().eq("uploaded_by", uploadedBy).eq("status", "approved").gte("tanggal_sphl", startDate).lte("tanggal_sphl", endDate),
    supabase.from("dipa").delete().eq("uploaded_by", uploadedBy).eq("status", "approved").gte("tanggal_dipa", startDate).lte("tanggal_dipa", endDate),
  ]);

  if (spmError) return { error: spmError.message };
  if (dipaError) return { error: dipaError.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { success: true };
}

// Fetch data approved (untuk user/dashboard)
export async function getApprovedData(): Promise<DanaHibah[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("dana_hibah").select("*").eq("status", "approved").order("no", { ascending: true });

  if (error || !data) return [];
  return data as DanaHibah[];
}

export async function getPendingUploads(): Promise<
  {
    uploadedBy: string;
    role: string;
    count: number;
    uploadedAt: string;
    rows: any[];
  }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("dana_hibah").select("*").eq("status", "pending").order("no", { ascending: true });

  if (error || !data) return [];

  const grouped: Record<
    string,
    {
      uploadedBy: string;
      role: string;
      count: number;
      uploadedAt: string;
      rows: any[];
    }
  > = {};

  for (const row of data) {
    if (!grouped[row.uploaded_by]) {
      grouped[row.uploaded_by] = {
        uploadedBy: row.uploaded_by,
        role: "",
        count: 0,
        uploadedAt: row.created_at,
        rows: [],
      };
    }
    grouped[row.uploaded_by].count++;
    grouped[row.uploaded_by].rows.push(row);
  }

  return Object.values(grouped);
}

// ── DIPA ACTIONS ────────────────────────────────────────────────────────────

export async function uploadDualSheetExcel(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  try {
    const buffer = await file.arrayBuffer();
    const { spmData, dipaData } = parseExcelDualSheet(buffer);

    const spmRows = spmData.map((row) => ({
      ...row,
      uploaded_by: user.id,
      status: "pending" as const,
    }));

    const dipaRows = dipaData.map((row) => ({
      ...row,
      uploaded_by: user.id,
      status: "pending" as const,
    }));

    // Kumpulkan bulan-tahun unik dari SPM yang akan diupload
    const spmMonths = [
      ...new Set(
        spmRows
          .map((r) => r.tanggal_sphl)
          .filter(Boolean)
          .map((d) => d.slice(0, 7)),
      ),
    ];

    // Kumpulkan bulan-tahun unik dari DIPA yang akan diupload
    const dipaMonths = [
      ...new Set(
        dipaRows
          .map((r) => r.tanggal_dipa)
          .filter(Boolean)
          .map((d: string) => d.slice(0, 7)),
      ),
    ];

    // Hapus data pending milik user ini untuk bulan yang sama saja
    for (const month of spmMonths) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      await supabase.from("dana_hibah").delete().eq("uploaded_by", user.id).eq("status", "pending").gte("tanggal_sphl", startDate).lte("tanggal_sphl", endDate);
    }

    for (const month of dipaMonths) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      await supabase.from("dipa").delete().eq("uploaded_by", user.id).eq("status", "pending").gte("tanggal_dipa", startDate).lte("tanggal_dipa", endDate);
    }

    // Insert data baru
    const { error: spmError } = await supabase.from("dana_hibah").insert(spmRows);
    if (spmError) return { error: `SPM Error: ${spmError.message}` };

    const { error: dipaError } = await supabase.from("dipa").insert(dipaRows);
    if (dipaError) return { error: `DIPA Error: ${dipaError.message}` };

    return {
      success: true,
      spmCount: spmRows.length,
      dipaCount: dipaRows.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: message };
  }
}

export async function getApprovedDipa(): Promise<Dipa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dipa").select("*").eq("status", "approved").order("no", { ascending: true });

  if (error) return [];
  return (data as Dipa[]) || [];
}

export async function getPendingDipa(userId: string): Promise<Dipa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dipa").select("*").eq("uploaded_by", userId).eq("status", "pending").order("no", { ascending: true });

  if (error) return [];
  return (data as Dipa[]) || [];
}

export async function approveDipa(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("dipa").update({ status: "approved" }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectDipa(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("dipa").update({ status: "rejected" }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function getAllPendingDipa(): Promise<Dipa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("dipa").select("*").eq("status", "pending").order("no", { ascending: true });

  if (error) return [];
  return (data as Dipa[]) || [];
}

export async function approveDipaByUploader(uploadedBy: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("dipa").update({ status: "approved" }).eq("uploaded_by", uploadedBy).eq("status", "pending");
  if (error) return { error: error.message };
  return { success: true };
}

export async function rejectDipaByUploader(uploadedBy: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("dipa").delete().eq("uploaded_by", uploadedBy).eq("status", "pending");
  if (error) return { error: error.message };
  return { success: true };
}

// Riwayat approved digroup per uploader + bulan
export async function getApprovedHistory(): Promise<
  {
    uploadedBy: string;
    uploaderName: string;
    uploaderEmail: string;
    monthKey: string;
    monthLabel: string;
    approvedAt: string;
    spmCount: number;
    dipaCount: number;
    totalBelanja: number;
    totalPendapatan: number;
    totalNilaiHibah: number;
    rows: any[];
    dipaRows: any[];
  }[]
> {
  const supabase = await createClient();

  const [{ data: spmData }, { data: dipaData }] = await Promise.all([supabase.from("dana_hibah").select("*").eq("status", "approved"), supabase.from("dipa").select("*").eq("status", "approved")]);

  if (!spmData) return [];

  // Group by uploaded_by + bulan (dari tanggal_sphl)
  const grouped: Record<string, any> = {};

  for (const row of spmData) {
    const rawDate = row.tanggal_sphl || row.created_at || "";
    const month = rawDate.length >= 7 ? rawDate.slice(0, 7) : "unknown";
    const key = `${row.uploaded_by}__${month}`;
    if (!grouped[key]) {
      grouped[key] = {
        uploadedBy: row.uploaded_by,
        monthKey: month,
        approvedAt: row.created_at,
        spmCount: 0,
        dipaCount: 0,
        totalBelanja: 0,
        totalPendapatan: 0,
        totalNilaiHibah: 0,
        uploaderName: "",
        uploaderEmail: "",
        rows: [],
        dipaRows: [],
      };
    }
    grouped[key].spmCount++;
    grouped[key].totalBelanja += row.nilai_belanja ?? 0;
    grouped[key].totalPendapatan += row.nilai_pendapatan ?? 0;
    grouped[key].rows.push(row);
    if (row.created_at > grouped[key].approvedAt) {
      grouped[key].approvedAt = row.created_at;
    }
  }

  // Build no_register → dipa map untuk matching
  const dipaByRegister = new Map<string, any>();
  for (const row of dipaData ?? []) {
    const existing = dipaByRegister.get(row.no_register);
    if (!existing || (row.nilai_hibah ?? 0) > (existing.nilai_hibah ?? 0)) {
      dipaByRegister.set(row.no_register, row);
    }
  }

  // Attach DIPA ke group SPM berdasarkan no_register yang ada di rows bulan itu
  for (const g of Object.values(grouped) as any[]) {
    const seenRegister = new Set<string>();
    for (const spmRow of g.rows) {
      const dipa = dipaByRegister.get(spmRow.no_register);
      if (dipa && !seenRegister.has(spmRow.no_register)) {
        seenRegister.add(spmRow.no_register);
        g.dipaRows.push(dipa);
        g.dipaCount++;
        g.totalNilaiHibah += dipa.nilai_hibah ?? 0;
      }
    }
  }

  // Ambil nama uploader
  const uploaderIds = [...new Set(Object.values(grouped).map((g: any) => g.uploadedBy as string))];
  if (uploaderIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", uploaderIds);
    for (const p of profiles ?? []) {
      for (const g of Object.values(grouped) as any[]) {
        if (g.uploadedBy === p.id) {
          g.uploaderName = p.full_name ?? "";
          g.uploaderEmail = p.email ?? "";
        }
      }
    }
  }

  // Format label bulan Indonesia
  const result = Object.values(grouped).map((g: any) => ({
    ...g,
    monthLabel: g.monthKey ? new Date(`${g.monthKey}-01`).toLocaleDateString("id-ID", { month: "long", year: "numeric" }) : "—",
  }));

  return result.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}
