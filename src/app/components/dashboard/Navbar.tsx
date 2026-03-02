"use client";

import { logout } from "@/lib/auth-actions";
import { useTransition } from "react";

interface NavbarProps {
  email: string;
  role: string;
  fullName?: string;
}

const roleBadge: Record<string, { label: string; className: string }> = {
  user:       { label: "User",       className: "bg-slate-100 text-slate-600" },
  admin:      { label: "Admin",      className: "bg-amber-100 text-amber-700" },
  superadmin: { label: "Superadmin", className: "bg-blue-100 text-blue-700"  },
};

export default function Navbar({ email, role, fullName }: NavbarProps) {
  const [isPending, startTransition] = useTransition();
  const badge = roleBadge[role] ?? roleBadge.user;
  const isLoggedIn = !!email;

  function handleLogout() {
    startTransition(async () => { await logout(); });
  }

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-none">Dana Hibah</h1>
            <p className="text-xs text-slate-400 mt-0.5">KPPN Medan 1</p>
          </div>
        </div>

        {/* Nav links (admin+) */}
        {(role === "admin" || role === "superadmin") && (
          <nav className="hidden md:flex items-center gap-1">
            <a href="/dashboard" className="text-xs text-slate-500 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              Dashboard
            </a>
            <a href="/admin" className="text-xs text-slate-500 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              Admin Panel
            </a>
            {role === "superadmin" && (
              <a href="/admin/users" className="text-xs text-slate-500 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                Kelola User
              </a>
            )}
          </nav>
        )}

        {/* Kanan: user info / tombol login */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium text-slate-700 leading-none">
                  {fullName || email}
                </span>
                <span className={`text-xs mt-1 px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {isPending ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                )}
                Keluar
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Masuk
            </a>
          )}
        </div>
      </div>
    </header>
  );
}