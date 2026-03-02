"use client";

import { useState } from "react";
import { DanaHibah, Dipa } from "@/lib/types";
import { computeSummary, formatRupiah, groupByLokasi, groupByTipe, groupBySatker, groupByBulan } from "@/lib/utils";
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

export default function DashboardClient({ email, role, fullName, initialData, pendingData, dipaData = [] }: DashboardClientProps) {
  const [data, setData] = useState<DanaHibah[]>(initialData);
  const [hasData, setHasData] = useState(initialData.length > 0);
  const [localPendingCount, setLocalPendingCount] = useState(pendingData.length);

  function handleDataLoaded(rows: DanaHibah[]) {
    setData(rows);
    setHasData(true);
    setLocalPendingCount(rows.length);
  }
  function handleLoadSample() {
    setData(generateSampleData(40));
    setHasData(true);
  }

  const summary = hasData ? computeSummary(data) : null;
  const satkerChart = hasData ? groupBySatker(data) : [];
  const bulanChart = hasData ? groupByBulan(data) : [];
  const totalNilaiHibah = dipaData.reduce((sum, d) => sum + (d.nilai_hibah ?? 0), 0);
  const totalDipa = dipaData.length;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar email={email} role={role} fullName={fullName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {(role === "admin" || role === "superadmin") && <UploadExcel onDataLoaded={handleDataLoaded} onLoadSample={handleLoadSample} />}

        {localPendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">{localPendingCount} baris data menunggu persetujuan superadmin</p>
              <p className="text-xs text-amber-600 mt-0.5">Data akan tampil setelah disetujui</p>
            </div>
          </div>
        )}

        {role === "user" && !hasData && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Tidak Ada data yang tersedia</p>
            </div>
          </div>
        )}

        {!hasData && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">Belum ada data</p>
            {(role === "admin" || role === "superadmin") && <p className="text-xs text-slate-400 mt-1">Upload file Excel atau gunakan data contoh untuk memulai</p>}
          </div>
        )}

        {hasData && summary && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Data SPM"
                value={summary.totalData.toLocaleString("id-ID")}
                sub="Jumlah record SPM Pengesahan"
                color="blue"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                }
              />
              <StatCard
                title="Jumlah Satker"
                value={summary.totalSatker.toLocaleString("id-ID")}
                sub="Satuan kerja unik"
                color="gold"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <StatCard
                title="Total Nilai Hibah (Pagu)"
                value={formatRupiah(totalNilaiHibah)}
                sub="Dari DIPA"
                color="gold"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                }
              />
              <StatCard
                title="Total Nilai Belanja"
                value={formatRupiah(summary.totalBelanja)}
                sub="Realisasi dari SPM"
                color="green"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <StatCard
                title="Total Nilai Pendapatan"
                value={formatRupiah(summary.totalPendapatan)}
                sub="Akumulasi semua data"
                color="red"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            </div>

            {/* 4 Charts */}
            {/* 4 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PieChartSatker data={satkerChart} dipaData={dipaData} />
              <BarChartTop10 data={satkerChart} dipaData={dipaData} />
              <DonutChartBulan data={bulanChart} />
              <BarChartPerbandingan data={satkerChart} dipaData={dipaData} />
            </div>

            <DataTable data={data} dipaData={dipaData} />
          </>
        )}
      </main>
    </div>
  );
}
