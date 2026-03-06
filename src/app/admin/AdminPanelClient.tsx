"use client";

import { useState, useTransition } from "react";
import { approveDanaHibah, rejectDanaHibah, deleteApprovedData, approveDipaByUploader, rejectDipaByUploader } from "@/lib/dana-hibah-actions";
import { DanaHibah, Dipa } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

interface PendingUpload {
  uploadedBy: string;
  role: string;
  count: number;
  uploadedAt: string;
  uploaderName?: string;
  uploaderEmail?: string;
  rows: DanaHibah[];
  dipaRows: Dipa[];
}

interface AdminPanelClientProps {
  pendingUploads: PendingUpload[];
  role: string;
}

const roleLabel: Record<string, string> = {
  user:       "User",
  admin:      "Pegawai",
  superadmin: "Kepala Seksi",
};

export default function AdminPanelClient({ pendingUploads, role }: AdminPanelClientProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [items, setItems] = useState(pendingUploads);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, "spm" | "dipa">>({});

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }

  function handleApprove(uploadedBy: string) {
    startTransition(async () => {
      const [spmResult, dipaResult] = await Promise.all([
        approveDanaHibah(uploadedBy),
        approveDipaByUploader(uploadedBy),
      ]);
      if (spmResult.error) { showMessage("error", `SPM: ${spmResult.error}`); return; }
      if (dipaResult.error) { showMessage("error", `DIPA: ${dipaResult.error}`); return; }
      showMessage("success", "Data SPM + DIPA berhasil disetujui!");
      setItems((prev) => prev.filter((i) => i.uploadedBy !== uploadedBy));
      setExpandedId(null);
    });
  }

  function handleReject(uploadedBy: string) {
    startTransition(async () => {
      const [spmResult, dipaResult] = await Promise.all([
        rejectDanaHibah(uploadedBy),
        rejectDipaByUploader(uploadedBy),
      ]);
      if (spmResult.error) { showMessage("error", `SPM: ${spmResult.error}`); return; }
      if (dipaResult.error) { showMessage("error", `DIPA: ${dipaResult.error}`); return; }
      showMessage("success", "Data ditolak.");
      setItems((prev) => prev.filter((i) => i.uploadedBy !== uploadedBy));
      setExpandedId(null);
    });
  }

  function handleDeleteAll() {
    if (!confirm("Yakin ingin menghapus SEMUA data yang sudah approved? Tindakan ini tidak bisa dibatalkan.")) return;
    startTransition(async () => {
      const result = await deleteApprovedData();
      if (result.error) { showMessage("error", result.error); return; }
      showMessage("success", "Semua data approved berhasil dihapus.");
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-0.5">Kelola persetujuan data Dana Hibah</p>
          </div>
          {role === "superadmin" && (
            <button onClick={handleDeleteAll} disabled={isPending} className="text-xs text-rose-600 hover:text-rose-800 border border-rose-200 hover:border-rose-400 rounded-lg px-3 py-1.5 transition-colors font-medium disabled:opacity-50">
              Hapus Semua Data Approved
            </button>
          )}
        </div>

        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">
              Menunggu Persetujuan
              {items.length > 0 && <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{items.length}</span>}
            </h2>
          </div>

          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">Tidak ada data yang menunggu persetujuan</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const tab = activeTab[item.uploadedBy] ?? "spm";
                const label = roleLabel[item.role] ?? item.role;
                return (
                  <div key={item.uploadedBy}>
                    <div className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${item.role === "superadmin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {item.role === "superadmin" ? "KS" : "P"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{item.uploaderName || item.uploaderEmail || item.uploadedBy}</p>
                          <p className="text-xs text-slate-400">
                            <span className="text-blue-600 font-medium">{item.count} baris SPM</span>
                            {item.dipaRows.length > 0 && <span className="text-purple-600 font-medium"> + {item.dipaRows.length} baris DIPA</span>}
                            {" · "}
                            {label} ·{" "}
                            {new Date(item.uploadedAt).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setExpandedId(expandedId === item.uploadedBy ? null : item.uploadedBy)}
                          className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          {expandedId === item.uploadedBy ? "Sembunyikan" : "Lihat Detail"}
                        </button>
                        <button
                          onClick={() => handleReject(item.uploadedBy)}
                          disabled={isPending}
                          className="text-xs text-rose-600 hover:text-rose-800 border border-rose-200 hover:border-rose-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleApprove(item.uploadedBy)}
                          disabled={isPending}
                          className="text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 font-medium"
                        >
                          {isPending ? "Memproses..." : "Setujui"}
                        </button>
                      </div>
                    </div>

                    {expandedId === item.uploadedBy && (
                      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                        <div className="flex gap-2 mb-4">
                          <button
                            onClick={() => setActiveTab((prev) => ({ ...prev, [item.uploadedBy]: "spm" }))}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${tab === "spm" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}
                          >
                            SPM Pengesahan ({item.count})
                          </button>
                          <button
                            onClick={() => setActiveTab((prev) => ({ ...prev, [item.uploadedBy]: "dipa" }))}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${tab === "dipa" ? "bg-purple-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-purple-300"}`}
                          >
                            DIPA ({item.dipaRows.length})
                          </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          {tab === "spm" ? (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-slate-100 text-slate-600">
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">No</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Kode Satker</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">No Register</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Nama Satker</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Tipe Hibah</th>
                                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">Nilai Belanja</th>
                                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">Nilai Pendapatan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {item.rows.map((row, i) => (
                                  <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 text-slate-500">{row.no}</td>
                                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.kode_satker}</td>
                                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.no_register}</td>
                                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-xs truncate">{row.nama_satker}</td>
                                    <td className="px-3 py-2 text-slate-700">{row.tipe_hibah}</td>
                                    <td className="px-3 py-2 text-right text-slate-700 whitespace-nowrap">{formatRupiah(row.nilai_belanja)}</td>
                                    <td className="px-3 py-2 text-right text-slate-700 whitespace-nowrap">{formatRupiah(row.nilai_pendapatan)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-slate-100 text-slate-600">
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">No</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Kode Satker</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">No Register</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Nama Satker</th>
                                  <th className="px-3 py-2 text-left font-medium whitespace-nowrap">Tipe Hibah</th>
                                  <th className="px-3 py-2 text-right font-medium whitespace-nowrap">Nilai Hibah</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {item.dipaRows.map((row, i) => (
                                  <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 text-slate-500">{row.no}</td>
                                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.kode_satker}</td>
                                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.no_register}</td>
                                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap max-w-xs truncate">{row.nama_satker}</td>
                                    <td className="px-3 py-2 text-slate-700">{row.tipe_hibah}</td>
                                    <td className="px-3 py-2 text-right text-purple-700 font-medium whitespace-nowrap">{formatRupiah(row.nilai_hibah)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}