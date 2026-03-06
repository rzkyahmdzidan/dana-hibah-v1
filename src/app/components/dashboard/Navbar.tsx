"use client";

import { logout } from "@/lib/auth-actions";
import { useTransition } from "react";

interface NavbarProps {
  email: string;
  role: string;
  fullName?: string;
}

const roleBadge: Record<string, { label: string; className: string }> = {
  user:       { label: "User",         className: "bg-slate-100 text-slate-500" },
  admin:      { label: "Pegawai",      className: "bg-amber-50 text-amber-600 border border-amber-200" },
  superadmin: { label: "Kepala Seksi", className: "bg-blue-50 text-blue-600 border border-blue-200" },
};

export default function Navbar({ email, role, fullName }: NavbarProps) {
  const [isPending, startTransition] = useTransition();
  const badge = roleBadge[role] ?? roleBadge.user;
  const isLoggedIn = !!email;

  function handleLogout() {
    startTransition(async () => { await logout(); });
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">

        {/* Logo + Identitas */}
        <div className="flex items-center gap-4 shrink-0">
          <img
            src="/images/logo-kemenkeu.png"
            alt="Logo Kemenkeu"
            className="h-12 w-auto object-contain"
          />
          <div className="border-l border-slate-200 pl-4 leading-tight">
            <h1 className="text-base font-bold text-slate-800">Sistem Informasi Dana Hibah</h1>
            <p className="text-[11px] text-slate-400 mt-1">KPPN Medan 1</p>
          </div>
        </div>

        {/* Nav links */}
        {(role === "admin" || role === "superadmin") && (
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            <a href="/dashboard"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors">
              Dashboard
            </a>
            {role === "superadmin" && (
              <>
                <a href="/admin"
                  className="text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors">
                  Admin Panel
                </a>
                <a href="/admin/users"
                  className="text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors">
                  Kelola User
                </a>
              </>
            )}
          </nav>
        )}

        {/* Kanan */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-700">{fullName || email}</span>
                <span className={`text-[11px] mt-1 px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <div className="w-px h-5 bg-slate-200" />
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-500 transition-colors px-1 py-1"
              >
                {isPending ? (
                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
                Keluar
              </button>
            </>
          ) : (
            <a href="/login"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md transition-colors">
              Masuk
            </a>
          )}
        </div>

      </div>
    </header>
  );
}