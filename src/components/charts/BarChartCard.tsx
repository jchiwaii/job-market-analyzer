"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BarChartCardProps {
  title: string;
  data: { name: string; count: number }[];
  color?: string;
  horizontal?: boolean;
  maxItems?: number;
}

export default function BarChartCard({
  title,
  data,
  color = "#059669",
  horizontal = false,
  maxItems = 10,
}: BarChartCardProps) {
  const sliced = data.slice(0, maxItems);

  if (horizontal) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
        <div style={{ height: Math.max(250, sliced.length * 36) }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={sliced} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={220}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sliced} margin={{ bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e4e4e7",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
