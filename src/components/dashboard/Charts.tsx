"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { ChartData, Dipa, DanaHibah } from "@/lib/types";

const COLORS = ["#3b82f6", "#a855f7", "#ec4899", "#f97316", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#84cc16", "#6366f1"];

function formatAxis(val: number | undefined) {
  const v = val ?? 0;
  if (v >= 1e9) return `${(v / 1e9).toFixed(0)}M`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}Jt`;
  return `${v}`;
}

function formatTooltip(val: number | undefined) {
  const v = val ?? 0;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(2)} M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(2)} Jt`;
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function shortLabel(label: string, max = 20): string {
  if (label.length <= max) return label;
  return label.slice(0, max) + "…";
}

export function groupDipaBySatker(dipaData: Dipa[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const d of dipaData) {
    if (!d.nama_satker) continue;
    // Hanya ambil nilai_hibah terbesar per no_register per satker
    const key = `${d.nama_satker}__${d.no_register}`;
    if (!map[key] || (d.nilai_hibah ?? 0) > map[key]) {
      map[key] = d.nilai_hibah ?? 0;
    }
  }
  // Aggregate per satker
  const result: Record<string, number> = {};
  for (const [key, val] of Object.entries(map)) {
    const satker = key.split("__")[0];
    result[satker] = (result[satker] ?? 0) + val;
  }
  return result;
}

// ── 1. Pie Chart Distribusi ──────────────────────────────────────────────────
export function PieChartSatker({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);
  const pieData = data.map((d) => ({ ...d, nilai: dipaMap[d.label] ?? d.belanja }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Distribusi Dana per Satker</h3>
      <p className="text-xs text-slate-400 mb-3">Berdasarkan Nilai Hibah (DIPA)</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={pieData} dataKey="nilai" nameKey="label" cx="50%" cy="42%" outerRadius="55%" labelLine={false}>
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number | undefined) => [formatTooltip(val), "Nilai Hibah"]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 8, lineHeight: "1.6" }} formatter={(value) => <span style={{ color: "#64748b" }}>{shortLabel(value, 22)}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 2. Bar Chart Top 10 ──────────────────────────────────────────────────────
export function BarChartTop10({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);
  const chartData = [...data]
    .map((d) => ({ ...d, nilaiHibah: dipaMap[d.label] ?? 0, shortLabel: shortLabel(d.label, 18) }))
    .sort((a, b) => b.nilaiHibah - a.nilaiHibah)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Top 10 Satker Berdasarkan Nilai Hibah</h3>
      <p className="text-xs text-slate-400 mb-3">Pagu dari DIPA</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={formatAxis} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="shortLabel" tick={{ fontSize: 10, fill: "#64748b" }} width={120} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(val: number | undefined) => [formatTooltip(val), "Nilai Hibah (DIPA)"]}
            labelFormatter={(label) => chartData.find((d) => d.shortLabel === label)?.label ?? label}
            contentStyle={{ borderRadius: 10, fontSize: 12 }}
          />
          <Bar dataKey="nilaiHibah" name="Nilai Hibah (DIPA)" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 3. Donut Chart Bulan ─────────────────────────────────────────────────────
export function DonutChartBulan({ data }: { data: ChartData[] }) {
  const sorted = data;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Persentase Aktivitas per Bulan</h3>
      <p className="text-xs text-slate-400 mb-3">Berdasarkan Nilai Belanja SPM</p>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={sorted} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradBelanja" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPendapatan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={formatAxis} tickLine={false} axisLine={false} />
          <Tooltip formatter={(val: number | undefined, name: string | undefined) => [formatTooltip(val), name ?? ""]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Area type="monotone" dataKey="belanja" name="Nilai Belanja" stroke="#3b82f6" strokeWidth={2} fill="url(#gradBelanja)" dot={{ r: 3, fill: "#3b82f6" }} />
          <Area type="monotone" dataKey="pendapatan" name="Nilai Pendapatan" stroke="#a855f7" strokeWidth={2} fill="url(#gradPendapatan)" dot={{ r: 3, fill: "#a855f7" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 4. Bar Chart Perbandingan ────────────────────────────────────────────────
export function BarChartPerbandingan({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);
  const chartData = [...data]
    .map((d) => ({ ...d, nilaiHibah: dipaMap[d.label] ?? 0, shortLabel: shortLabel(d.label, 18) }))
    .sort((a, b) => b.nilaiHibah - a.nilaiHibah)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Perbandingan Dana Hibah per Satker</h3>
      <p className="text-xs text-slate-400 mb-3">Pagu (DIPA) vs Realisasi Belanja vs Pendapatan</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={formatAxis} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="shortLabel" tick={{ fontSize: 10, fill: "#64748b" }} width={120} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(val: number | undefined, name: string | undefined) => [formatTooltip(val), name ?? ""]}
            labelFormatter={(label) => chartData.find((d) => d.shortLabel === label)?.label ?? label}
            contentStyle={{ borderRadius: 10, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Bar dataKey="nilaiHibah" name="Nilai Hibah (DIPA)" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={14} />
          <Bar dataKey="belanja" name="Nilai Belanja" fill="#f97316" radius={[0, 4, 4, 0]} maxBarSize={14} />
          <Bar dataKey="pendapatan" name="Nilai Pendapatan" fill="#a855f7" radius={[0, 4, 4, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 5. LINE CHART — Trend Realisasi per Bulan ────────────────────────────────
export function LineChartTrend({ data }: { data: ChartData[] }) {
  const sorted = [...data].sort((a, b) => a.label.localeCompare(b.label));
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Trend Realisasi per Bulan</h3>
      <p className="text-xs text-slate-400 mb-3">Nilai Belanja & Pendapatan dari waktu ke waktu</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={sorted} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradBelanja" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPendapatan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={formatAxis} tickLine={false} axisLine={false} />
          <Tooltip formatter={(val: number | undefined, name: string | undefined) => [formatTooltip(val), name ?? ""]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Area type="monotone" dataKey="belanja" name="Nilai Belanja" stroke="#3b82f6" strokeWidth={2} fill="url(#gradBelanja)" dot={{ r: 3, fill: "#3b82f6" }} />
          <Area type="monotone" dataKey="pendapatan" name="Nilai Pendapatan" stroke="#a855f7" strokeWidth={2} fill="url(#gradPendapatan)" dot={{ r: 3, fill: "#a855f7" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 6. PROGRESS BAR — Serapan Pagu vs Realisasi per Satker ──────────────────
export function ProgressBarSerapan({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);
  const items = [...data]
    .map((d) => ({
      nama: d.label,
      pagu: dipaMap[d.label] ?? 0,
      realisasi: d.belanja,
      persen: dipaMap[d.label] ? Math.min(100, Math.round((d.belanja / dipaMap[d.label]) * 100)) : 0,
    }))
    .filter((d) => d.pagu > 0)
    .sort((a, b) => b.pagu - a.pagu);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Serapan Anggaran per Satker</h3>
      <p className="text-xs text-slate-400 mb-4">Pagu DIPA vs Realisasi Belanja</p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-700 truncate max-w-[60%]" title={item.nama}>
                {shortLabel(item.nama, 28)}
              </span>
              <span className={`text-xs font-bold ${item.persen >= 80 ? "text-emerald-600" : item.persen >= 50 ? "text-amber-500" : "text-rose-500"}`}>{item.persen}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${item.persen >= 80 ? "bg-emerald-500" : item.persen >= 50 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${item.persen}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400">Pagu: {formatTooltip(item.pagu)}</span>
              <span className="text-[10px] text-slate-400">Realisasi: {formatTooltip(item.realisasi)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 7. GAUGE — Serapan Anggaran Keseluruhan ──────────────────────────────────
export function GaugeSerapan({ totalBelanja, totalPagu }: { totalBelanja: number; totalPagu: number }) {
  const persen = totalPagu > 0 ? Math.min(100, Math.round((totalBelanja / totalPagu) * 100)) : 0;
  const radius = 80;
  const circumference = Math.PI * radius; // setengah lingkaran
  const offset = circumference - (persen / 100) * circumference;
  const color = persen >= 80 ? "#10b981" : persen >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Serapan Anggaran Keseluruhan</h3>
      <p className="text-xs text-slate-400 mb-2">Total Realisasi vs Total Pagu DIPA</p>
      <div className="flex flex-col items-center justify-center py-2">
        <svg width="220" height="130" viewBox="0 0 220 130">
          {/* Track */}
          <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke="#f1f5f9" strokeWidth="18" strokeLinecap="round" />
          {/* Progress */}
          <path d="M 20 110 A 90 90 0 0 1 200 110" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" strokeDasharray={`${circumference}`} strokeDashoffset={`${offset}`} style={{ transition: "stroke-dashoffset 1s ease" }} />
          {/* Center text */}
          <text x="110" y="100" textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>
            {persen}%
          </text>
          <text x="110" y="120" textAnchor="middle" fontSize="11" fill="#94a3b8">
            Serapan
          </text>
        </svg>
        <div className="flex gap-8 mt-1">
          <div className="text-center">
            <p className="text-xs text-slate-400">Total Belanja</p>
            <p className="text-sm font-bold text-slate-700">{formatTooltip(totalBelanja)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Total Pagu</p>
            <p className="text-sm font-bold text-slate-700">{formatTooltip(totalPagu)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 8. LEADERBOARD — Ranking Satker ─────────────────────────────────────────
export function LeaderboardSatker({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);
  const ranked = [...data]
    .map((d) => ({
      nama: d.label,
      belanja: d.belanja,
      pagu: dipaMap[d.label] ?? 0,
      persen: dipaMap[d.label] ? Math.min(100, Math.round((d.belanja / dipaMap[d.label]) * 100)) : 0,
    }))
    .sort((a, b) => b.belanja - a.belanja)
    .slice(0, 7);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Ranking Satker Terbesar</h3>
      <p className="text-xs text-slate-400 mb-4">Berdasarkan Nilai Belanja Realisasi</p>
      <div className="space-y-3">
        {ranked.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-7 text-center text-sm shrink-0">{i < 3 ? medals[i] : <span className="text-xs font-bold text-slate-400">#{i + 1}</span>}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700 truncate" title={item.nama}>
                  {shortLabel(item.nama, 25)}
                </span>
                <span className="text-xs font-bold text-blue-600 shrink-0 ml-2">{formatTooltip(item.belanja)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${ranked[0].belanja > 0 ? (item.belanja / ranked[0].belanja) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarChartLokasi({ data }: { data: ChartData[] }) {
  return <BarChartTop10 data={data} />;
}

export function PieChartTipe({ data }: { data: ChartData[] }) {
  return <PieChartSatker data={data} />;
}
