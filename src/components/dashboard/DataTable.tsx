"use client";

import { useState, useMemo } from "react";
import { DanaHibah } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

interface DataTableProps {
  data: DanaHibah[];
}

const PAGE_SIZE = 10;

export default function DataTable({ data }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [page, setPage] = useState(1);

  const lokasiOptions = useMemo(() => [...new Set(data.map((d) => d.lokasi_satker))].sort(), [data]);
  const tipeOptions = useMemo(() => [...new Set(data.map((d) => d.tipe_hibah))].sort(), [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((d) => {
      const matchSearch =
        !q ||
        d.nama_satker.toLowerCase().includes(q) ||
        d.no_register.toLowerCase().includes(q) ||
        d.kode_satker.includes(q);
      const matchLokasi = !filterLokasi || d.lokasi_satker === filterLokasi;
      const matchTipe = !filterTipe || d.tipe_hibah === filterTipe;
      return matchSearch && matchLokasi && matchTipe;
    });
  }, [data, search, filterLokasi, filterTipe]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setSearch("");
    setFilterLokasi("");
    setFilterTipe("");
    setPage(1);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-700">Detail Data Hibah</h3>
            <p className="text-xs text-slate-400 mt-0.5">{filtered.length} dari {data.length} data</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari satker, no register…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            {/* Filter Lokasi */}
            <select
              value={filterLokasi}
              onChange={(e) => { setFilterLokasi(e.target.value); setPage(1); }}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Semua Lokasi</option>
              {lokasiOptions.map((l) => <option key={l}>{l}</option>)}
            </select>
            {/* Filter Tipe */}
            <select
              value={filterTipe}
              onChange={(e) => { setFilterTipe(e.target.value); setPage(1); }}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Semua Tipe</option>
              {tipeOptions.map((t) => <option key={t}>{t}</option>)}
            </select>
            {(search || filterLokasi || filterTipe) && (
              <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-slate-700 px-2">Reset</button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {["No", "Nama Satker", "Lokasi", "Tipe Hibah", "Mata Uang", "Nilai Belanja", "Nilai Pendapatan"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">Tidak ada data ditemukan</td>
              </tr>
            ) : (
              paged.map((d, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400">{d.no}</td>
                  <td className="px-4 py-2.5 text-slate-700 font-medium max-w-[200px] truncate" title={d.nama_satker}>{d.nama_satker}</td>
                  <td className="px-4 py-2.5">
                    <span className="bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 whitespace-nowrap">{d.lokasi_satker}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 whitespace-nowrap">{d.tipe_hibah}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{d.mata_uang}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-700 whitespace-nowrap">{formatRupiah(d.nilai_belanja)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-emerald-700 whitespace-nowrap">{formatRupiah(d.nilai_pendapatan)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">Halaman {page} dari {totalPages}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >← Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-7 h-7 text-xs rounded-lg border transition-colors
                    ${page === pageNum ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 hover:bg-slate-50"}`}
                >{pageNum}</button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}