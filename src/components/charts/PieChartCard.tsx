"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const SEGMENT_COLORS = ["#1E4841", "#BBF49C", "#ECF4E9", "#E5E6E6", "#BCC0BE"];

interface PieChartCardProps {
  title: string;
  data: { name: string; count: number }[];
  maxItems?: number;
}

type ChartRow = {
  name: string;
  count: number;
  percent: number;
  color: string;
};

type PieTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    payload?: ChartRow;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function buildRows(data: { name: string; count: number }[], maxItems: number): ChartRow[] {
  const sliced = [...data]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems);
  const total = sliced.reduce((sum, item) => sum + item.count, 0);

  if (!total) {
    return [];
  }

  const rawPercents = sliced.map((item) => (item.count / total) * 100);
  const floored = rawPercents.map((value) => Math.floor(value));
  let remainder = 100 - floored.reduce((sum, value) => sum + value, 0);
  const fractions = rawPercents
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < fractions.length && remainder > 0; i += 1) {
    floored[fractions[i].index] += 1;
    remainder -= 1;
  }

  return sliced.map((item, index) => ({
    name: item.name,
    count: item.count,
    percent: floored[index],
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));
}

function PieCardTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  const value = Number(payload[0]?.value ?? row?.count ?? 0);

  if (!row) {
    return null;
  }

  return (
    <div className="w-[152px] rounded-lg border border-[#D9E2D7] bg-[#FBFBFC] px-3 py-2 shadow-[0_4px_10px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full border border-[#C7CFCC]"
          style={{ backgroundColor: row.color }}
        />
        <p className="truncate text-[11px] font-medium text-[#6B726F]">{row.name}</p>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#6B726F]">Jobs</span>
        <span className="text-sm font-semibold text-[#24302C]">{formatNumber(value)}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#6B726F]">Share</span>
        <span className="text-[11px] font-semibold text-[#24302C]">{row.percent}%</span>
      </div>
    </div>
  );
}

function CenterLabel({ value }: { value: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#6B726F]">
        Total Jobs
      </span>
      <span className="text-2xl font-semibold text-[#1E4841]">{formatNumber(value)}</span>
    </div>
  );
}

export default function PieChartCard({
  title,
  data,
  maxItems = 5,
}: PieChartCardProps) {
  const rows = buildRows(data, maxItems);
  const totalJobs = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <section className="rounded-2xl border border-[#E5E6E6] bg-white p-4">
      <header>
        <h3 className="text-[17px] font-semibold text-[#24302C]">{title}</h3>
      </header>

      {rows.length > 0 ? (
        <div className="relative mt-4 h-[148px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={rows}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={73}
                paddingAngle={2}
                stroke="#FBFBFC"
                strokeWidth={4}
              >
                {rows.map((row) => (
                  <Cell key={row.name} fill={row.color} />
                ))}
              </Pie>
              <Tooltip cursor={false} content={<PieCardTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <CenterLabel value={totalJobs} />
        </div>
      ) : (
        <div className="mt-4 flex h-[148px] items-center justify-center rounded-xl border border-dashed border-[#E5E6E6] text-sm text-[#6B726F]">
          No field data available yet
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-[25px] min-w-[32px] items-center justify-center rounded-lg px-2 text-[11px] font-semibold"
                style={{
                  backgroundColor: row.color,
                  color: row.color === "#1E4841" ? "#ECF4E9" : "#24302C",
                }}
              >
                {row.percent}%
              </div>
              <span className="truncate text-sm font-medium text-[#24302C]">{row.name}</span>
            </div>

            <span className="text-sm font-medium text-[#24302C]">{formatNumber(row.count)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
