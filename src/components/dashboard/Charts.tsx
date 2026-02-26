"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from "recharts";
import { ChartData } from "@/lib/types";

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

// 1. Pie Chart — Distribusi Dana per Satker
interface PieChartSatkerProps {
  data: ChartData[];
}

export function PieChartSatker({ data }: PieChartSatkerProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribusi Dana per Satker</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="belanja"
            nameKey="label"
            cx="50%"
            cy="45%"
            outerRadius={100}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number | undefined) => formatTooltip(val)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: "#64748b" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. Horizontal Bar Chart — Top 10 Satker
interface BarChartTop10Props {
  data: ChartData[];
}

export function BarChartTop10({ data }: BarChartTop10Props) {
  const top10 = [...data].sort((a, b) => b.belanja - a.belanja).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Top 10 Satker Berdasarkan Nilai Hibah</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={formatAxis} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} width={140} />
          <Tooltip formatter={(val: number | undefined) => formatTooltip(val)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Bar dataKey="belanja" name="Nilai Belanja" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. Donut Chart — Persentase Aktivitas per Bulan
interface DonutChartBulanProps {
  data: ChartData[];
}

export function DonutChartBulan({ data }: DonutChartBulanProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Persentase Aktivitas per Bulan</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="belanja"
            nameKey="label"
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            labelLine={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number | undefined) => formatTooltip(val)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: "#64748b" }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 4. Horizontal Bar Chart — Perbandingan Dana Hibah Satker
interface BarChartPerbandinganProps {
  data: ChartData[];
}

export function BarChartPerbandingan({ data }: BarChartPerbandinganProps) {
  const top10 = [...data].sort((a, b) => b.belanja - a.belanja).slice(0, 10);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Perbandingan Dana Hibah Satker</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={top10} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={formatAxis} />
          <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "#64748b" }} width={140} />
          <Tooltip formatter={(val: number | undefined) => formatTooltip(val)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Bar dataKey="belanja" name="Nilai Belanja" fill="#f97316" radius={[0, 4, 4, 0]} />
          <Bar dataKey="pendapatan" name="Nilai Pendapatan" fill="#a855f7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Export lama agar tidak break
export function BarChartLokasi({ data }: { data: ChartData[] }) {
  return <BarChartTop10 data={data} />;
}

export function PieChartTipe({ data }: { data: ChartData[] }) {
  return <PieChartSatker data={data} />;
}