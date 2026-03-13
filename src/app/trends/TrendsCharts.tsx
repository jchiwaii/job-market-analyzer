"use client";

import { useState } from "react";
import LineChartCard from "@/components/charts/LineChartCard";

interface Props {
  daily: { period: string; count: number }[];
  weekly: { period: string; count: number }[];
  monthly: { period: string; count: number }[];
}

type View = "daily" | "weekly" | "monthly";

export default function TrendsCharts({ daily, weekly, monthly }: Props) {
  const [view, setView] = useState<View>("daily");

  const datasets: Record<View, { period: string; count: number }[]> = {
    daily,
    weekly,
    monthly,
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["daily", "weekly", "monthly"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              view === v
                ? "bg-emerald-600 text-white"
                : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <LineChartCard
        title={`Jobs Posted (${view})`}
        data={datasets[view]}
        color="#059669"
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Summary Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Total Data Points" value={datasets[view].length} />
          <Stat
            label="Total Jobs"
            value={datasets[view].reduce((s, d) => s + d.count, 0)}
          />
          <Stat
            label="Average per Period"
            value={
              datasets[view].length
                ? Math.round(
                    datasets[view].reduce((s, d) => s + d.count, 0) /
                      datasets[view].length
                  )
                : 0
            }
          />
          <Stat
            label="Peak"
            value={Math.max(0, ...datasets[view].map((d) => d.count))}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
