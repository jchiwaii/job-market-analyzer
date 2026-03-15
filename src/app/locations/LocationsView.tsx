"use client";

import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import Pagination from "@/components/Pagination";

interface Props {
  locations: { name: string; count: number }[];
  top15: { name: string; count: number }[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  nairobiCount: number;
  totalWithLocation: number;
}

export default function LocationsView({
  locations,
  top15,
  page,
  totalPages,
  total,
  pageSize,
  nairobiCount,
  totalWithLocation,
}: Props) {
  const startRank = (page - 1) * pageSize + 1;
  const grandTotal = locations.reduce((s, l) => s + l.count, 0);
  const maxCount = top15[0]?.count ?? 1;
  const nairobiPct = ((nairobiCount / totalWithLocation) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Nairobi callout */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            #1
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Nairobi dominates at{" "}
              <span className="text-blue-700 dark:text-blue-300">
                {nairobiCount.toLocaleString()} jobs
              </span>{" "}
              ({nairobiPct}% of all located jobs).
            </p>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              The chart below shows all other locations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Top 15 Locations (Excluding Nairobi)"
          data={top15}
          color="#0284c7"
          horizontal
          maxItems={15}
        />
        <PieChartCard
          title="Location Distribution (Excluding Nairobi)"
          data={top15}
          maxItems={10}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            All Locations Excluding Nairobi ({total.toLocaleString()})
          </h3>
          <span className="text-xs text-zinc-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="pb-3 pr-4 font-medium text-zinc-500">#</th>
                <th className="pb-3 pr-4 font-medium text-zinc-500">Location</th>
                <th className="pb-3 font-medium text-zinc-500 text-right">Jobs</th>
                <th className="pb-3 pl-4 font-medium text-zinc-500 text-right">Share</th>
                <th className="pb-3 pl-4 font-medium text-zinc-500" />
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, i) => {
                const pct = ((loc.count / grandTotal) * 100).toFixed(1);
                const barWidth = (loc.count / maxCount) * 100;
                return (
                  <tr key={loc.name} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2.5 pr-4 text-zinc-400">{startRank + i}</td>
                    <td className="py-2.5 pr-4 font-medium">{loc.name}</td>
                    <td className="py-2.5 text-right">{loc.count}</td>
                    <td className="py-2.5 pl-4 text-right text-zinc-500">{pct}%</td>
                    <td className="w-32 py-2.5 pl-4">
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${barWidth}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} basePath="/locations" />
      </div>
    </div>
  );
}
