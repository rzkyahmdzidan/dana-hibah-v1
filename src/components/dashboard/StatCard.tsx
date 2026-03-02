"use client";

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: "blue" | "gold" | "green" | "red";
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "bg-blue-600 text-white",
    value: "text-blue-900",
  },
  gold: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "bg-amber-500 text-white",
    value: "text-amber-900",
  },
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "bg-emerald-600 text-white",
    value: "text-emerald-900",
  },
  red: {
    bg: "bg-rose-50",
    border: "border-rose-100",
    icon: "bg-rose-600 text-white",
    value: "text-rose-900",
  },
};

export default function StatCard({ title, value, sub, icon, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border} p-5 flex items-start gap-4 shadow-sm`}>
      <div className={`rounded-xl p-3 ${c.icon} shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.value} truncate`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

