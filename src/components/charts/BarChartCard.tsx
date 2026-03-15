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
  dashboardStyle?: boolean;
  dashboardVariant?: "default" | "focus";
  className?: string;
  note?: string;
}

type DashboardTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    payload?: { name: string; count: number };
  }>;
};

type DashboardYAxisTickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string };
  maxCharsPerLine: number;
  fontSize: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function splitLabelTwoLines(label: string, maxCharsPerLine: number) {
  if (label.length <= maxCharsPerLine) {
    return [label];
  }

  const splitIndex = label.lastIndexOf(" ", maxCharsPerLine);
  const firstLine =
    splitIndex > Math.floor(maxCharsPerLine * 0.45)
      ? label.slice(0, splitIndex)
      : label.slice(0, maxCharsPerLine);

  const restStart =
    splitIndex > Math.floor(maxCharsPerLine * 0.45) ? splitIndex + 1 : maxCharsPerLine;
  const remaining = label.slice(restStart).trim();

  if (remaining.length <= maxCharsPerLine) {
    return [firstLine, remaining];
  }

  return [firstLine, `${remaining.slice(0, Math.max(3, maxCharsPerLine - 1))}...`];
}

function DashboardYAxisTick({
  x = 0,
  y = 0,
  payload,
  maxCharsPerLine,
  fontSize,
}: DashboardYAxisTickProps) {
  const value = payload?.value ?? "";
  const [lineOne, lineTwo] = splitLabelTwoLines(String(value), maxCharsPerLine);
  const initialDy = lineTwo ? "-0.25em" : "0.32em";

  return (
    <text x={x} y={y} textAnchor="end" fill="#24302C" fontSize={fontSize} fontWeight={500}>
      <tspan x={x} dy={initialDy}>
        {lineOne}
      </tspan>
      {lineTwo && (
        <tspan x={x} dy="1.1em">
          {lineTwo}
        </tspan>
      )}
    </text>
  );
}

function DashboardBarTooltip({ active, payload }: DashboardTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0]?.payload;
  const value = Number(payload[0]?.value ?? row?.count ?? 0);

  if (!row) {
    return null;
  }

  return (
    <div className="w-[120px] rounded-lg border border-[#E5E6E6] bg-[#FBFBFC] px-[10px] py-2 shadow-[0_4px_8px_rgba(0,0,0,0.08)]">
      <p className="text-[11px] font-medium leading-tight text-[#6B726F]">{row.name}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[#6B726F]">Jobs</span>
        <span className="text-sm font-semibold text-[#24302C]">{formatNumber(value)}</span>
      </div>
    </div>
  );
}

function getDashboardBarLayout(rowCount: number, isFocusCard: boolean) {
  if (isFocusCard) {
    return { barSize: 18, barCategoryGap: "22%" as const };
  }

  if (rowCount <= 3) {
    return { barSize: 24, barCategoryGap: "10%" as const };
  }

  if (rowCount <= 5) {
    return { barSize: 20, barCategoryGap: "14%" as const };
  }

  if (rowCount <= 7) {
    return { barSize: 17, barCategoryGap: "18%" as const };
  }

  return { barSize: 14, barCategoryGap: "24%" as const };
}

export default function BarChartCard({
  title,
  data,
  color = "#059669",
  horizontal = false,
  maxItems = 10,
  dashboardStyle = false,
  dashboardVariant = "default",
  className = "",
  note,
}: BarChartCardProps) {
  const sliced = [...data]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems);
  const isFocusCard = dashboardStyle && dashboardVariant === "focus";
  const dashboardLayout = getDashboardBarLayout(sliced.length, isFocusCard);

  if (horizontal) {
    if (sliced.length === 0) {
      return (
        <div
          className={`rounded-2xl border border-[#E5E6E6] bg-white p-4 ${className}`.trim()}
        >
          <h3 className="mb-3 text-[17px] font-semibold text-[#24302C]">{title}</h3>
          <div className="flex h-[180px] items-center justify-center rounded-xl border border-dashed border-[#E5E6E6] text-sm text-[#6B726F]">
            No chart data available yet
          </div>
        </div>
      );
    }

    return (
        <div
          className={
            dashboardStyle
              ? `rounded-2xl border border-[#E5E6E6] bg-white p-4 ${className}`.trim()
              : `rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`.trim()
          }
        >
        <h3
          className={
            dashboardStyle
              ? "mb-4 text-[17px] font-semibold text-[#24302C]"
              : "mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
          }
        >
          {title}
        </h3>
        <div
          style={{
            height: Math.max(
              dashboardStyle ? (isFocusCard ? 252 : 223) : 250,
              sliced.length * (dashboardStyle ? (isFocusCard ? 40 : 36) : 36)
            ),
          }}
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={sliced}
              layout="vertical"
              margin={
                dashboardStyle
                  ? { left: 2, right: 10, top: isFocusCard ? 6 : 8, bottom: 6 }
                  : { left: 10, right: 20 }
              }
              barCategoryGap={dashboardStyle ? dashboardLayout.barCategoryGap : undefined}
            >
              <CartesianGrid
                stroke={dashboardStyle ? "#E5E6E6" : undefined}
                strokeDasharray={dashboardStyle ? undefined : "3 3"}
                opacity={dashboardStyle ? 1 : 0.1}
                vertical={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: dashboardStyle ? 10 : 12, fill: dashboardStyle ? "#24302C" : undefined }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={dashboardStyle ? (isFocusCard ? 148 : 134) : 220}
                tick={
                  dashboardStyle
                    ? (
                        <DashboardYAxisTick
                          maxCharsPerLine={isFocusCard ? 20 : 16}
                          fontSize={isFocusCard ? 12 : 11}
                        />
                      )
                    : { fontSize: 11 }
                }
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              {dashboardStyle ? (
                <Tooltip content={<DashboardBarTooltip />} cursor={{ fill: "rgba(187, 244, 156, 0.16)" }} />
              ) : (
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e4e4e7",
                    fontSize: 12,
                  }}
                />
              )}
              <Bar
                dataKey="count"
                fill={color}
                stroke={dashboardStyle && isFocusCard ? "#BBF49C" : "none"}
                strokeWidth={dashboardStyle && isFocusCard ? 1.5 : 0}
                radius={dashboardStyle ? [4, 4, 4, 4] : [0, 4, 4, 0]}
                barSize={dashboardStyle ? dashboardLayout.barSize : undefined}
                background={dashboardStyle ? { fill: "#ECF4E9" } : undefined}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {note && (
          <p className="mt-3 text-xs font-medium leading-relaxed text-[#5F6A67]">{note}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`.trim()}>
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
