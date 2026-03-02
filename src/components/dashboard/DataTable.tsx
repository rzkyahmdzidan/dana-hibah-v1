"use client";

import { useState, useMemo } from "react";
import { DanaHibah, Dipa } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

interface DataTableProps {
  data: DanaHibah[];
  dipaData?: Dipa[];
}

const PAGE_SIZE = 10;

export default function DataTable({ data, dipaData = [] }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [expandedSatker, setExpandedSatker] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const bulanOptions = useMemo(() => {
    const set = new Set<string>();
    for (const d of data) {
      if (d.tanggal_sphl) {
        const bulan = d.tanggal_sphl.slice(0, 7);
        set.add(bulan);
      }
    }
    return [...set].sort().reverse();
  }, [data]);

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const map = new Map<string, DanaHibah[]>();
    for (const d of data) {
      const matchSearch = !q ||
        d.nama_satker.toLowerCase().includes(q) ||
        d.no_register.toLowerCase().includes(q) ||
        d.kode_satker.toLowerCase().includes(q);
      const matchBulan = !filterBulan || (d.tanggal_sphl?.startsWith(filterBulan) ?? false);
      if (!matchSearch || !matchBulan) continue;
      if (!map.has(d.nama_satker)) map.set(d.nama_satker, []);
      map.get(d.nama_satker)!.push(d);
    }

    const dipaMap = new Map<string, Dipa>();
    for (const d of dipaData) {
      dipaMap.set(d.no_register, d);
    }

    return Array.from(map.entries()).map(([nama, rows]) => ({
      nama,
      lokasi: rows[0].lokasi_satker,
      tipe: rows[0].tipe_hibah,
      total_belanja: rows.reduce((s, r) => s + r.nilai_belanja, 0),
      total_pendapatan: rows.reduce((s, r) => s + r.nilai_pendapatan, 0),
      count: rows.length,
      rows: rows.map((r) => ({
        ...r,
        nilai_hibah: dipaMap.get(r.no_register)?.nilai_hibah ?? null,
        kode_satker_dipa: dipaMap.get(r.no_register)?.kode_satker ?? r.kode_satker,
      })),
    }));
  }, [data, dipaData, search, filterBulan]);

  const totalPages = Math.ceil(grouped.length / PAGE_SIZE);
  const paged = grouped.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-700">Detail Data Hibah</h3>
            <p className="text-xs text-slate-400 mt-0.5">{grouped.length} satker · {data.length} total data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama satker, kode, no register…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <select
              value={filterBulan}
              onChange={(e) => { setFilterBulan(e.target.value); setPage(1); }}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Semua Bulan</option>
              {bulanOptions.map((b) => {
                const [y, m] = b.split("-");
                const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
                return <option key={b} value={b}>{label}</option>;
              })}
            </select>
            {(search || filterBulan) && (
              <button
                onClick={() => { setSearch(""); setFilterBulan(""); setPage(1); }}
                className="text-xs text-slate-400 hover:text-slate-700 px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {paged.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">Tidak ada data ditemukan</div>
        ) : (
          paged.map((satker, i) => (
            <div key={satker.nama}>
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{satker.nama}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-blue-600">{satker.lokasi}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">{satker.tipe}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-400">{satker.count} SPM</span>
                  </div>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-slate-400">Total Belanja</p>
                  <p className="text-sm font-semibold text-slate-700">{formatRupiah(satker.total_belanja)}</p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-slate-400">Total Pendapatan</p>
                  <p className="text-sm font-semibold text-emerald-600">{formatRupiah(satker.total_pendapatan)}</p>
                </div>
                <button
                  onClick={() => setExpandedSatker(expandedSatker === satker.nama ? null : satker.nama)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    expandedSatker === satker.nama
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {expandedSatker === satker.nama ? "Tutup ▲" : "Detail ▼"}
                </button>
              </div>

              {expandedSatker === satker.nama && (
                <div className="px-5 pb-4 bg-slate-50">
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-blue-600 text-white">
                          <th className="px-3 py-2 text-left font-medium">No</th>
                          <th className="px-3 py-2 text-left font-medium">Kode Satker</th>
                          <th className="px-3 py-2 text-left font-medium">No Register</th>
                          <th className="px-3 py-2 text-left font-medium">Nama Satker</th>
                          <th className="px-3 py-2 text-left font-medium">Tgl SPHL</th>
                          <th className="px-3 py-2 text-right font-medium">Nilai Belanja</th>
                          <th className="px-3 py-2 text-right font-medium">Nilai Pendapatan</th>
                          <th className="px-3 py-2 text-right font-medium">Nilai Hibah (DIPA)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {satker.rows.map((row, j) => (
                          <tr key={j} className="hover:bg-blue-50/40">
                            <td className="px-3 py-2 text-slate-400">{row.no}</td>
                            <td className="px-3 py-2 text-slate-700 font-mono">{row.kode_satker_dipa}</td>
                            <td className="px-3 py-2 text-slate-700 font-mono">{row.no_register}</td>
                            <td className="px-3 py-2 text-slate-700 max-w-[180px] truncate" title={row.nama_satker}>{row.nama_satker}</td>
                            <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{row.tanggal_sphl}</td>
                            <td className="px-3 py-2 text-right font-medium text-slate-700 whitespace-nowrap">{formatRupiah(row.nilai_belanja)}</td>
                            <td className="px-3 py-2 text-right font-medium text-emerald-700 whitespace-nowrap">{formatRupiah(row.nilai_pendapatan)}</td>
                            <td className="px-3 py-2 text-right font-medium text-purple-700 whitespace-nowrap">
                              {row.nilai_hibah !== null ? formatRupiah(row.nilai_hibah) : <span className="text-slate-300">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return <button key={pageNum} onClick={() => setPage(pageNum)} className={`w-7 h-7 text-xs rounded-lg border transition-colors ${page === pageNum ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 hover:bg-slate-50"}`}>{pageNum}</button>;
            })}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}