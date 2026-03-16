"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartCardProps {
  title: string;
  data: { period: string; count: number }[];
  color?: string;
}

export default function LineChartCard({
  title,
  data,
  color = "#059669",
}: LineChartCardProps) {
  return (
    <div className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold text-[#24302C]">{title}</h3>
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#AEB7B4]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#AEB7B4]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#AEB7B4]" />
        </span>
      </div>

      <div className="h-64 sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 24, left: -8 }}>
            <CartesianGrid stroke="#E4E8E6" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fill: "#6E7875", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis
              tick={{ fill: "#6E7875", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #1E4841",
                background: "#1E4841",
                color: "#FBFBFC",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.18)",
                fontSize: 12,
              }}
              labelStyle={{ color: "#BBF49C", marginBottom: 4 }}
              cursor={{ stroke: "#AEB7B4", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, stroke: "#FBFBFC", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: color, stroke: "#FBFBFC", strokeWidth: 2 }}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
