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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-100 rounded-full opacity-30" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/images/logo-kemenkeu.png"
            alt="Logo Kemenkeu"
            className="h-20 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-slate-800">Sistem Informasi Dana Hibah</h1>
          <p className="text-sm text-slate-400 mt-1">KPPN Medan 1</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">
            {isRegister ? "Buat Akun Baru" : "Masuk ke Dashboard"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Nama Lengkap</label>
                <input name="full_name" type="text" required placeholder="Nama lengkap Anda"
                  className="w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all" />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="email@gmail.com"
                className="w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
              <input name="password" type="password" required placeholder="••••••••" minLength={6}
                className="w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all" />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={isPending}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
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
            <button onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
              {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
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