"use client";

import { useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const startRank = (page - 1) * pageSize + 1;
  const normalizedQuery = query.trim().toLowerCase();

  const visibleIndustries = useMemo(
    () =>
      industries.filter((ind) =>
        normalizedQuery ? ind.name.toLowerCase().includes(normalizedQuery) : true
      ),
    [industries, normalizedQuery]
  );

  const visibleTotal = visibleIndustries.reduce((s, ind) => s + ind.count, 0);
  const maxCount = Math.max(...visibleIndustries.map((ind) => ind.count), 1);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <BarChartCard
          title="Top 15 Industries"
          data={top15}
          color="#1E4841"
          horizontal
          maxItems={15}
          dashboardStyle
          dashboardVariant="focus"
          className="xl:col-span-2"
        />
        <PieChartCard title="Industry Distribution" data={top15} maxItems={8} />
      </div>

      <div className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="whitespace-nowrap text-[17px] font-semibold text-[#24302C]">
            All Industries ({total.toLocaleString()})
          </h3>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <span className="text-xs text-[#6B726F]">
              Page {page} of {totalPages}
            </span>
            <label className="relative w-full sm:w-[260px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#6B726F]">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search industry"
                className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] pr-3 pl-9 text-sm text-[#24302C] outline-none placeholder:text-[#6B726F] focus:border-[#1E4841]"
              />
            </label>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead>
              <tr className="bg-[#ECF4E9]">
                <th className="w-[72px] rounded-l-md px-4 py-3 font-medium text-[#6B726F]">
                  #
                </th>
                <th className="px-4 py-3 font-medium text-[#6B726F]">Industry</th>
                <th className="w-[120px] px-4 py-3 text-right font-medium text-[#6B726F]">
                  Jobs
                </th>
                <th className="w-[240px] rounded-r-md px-4 py-3 font-medium text-[#6B726F]">
                  Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8E6]">
              {visibleIndustries.map((ind, i) => {
                const pct = visibleTotal > 0 ? ((ind.count / visibleTotal) * 100).toFixed(1) : "0.0";
                const barWidth = Math.max(6, Math.min(100, (ind.count / maxCount) * 100));
                return (
                  <tr key={ind.name}>
                    <td className="px-4 py-4 text-[#6B726F]">{startRank + i}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BBF49C] text-xs font-semibold text-[#1E4841]">
                          {getIndustryAbbr(ind.name)}
                        </span>
                        <span className="font-medium text-[#24302C]">{ind.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-[#24302C]">
                      {ind.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="ml-auto w-[184px]">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#6B726F]">Share</span>
                          <span className="text-[11px] font-semibold text-[#24302C]">{pct}%</span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-[4px]">
                          <div className="bg-[#1E4841]" style={{ width: `${barWidth}%` }} />
                          <div className="bg-[#BBF49C]" style={{ width: `${100 - barWidth}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {visibleIndustries.map((ind, i) => {
            const pct = visibleTotal > 0 ? ((ind.count / visibleTotal) * 100).toFixed(1) : "0.0";
            const barWidth = Math.max(6, Math.min(100, (ind.count / maxCount) * 100));
            return (
              <div key={ind.name} className="rounded-xl border border-[#E4E8E6] p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BBF49C] text-xs font-semibold text-[#1E4841]">
                      {getIndustryAbbr(ind.name)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#24302C]">{ind.name}</p>
                      <p className="text-xs text-[#6B726F]">#{startRank + i}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#24302C]">{pct}%</span>
                </div>
                <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-[4px]">
                  <div className="bg-[#1E4841]" style={{ width: `${barWidth}%` }} />
                  <div className="bg-[#BBF49C]" style={{ width: `${100 - barWidth}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B726F]">Jobs</span>
                  <span className="font-semibold text-[#24302C]">
                    {ind.count.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {visibleIndustries.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[#E4E8E6] p-4 text-sm text-[#6B726F]">
            No industries found on this page for that search.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} basePath="/industry" theme="fields" />
      </div>
    </div>
  );
}

function getIndustryAbbr(name: string) {
  const words = name.split(/[ /-]+/).filter(Boolean);
  if (words.length === 0) return "I";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
