"use client";

import { useState, useTransition } from "react";
import { login, register } from "@/lib/auth-actions";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const action = isRegister ? register : login;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full opacity-30" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-700 shadow-lg mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Dana Hibah</h1>
          <p className="text-sm text-slate-400 mt-1">KPPN Medan 1</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">
            {isRegister ? "Buat Akun Baru" : "Masuk ke Dashboard"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nama Lengkap</label>
                <input
                  name="full_name"
                  type="text"
                  required
                  placeholder="Nama lengkap Anda"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="email@kemenk.go.id"
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRegister ? "Mendaftar…" : "Masuk…"}
                </>
              ) : (
                isRegister ? "Daftar" : "Masuk"
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
            >
              {isRegister
                ? "Sudah punya akun? Masuk"
                : "Belum punya akun? Daftar"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6">
          Direktorat Jenderal Perbendaharaan · Kemenkeu RI
        </p>
      </div>
    </div>
  );
}