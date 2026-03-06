"use client";

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  color: "blue" | "gold" | "green" | "red";
}

const colorMap = {
  blue:  { bar: "bg-blue-600",    value: "text-slate-800" },
  gold:  { bar: "bg-amber-500",   value: "text-slate-800" },
  green: { bar: "bg-emerald-600", value: "text-slate-800" },
  red:   { bar: "bg-rose-500",    value: "text-slate-800" },
};

export default function StatCard({ title, value, sub, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className={`h-1 w-full ${c.bar}`} />
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${c.value} truncate`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">{sub}</p>}
      </div>
    </div>
  );
}