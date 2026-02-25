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
  user:       "bg-slate-100 text-slate-600",
  admin:      "bg-amber-100 text-amber-700",
  superadmin: "bg-blue-100 text-blue-700",
};

const ROLES = ["user", "admin", "superadmin"];

export default function UsersClient({ currentUserId, users: initialUsers, currentRole, currentEmail }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function changeRole(userId: string, newRole: string) {
    if (userId === currentUserId) {
      showToast("Tidak bisa mengubah role diri sendiri.", "error");
      return;
    }
    setUpdatingId(userId);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        showToast(`Gagal: ${error.message}`, "error");
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showToast("Role berhasil diupdate.", "success");
      }
      setUpdatingId(null);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={currentEmail} role={currentRole} />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm shadow-lg border
          ${toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-rose-50 border-rose-200 text-rose-700"}`}>
          {toast.msg}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">Kelola User</h2>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} user terdaftar</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Terdaftar</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">Ubah Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-700 text-sm">{u.full_name || "—"}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString("id-ID", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadge[u.role] ?? roleBadge.user}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id === currentUserId ? (
                      <span className="text-xs text-slate-300 italic">Anda</span>
                    ) : (
                      <div className="flex gap-1">
                        {ROLES.filter((r) => r !== u.role).map((r) => (
                          <button
                            key={r}
                            onClick={() => changeRole(u.id, r)}
                            disabled={isPending && updatingId === u.id}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors
                              ${r === "superadmin"
                                ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                                : r === "admin"
                                  ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                  : "border-slate-200 text-slate-500 hover:bg-slate-50"}
                              disabled:opacity-40`}
                          >
                            {isPending && updatingId === u.id ? "…" : `→ ${r}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}