"use client";

import BarChartCard from "@/components/charts/BarChartCard";

interface Props {
  monthly: { period: string; count: number }[];
  totalJobs: number;
  jobsWithDates: number;
}

export default function TrendsCharts({ monthly, totalJobs, jobsWithDates }: Props) {
  const peak = Math.max(0, ...monthly.map((d) => d.count));
  const peakMonth = monthly.find((d) => d.count === peak)?.period ?? "—";
  const avgPerMonth = monthly.length
    ? Math.round(jobsWithDates / monthly.length)
    : 0;

  const barData = monthly.map((d) => ({ name: d.period, count: d.count }));

  return (
    <div className="space-y-6">
      <BarChartCard title="Jobs Posted per Month" data={barData} color="#059669" maxItems={barData.length} />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Months of Data" value={monthly.length} />
          <Stat label="Jobs with Dates" value={jobsWithDates.toLocaleString()} />
          <Stat label="Avg per Month" value={avgPerMonth.toLocaleString()} />
          <Stat label={`Peak (${peakMonth})`} value={peak.toLocaleString()} />
        </div>
        <p className="mt-4 text-xs text-zinc-400">
          {(totalJobs - jobsWithDates).toLocaleString()} of {totalJobs.toLocaleString()} total jobs are archived listings without a recorded post date and are excluded from this chart.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-xl font-bold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
