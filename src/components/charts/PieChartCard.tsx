"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#059669", "#0284c7", "#d97706", "#e11d48", "#7c3aed",
  "#0d9488", "#ea580c", "#4f46e5", "#be185d", "#ca8a04",
];

interface PieChartCardProps {
  title: string;
  data: { name: string; count: number }[];
  maxItems?: number;
}

export default function PieChartCard({
  title,
  data,
  maxItems = 8,
}: PieChartCardProps) {
  const sliced = data.slice(0, maxItems);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart>
            <Pie
              data={sliced}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
              nameKey="name"
            >
              {sliced.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e4e4e7",
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) =>
                value.length > 25 ? value.slice(0, 25) + "..." : value
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
