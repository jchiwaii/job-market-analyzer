"use client";

import { useMemo, useState } from "react";
import BarChartCard from "@/components/charts/BarChartCard";
import Pagination from "@/components/Pagination";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";
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
  const [query, setQuery] = useState("");
  const startRank = (page - 1) * pageSize + 1;
  const normalizedQuery = query.trim().toLowerCase();

  const visibleCompanies = useMemo(
    () =>
      companies.filter((c) =>
        normalizedQuery ? c.name.toLowerCase().includes(normalizedQuery) : true
      ),
    [companies, normalizedQuery]
  );

  const chartData = top15.map((c) => ({
    name: c.name.length > 30 ? c.name.slice(0, 30) + "…" : c.name,
    count: c.count,
  }));

  return (
    <div className="space-y-5 sm:space-y-6">
      <ChartErrorBoundary>
        <BarChartCard
          title="Top 15 Hiring Companies"
          data={chartData}
          color="#2F5F90"
          horizontal
          maxItems={15}
          dashboardStyle
          dashboardVariant="focus"
        />
      </ChartErrorBoundary>

      <div className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-[17px] font-semibold text-[#24302C] sm:whitespace-nowrap">
            All Companies ({total.toLocaleString()})
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
                placeholder="Search company"
                className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] pr-3 pl-9 text-sm text-[#24302C] outline-none placeholder:text-[#6B726F] focus:border-[#1E4841]"
              />
            </label>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="bg-[#ECF4E9]">
                <th className="w-[72px] rounded-l-md px-4 py-3 font-medium text-[#6B726F]">
                  #
                </th>
                <th className="px-4 py-3 font-medium text-[#6B726F]">Company</th>
                <th className="w-[120px] px-4 py-3 text-right font-medium text-[#6B726F]">
                  Jobs
                </th>
                <th className="w-[220px] px-4 py-3 font-medium text-[#6B726F]">Fields</th>
                <th className="w-[220px] px-4 py-3 font-medium text-[#6B726F]">Locations</th>
                <th className="w-[170px] rounded-r-md px-4 py-3 font-medium text-[#6B726F]">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8E6]">
              {visibleCompanies.map((c, i) => (
                <tr key={c.name}>
                  <td className="px-4 py-4 text-[#6B726F]">{startRank + i}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BBF49C] text-xs font-semibold text-[#1E4841]">
                        {getCompanyAbbr(c.name)}
                      </span>
                      <span className="font-medium text-[#24302C]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center rounded-md bg-[#1E4841] px-2.5 py-1 text-xs font-semibold text-[#BBF49C]">
                      {c.count.toLocaleString()}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-4 text-xs text-[#6B726F]">
                    {c.fields || "N/A"}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-4 text-xs text-[#6B726F]">
                    {c.locations || "N/A"}
                  </td>
                  <td className="px-4 py-4 text-xs text-[#6B726F]">
                    {c.firstPosted === c.lastPosted
                      ? c.firstPosted || "N/A"
                      : `${c.firstPosted ?? "?"} — ${c.lastPosted ?? "?"}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {visibleCompanies.map((c, i) => (
            <div key={c.name} className="rounded-xl border border-[#E4E8E6] p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BBF49C] text-xs font-semibold text-[#1E4841]">
                    {getCompanyAbbr(c.name)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#24302C]">{c.name}</p>
                    <p className="text-xs text-[#6B726F]">#{startRank + i}</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-md bg-[#1E4841] px-2 py-1 text-xs font-semibold text-[#BBF49C]">
                  {c.count.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <p className="truncate text-[#6B726F]">
                  <span className="font-semibold text-[#24302C]">Fields:</span>{" "}
                  {c.fields || "N/A"}
                </p>
                <p className="truncate text-[#6B726F]">
                  <span className="font-semibold text-[#24302C]">Locations:</span>{" "}
                  {c.locations || "N/A"}
                </p>
                <p className="text-[#6B726F]">
                  <span className="font-semibold text-[#24302C]">Active:</span>{" "}
                  {c.firstPosted === c.lastPosted
                    ? c.firstPosted || "N/A"
                    : `${c.firstPosted ?? "?"} — ${c.lastPosted ?? "?"}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {visibleCompanies.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[#E4E8E6] p-4 text-sm text-[#6B726F]">
            No companies found on this page for that search.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} basePath="/companies" theme="fields" />
      </div>
    </div>
  );
}

function getCompanyAbbr(name: string) {
  const words = name.split(/[ /-]+/).filter(Boolean);
  if (words.length === 0) return "C";
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
