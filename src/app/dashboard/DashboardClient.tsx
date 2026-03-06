"use client";

import { useState, useMemo } from "react";
import { DanaHibah, Dipa } from "@/lib/types";
import { computeSummary, formatRupiah, groupBySatker, groupByBulan } from "@/lib/utils";
import { generateSampleData } from "@/lib/sampleData";
import StatCard from "@/components/dashboard/StatCard";
import UploadExcel from "@/components/dashboard/UploadExcel";
import DataTable from "@/components/dashboard/DataTable";
import { PieChartSatker, BarChartTop10, DonutChartBulan, BarChartPerbandingan } from "@/components/dashboard/Charts";
import Navbar from "@/app/components/dashboard/Navbar";

interface DashboardClientProps {
  email: string;
  role: string;
  fullName: string;
  initialData: DanaHibah[];
  pendingData: DanaHibah[];
  dipaData?: Dipa[];
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-6 bg-blue-600 rounded-full" />
      <div>
        <h2 className="text-sm font-bold text-slate-700 leading-tight">{title}</h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardClient({ email, role, fullName, initialData, pendingData, dipaData = [] }: DashboardClientProps) {
  const [data, setData] = useState<DanaHibah[]>(initialData);
  const [hasData, setHasData] = useState(initialData.length > 0);
  const [localPendingCount, setLocalPendingCount] = useState(pendingData.length);
  const [filterQuery, setFilterQuery] = useState("");

  function handleDataLoaded(rows: DanaHibah[]) {
    setData(rows);
    setHasData(true);
    setLocalPendingCount(rows.length);
  }
  function handleLoadSample() {
    setData(generateSampleData(40));
    setHasData(true);
  }

  // Filter berdasarkan nama satker, kode satker, atau no register
  const filteredData = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) =>
      d.nama_satker?.toLowerCase().includes(q) ||
      d.kode_satker?.toLowerCase().includes(q) ||
      d.no_register?.toLowerCase().includes(q)
    );
  }, [data, filterQuery]);

  // Untuk DIPA: match berdasarkan nama_satker atau kode_satker dari hasil filter SPM
  const filteredSatkerNames = useMemo(() => new Set(filteredData.map((d) => d.nama_satker)), [filteredData]);
  const filteredDipa = useMemo(() => {
    if (!filterQuery.trim()) return dipaData;
    return dipaData.filter((d) => filteredSatkerNames.has(d.nama_satker));
  }, [dipaData, filteredData, filterQuery]);

  const summary = hasData ? computeSummary(filteredData) : null;
  const satkerChart = hasData ? groupBySatker(filteredData) : [];
  const bulanChart = hasData ? groupByBulan(filteredData) : [];
  const totalNilaiHibah = filteredDipa.reduce((sum, d) => sum + (d.nilai_hibah ?? 0), 0);

  const isFiltered = filterQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} role={role} fullName={fullName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Upload */}
        {(role === "admin" || role === "superadmin") && (
          <section>
            <SectionHeader title="Upload Data" sub="Unggah file Excel SPM dan DIPA" />
            <UploadExcel onDataLoaded={handleDataLoaded} onLoadSample={handleLoadSample} />
          </section>
        )}

        {/* Notif pending */}
        {localPendingCount > 0 && (
          <div className="bg-white border-l-4 border-amber-400 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">{localPendingCount} baris data</span> menunggu persetujuan Kepala Seksi
            </p>
          </div>
        )}

        {/* User tanpa data */}
        {role === "user" && !hasData && (
          <div className="bg-white border-l-4 border-blue-400 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-700">Tidak ada data yang tersedia saat ini.</p>
          </div>
        )}

        {/* Empty state */}
        {!hasData && (
          <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-20 text-center shadow-sm">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-500">Belum ada data</p>
            {(role === "admin" || role === "superadmin") && (
              <p className="text-xs text-slate-400 mt-1">Upload file Excel atau gunakan data contoh untuk memulai</p>
            )}
          </div>
        )}

        {hasData && summary && (
          <>
            {/* Filter */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">Filter</span>
                <div className="w-px h-4 bg-slate-200" />
                <div className="relative flex-1 max-w-md">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                  </svg>
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Cari nama satker, kode satker, atau no register…"
                    className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                  />
                </div>
                {isFiltered && (
                  <button onClick={() => setFilterQuery("")}
                    className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors shrink-0">
                    Reset
                  </button>
                )}
              </div>
              {isFiltered && (
                <p className="text-xs text-slate-400 mt-2 pl-1">
                  Menampilkan <span className="font-semibold text-slate-600">{filteredData.length}</span> dari <span className="font-semibold text-slate-600">{data.length}</span> data
                </p>
              )}
            </div>

            {/* Stat Cards */}
            <section>
              <SectionHeader title="Ringkasan Data" sub="Rekapitulasi keseluruhan dana hibah" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Total Data SPM" value={filteredData.length.toLocaleString("id-ID")} sub="Jumlah record SPM Pengesahan" color="blue"
                  icon={null} />
                <StatCard title="Jumlah Satker" value={summary.totalSatker.toLocaleString("id-ID")} sub="Satuan kerja unik" color="gold"
                  icon={null} />
                <StatCard title="Total Nilai Hibah (Pagu)" value={formatRupiah(totalNilaiHibah)} sub="Dari DIPA" color="gold"
                  icon={null} />
                <StatCard title="Total Nilai Belanja" value={formatRupiah(summary.totalBelanja)} sub="Realisasi dari SPM" color="green"
                  icon={null} />
                <StatCard title="Total Nilai Pendapatan" value={formatRupiah(summary.totalPendapatan)} sub="Akumulasi semua data" color="red"
                  icon={null} />
              </div>
            </section>

            {/* Charts */}
            <section>
              <SectionHeader title="Visualisasi Data" sub="Grafik distribusi dan perbandingan dana hibah" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PieChartSatker data={satkerChart} dipaData={filteredDipa} />
                <BarChartTop10 data={satkerChart} dipaData={filteredDipa} />
                <DonutChartBulan data={bulanChart} />
                <BarChartPerbandingan data={satkerChart} dipaData={filteredDipa} />
              </div>
            </section>

            {/* Tabel */}
            <section>
              <SectionHeader title="Detail Data" sub="Rincian transaksi per satker" />
              <DataTable data={filteredData} dipaData={filteredDipa} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}