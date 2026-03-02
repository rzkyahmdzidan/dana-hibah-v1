"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";
import { ChartData, Dipa } from "@/lib/types";

const COLORS = ["#ec4899", "#3b82f6", "#f97316", "#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#84cc16", "#6366f1"];

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

// Helper: aggregate DIPA by nama_satker
export function groupDipaBySatker(dipaData: Dipa[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const d of dipaData) {
    if (!d.nama_satker) continue;
    map[d.nama_satker] = (map[d.nama_satker] ?? 0) + (d.nilai_hibah ?? 0);
  }
  return map;
}

// 1. Pie Chart — Distribusi Dana per Satker (pakai Nilai Hibah DIPA)
export function PieChartSatker({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);

  const pieData = data.map((d) => ({
    ...d,
    nilai: dipaMap[d.label] ?? d.belanja,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Distribusi Dana per Satker</h3>
      <p className="text-xs text-slate-400 mb-3">Berdasarkan Nilai Hibah (DIPA)</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="nilai"
            nameKey="label"
            cx="50%"
            cy="42%"
            outerRadius="55%"
            labelLine={false}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val: number | undefined) => [formatTooltip(val), "Nilai Hibah"]}
            contentStyle={{ borderRadius: 10, fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, paddingTop: 8, lineHeight: "1.6" }}
            formatter={(value) => <span style={{ color: "#64748b" }}>{shortLabel(value, 22)}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Horizontal Bar Chart — Top 10 Satker by Nilai Hibah DIPA
export function BarChartTop10({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);

  const chartData = [...data]
    .map((d) => ({
      ...d,
      nilaiHibah: dipaMap[d.label] ?? 0,
      shortLabel: shortLabel(d.label, 18),
    }))
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

// 3. Donut Chart — Persentase Aktivitas per Bulan
export function DonutChartBulan({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Persentase Aktivitas per Bulan</h3>
      <p className="text-xs text-slate-400 mb-3">Berdasarkan Nilai Belanja SPM</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="belanja"
            nameKey="label"
            cx="50%"
            cy="42%"
            innerRadius="30%"
            outerRadius="55%"
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(val: number | undefined) => [formatTooltip(val), "Nilai Belanja"]}
            contentStyle={{ borderRadius: 10, fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 10, paddingTop: 8, lineHeight: "1.6" }}
            formatter={(value) => <span style={{ color: "#64748b" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. Horizontal Bar Chart — Perbandingan: Nilai Hibah (DIPA) vs Belanja vs Pendapatan
export function BarChartPerbandingan({ data, dipaData = [] }: { data: ChartData[]; dipaData?: Dipa[] }) {
  const dipaMap = groupDipaBySatker(dipaData);

  const chartData = [...data]
    .map((d) => ({
      ...d,
      nilaiHibah: dipaMap[d.label] ?? 0,
      shortLabel: shortLabel(d.label, 18),
    }))
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
            formatter={(val: number | undefined, name: string) => [formatTooltip(val), name]}
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

export function BarChartLokasi({ data }: { data: ChartData[] }) {
  return <BarChartTop10 data={data} />;
}

export function PieChartTipe({ data }: { data: ChartData[] }) {
  return <PieChartSatker data={data} />;
}