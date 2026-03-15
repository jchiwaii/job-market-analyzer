"use client";

import BarChartCard from "@/components/charts/BarChartCard";
import Pagination from "@/components/Pagination";
import type { CompanyRow } from "./page";

interface Props {
  companies: CompanyRow[];
  top15: { name: string; count: number }[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export default function CompaniesView({
  companies,
  top15,
  page,
  totalPages,
  total,
  pageSize,
}: Props) {
  const startRank = (page - 1) * pageSize + 1;

  const chartData = top15.map((c) => ({
    name: c.name.length > 30 ? c.name.slice(0, 30) + "…" : c.name,
    count: c.count,
  }));

  return (
    <div className="space-y-6">
      <BarChartCard
        title="Top 15 Hiring Companies"
        data={chartData}
        color="#7c3aed"
        horizontal
        maxItems={15}
      />

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            All Companies ({total.toLocaleString()})
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
                <th className="pb-3 pr-4 font-medium text-zinc-500">Company</th>
                <th className="pb-3 pr-4 font-medium text-zinc-500 text-right">Jobs</th>
                <th className="pb-3 pr-4 font-medium text-zinc-500">Fields</th>
                <th className="pb-3 pr-4 font-medium text-zinc-500">Locations</th>
                <th className="pb-3 font-medium text-zinc-500">Active</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr
                  key={c.name}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >
                  <td className="py-2.5 pr-4 text-zinc-400">{startRank + i}</td>
                  <td className="py-2.5 pr-4 font-medium">{c.name}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                      {c.count}
                    </span>
                  </td>
                  <td className="max-w-xs truncate py-2.5 pr-4 text-xs text-zinc-500">
                    {c.fields || "N/A"}
                  </td>
                  <td className="max-w-xs truncate py-2.5 pr-4 text-xs text-zinc-500">
                    {c.locations || "N/A"}
                  </td>
                  <td className="py-2.5 text-xs text-zinc-500">
                    {c.firstPosted === c.lastPosted
                      ? c.firstPosted || "N/A"
                      : `${c.firstPosted ?? "?"} — ${c.lastPosted ?? "?"}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} basePath="/companies" />
      </div>
    </div>
  );
}
