"use client";

import { useId } from "react";
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
  note?: string;
  miniTrendData?: { name: string; value: number }[];
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
    <div className="w-[178px] rounded-xl border border-[#CBD6D2] bg-white px-3.5 py-3 shadow-[0_12px_26px_rgba(15,23,20,0.14)] ring-1 ring-black/5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full border border-[#C7CFCC]"
            style={{ backgroundColor: row.color }}
          />
          <p className="truncate text-xs font-semibold text-[#24302C]">{row.name}</p>
        </div>
        <span className="rounded-md bg-[#ECF4E9] px-1.5 py-0.5 text-[10px] font-semibold text-[#1E4841]">
          {row.percent}%
        </span>
      </div>

      <div className="rounded-lg border border-[#E4E8E6] bg-[#F8FBF9] px-2.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#6B726F]">Jobs</span>
          <span className="text-sm font-semibold text-[#24302C]">{formatNumber(value)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#6B726F]">Share</span>
          <span className="text-xs font-semibold text-[#24302C]">{row.percent}%</span>
        </div>
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
  note,
  miniTrendData,
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
              <Tooltip
                cursor={false}
                content={<PieCardTooltip />}
                wrapperStyle={{ outline: "none", zIndex: 30 }}
              />
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

      {note && (
        <p className="mt-3 text-xs font-medium leading-relaxed text-[#5F6A67]">{note}</p>
      )}

      {miniTrendData && miniTrendData.length > 1 && (
        <MiniVerticalBarsChart data={miniTrendData} />
      )}
    </section>
  );
}

function MiniVerticalBarsChart({ data }: { data: { name: string; value: number }[] }) {
  const width = 529;
  const topPad = 24;
  const xPad = 18;
  const barGap = data.length > 5 ? 10 : 14;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartW = width - xPad * 2;
  const barWidth = Math.max(
    18,
    Math.floor((chartW - barGap * (data.length - 1)) / data.length)
  );
  const maxCharsPerLine = Math.max(8, Math.floor(barWidth / 6));
  const labelLines = data.map((d) => wrapLabel(d.name, maxCharsPerLine));
  const maxLabelLines = Math.max(...labelLines.map((lines) => lines.length), 1);
  const bottomPad = 18 + maxLabelLines * 10;
  const height = 170 + maxLabelLines * 10;
  const baselineY = height - bottomPad;
  const chartH = baselineY - topPad;
  const focusIndexFromIct = data.findIndex((d) => {
    const name = d.name.toLowerCase();
    return /\bict\b/.test(name) || name.includes("computer") || name.includes("information technology");
  });
  const focusIndexFromProject = data.findIndex((d) => d.name.toLowerCase().includes("project"));
  const focusIndex =
    focusIndexFromIct >= 0
      ? focusIndexFromIct
      : focusIndexFromProject >= 0
      ? focusIndexFromProject
      : data.findIndex((d) => d.value === maxValue);
  const focusDatum = data[focusIndex];
  const bars = data.map((d, i) => {
    const h = Math.max(8, Math.round((d.value / maxValue) * chartH));
    const x = xPad + i * (barWidth + barGap);
    const y = baselineY - h;
    return { x, y, h, label: d.name, value: d.value };
  });
  const focusBar = bars[focusIndex];
  const tooltipW = 126;
  const tooltipX = Math.max(
    8,
    Math.min(width - tooltipW - 8, focusBar.x + barWidth / 2 - tooltipW / 2)
  );
  const tooltipY = Math.max(6, focusBar.y - 70);
  const gradientId = useId().replace(/:/g, "");

  return (
    <div className="mt-3 rounded-xl border border-[#E4E8E6] bg-[#FBFCFB] p-2.5">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[152px] w-full" fill="none" aria-hidden>
        <defs>
          <linearGradient id={`bar-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E4841" />
            <stop offset="100%" stopColor="#2A6359" />
          </linearGradient>
        </defs>

        <line x1={xPad} y1={baselineY} x2={width - xPad} y2={baselineY} stroke="#D3DDD8" strokeWidth={1.5} />

        {bars.map((bar, i) => {
          const active = i === focusIndex;
          return (
            <g key={`${bar.label}-${i}`}>
              <rect x={bar.x} y={bar.y} width={barWidth} height={bar.h} rx={5} fill="#DCE4E1" />
              <rect
                x={bar.x}
                y={bar.y}
                width={barWidth}
                height={bar.h}
                rx={5}
                fill={active ? `url(#bar-${gradientId})` : "#BBF49C"}
              />
            </g>
          );
        })}

        <rect
          x={focusBar.x + barWidth / 2 - 20}
          y={focusBar.y - 4}
          width={40}
          height={8}
          rx={3}
          fill="#BBF49C"
          stroke="#ECF4E9"
          strokeWidth={2}
        />

        <g>
          <rect
            x={tooltipX}
            y={tooltipY}
            width={tooltipW}
            height={52}
            rx={8}
            fill="#FBFBFC"
            stroke="#E4E8E6"
          />
          <text
            x={tooltipX + tooltipW / 2}
            y={tooltipY + 17}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="#6B726F"
          >
            {focusDatum.name}
          </text>
          <text
            x={tooltipX + tooltipW / 2}
            y={tooltipY + 36}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#24302C"
          >
            {formatNumber(focusDatum.value)} jobs
          </text>
        </g>

        {bars.map((bar, i) => {
          const lines = labelLines[i];
          const startY = baselineY + 14;
          return (
            <g key={`${data[i].name}-${i}`}>
              {lines.map((line, lineIndex) => (
                <text
                  key={`${line}-${lineIndex}`}
                  x={bar.x + barWidth / 2}
                  y={startY + lineIndex * 9}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="500"
                  fill={i === focusIndex ? "#1E4841" : "#6B726F"}
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function wrapLabel(label: string, maxCharsPerLine: number) {
  const words = label.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length === 0) return [label];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (word.length > maxCharsPerLine) {
      if (current) {
        lines.push(current);
        current = "";
      }
      let rest = word;
      while (rest.length > maxCharsPerLine) {
        lines.push(rest.slice(0, maxCharsPerLine));
        rest = rest.slice(maxCharsPerLine);
      }
      if (rest.length > 0) current = rest;
      continue;
    }

    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [label];
}
