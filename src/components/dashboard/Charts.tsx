"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { ChartData } from "@/lib/types";

const COLORS = ["#1d4ed8", "#0891b2", "#059669", "#d97706", "#dc2626", "#7c3aed", "#db2777", "#65a30d"];

function formatM(val: number) {
  if (val >= 1e9) return `${(val / 1e9).toFixed(1)}M`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}Jt`;
  return `${val}`;
}

interface BarChartLokasiProps {
  data: ChartData[];
}

export function BarChartLokasi({ data }: BarChartLokasiProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Nilai per Lokasi Satker</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 0, right: 8, bottom: 40, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={formatM} />
          <Tooltip formatter={(val: number | undefined) => `Rp ${((val ?? 0) / 1e9).toFixed(3)} M`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="belanja" name="Nilai Belanja" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pendapatan" name="Nilai Pendapatan" fill="#0891b2" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PieChartTipeProps {
  data: ChartData[];
}

export function PieChartTipe({ data }: PieChartTipeProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribusi Tipe Hibah</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="belanja" nameKey="label" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val: number | undefined) => `Rp ${((val ?? 0) / 1e9).toFixed(3)} M`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
