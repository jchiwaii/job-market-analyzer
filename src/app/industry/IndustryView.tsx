"use client";

import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import Pagination from "@/components/Pagination";

interface Props {
  industries: { name: string; count: number }[];
  top15: { name: string; count: number }[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export default function IndustryView({
  industries,
  top15,
  page,
  totalPages,
  total,
  pageSize,
}: Props) {
  const startRank = (page - 1) * pageSize + 1;
  const grandTotal = industries.reduce((s, ind) => s + ind.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Top 15 Industries"
          data={top15}
          color="#0d9488"
          horizontal
          maxItems={15}
        />
        <PieChartCard title="Industry Distribution" data={top15} maxItems={8} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            All Industries ({total.toLocaleString()})
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
                <th className="pb-3 pr-4 font-medium text-zinc-500">Industry</th>
                <th className="pb-3 font-medium text-zinc-500 text-right">Jobs</th>
                <th className="pb-3 pl-4 font-medium text-zinc-500 text-right">Share</th>
              </tr>
            </thead>
            <tbody>
              {industries.map((ind, i) => {
                const pct = grandTotal > 0
                  ? ((ind.count / grandTotal) * 100).toFixed(1)
                  : "0.0";
                return (
                  <tr key={ind.name} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2.5 pr-4 text-zinc-400">{startRank + i}</td>
                    <td className="py-2.5 pr-4 font-medium">{ind.name}</td>
                    <td className="py-2.5 text-right">{ind.count.toLocaleString()}</td>
                    <td className="py-2.5 pl-4 text-right text-zinc-500">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} basePath="/industry" />
      </div>
    </div>
  );
}
