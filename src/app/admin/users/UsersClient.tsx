"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/app/components/dashboard/Navbar";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UsersClientProps {
  currentUserId: string;
  users: UserProfile[];
  currentRole: string;
  currentEmail: string;
}

const roleBadge: Record<string, string> = {
  user:       "bg-slate-100 text-slate-600 border border-slate-200",
  admin:      "bg-amber-50 text-amber-700 border border-amber-200",
  superadmin: "bg-blue-50 text-blue-700 border border-blue-200",
};

const roleLabel: Record<string, string> = {
  user:       "User",
  admin:      "Pegawai",
  superadmin: "Kepala Seksi",
};

const ROLES = ["user", "admin", "superadmin"];

export default function UsersClient({ currentUserId, users: initialUsers, currentRole, currentEmail }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function openEdit(u: UserProfile) {
    setEditUser(u);
    setEditName(u.full_name);
    setEditEmail(u.email);
    setEditRole(u.role);
  }

  function saveEdit() {
    if (!editUser) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editName, email: editEmail, role: editRole })
        .eq("id", editUser.id);
      if (error) showToast(`Gagal: ${error.message}`, "error");
      else {
        setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, full_name: editName, email: editEmail, role: editRole } : u));
        showToast("Data user berhasil diperbarui.", "success");
        setEditUser(null);
      }
    });
  }

  function doDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").delete().eq("id", deleteTarget.id);
      if (error) showToast(`Gagal: ${error.message}`, "error");
      else {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        showToast("User berhasil dihapus.", "success");
      }
      setDeleteTarget(null);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={currentEmail} role={currentRole} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg text-sm shadow-md border flex items-center gap-2
          ${toast.type === "success" ? "bg-white border-emerald-200 text-emerald-700" : "bg-white border-rose-200 text-rose-700"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"}`} />
          {toast.msg}
        </div>
      )}

      {/* Modal Edit */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Edit Data User</h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Nama Lengkap</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Jabatan</label>
                <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                  className="w-full text-sm text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-white">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{roleLabel[r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full text-sm text-slate-900 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="text-xs font-medium text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button onClick={saveEdit} disabled={isPending} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {isPending ? "Menyimpan…" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200">
            <div className="px-6 py-5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Hapus User</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Anda akan menghapus akun <span className="font-semibold text-slate-700">{deleteTarget.full_name || deleteTarget.email}</span>. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="text-xs font-medium text-slate-600 border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                Batal
              </button>
              <button onClick={doDelete} disabled={isPending} className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                {isPending ? "Menghapus…" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h2>
            <p className="text-xs text-slate-400 mt-0.5">Kelola akun dan hak akses pengguna sistem</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-500">
            Total: <span className="font-semibold text-slate-700">{users.length} pengguna</span>
          </div>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-700 px-5 py-2.5 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Daftar Pengguna</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">No</th>
                <th className="px-5 py-3 text-left">Nama / Email</th>
                <th className="px-5 py-3 text-left">Terdaftar</th>
                <th className="px-5 py-3 text-left">Jabatan</th>
                <th className="px-5 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, i) => (
                <tr key={u.id} className={`hover:bg-slate-50/70 transition-colors ${u.id === currentUserId ? "bg-blue-50/30" : ""}`}>
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800 text-sm">{u.full_name || "—"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${roleBadge[u.role] ?? roleBadge.user}`}>
                      {roleLabel[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id === currentUserId ? (
                      <span className="text-xs text-slate-300 italic">Akun Anda</span>
                    ) : (
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(u)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(u)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 px-2.5 py-1 rounded-md transition-colors">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Hapus
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            Menampilkan {users.length} dari {users.length} pengguna terdaftar
          </div>
        </div>
      </main>
    </div>
  );
}