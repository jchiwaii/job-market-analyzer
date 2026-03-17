"use client";

import { useMemo, useState } from "react";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import Pagination from "@/components/Pagination";
import ChartErrorBoundary from "@/components/ChartErrorBoundary";

interface Props {
  fields: { name: string; count: number }[];
  top15: { name: string; count: number }[];
  qualifications: { name: string; count: number }[];
  jobTypes: { name: string; count: number }[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export default function FieldsView({
  fields,
  top15,
  qualifications,
  jobTypes,
  page,
  totalPages,
  total,
  pageSize,
}: Props) {
  const [query, setQuery] = useState("");
  const startRank = (page - 1) * pageSize + 1;
  const grandTotal = fields.reduce((s, f) => s + f.count, 0);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleFields = useMemo(
    () =>
      fields.filter((f) =>
        normalizedQuery ? f.name.toLowerCase().includes(normalizedQuery) : true
      ),
    [fields, normalizedQuery]
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      <ChartErrorBoundary>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <BarChartCard
            title="Top 15 Fields"
            data={top15}
            color="#1E4841"
            horizontal
            maxItems={15}
            dashboardStyle
            dashboardVariant="focus"
            className="xl:col-span-2"
          />
          <PieChartCard
            title="Field Distribution"
            data={top15}
            note="A few fields are doing most of the heavy lifting. If you're in Sales, Finance, or IT — there's a lot of competition, but also a lot of opportunity."
            miniTrendData={getMiniTrendData(top15).map((field) => ({
              name: field.name,
              value: field.count,
            }))}
          />
          <BarChartCard
            title="By Qualification"
            data={qualifications}
            color="#2F5F90"
            horizontal
            maxItems={10}
            dashboardStyle
            className="xl:col-span-2"
          />
          <BarChartCard
            title="By Job Type"
            data={jobTypes}
            color="#9F6A1F"
            horizontal
            maxItems={10}
            dashboardStyle
          />
        </div>
      </ChartErrorBoundary>

      <div className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-[17px] font-semibold text-[#24302C]">
            All Fields ({total.toLocaleString()})
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
                placeholder="Search field"
                className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] pr-3 pl-9 text-sm text-[#24302C] outline-none placeholder:text-[#6B726F] focus:border-[#1E4841]"
              />
            </label>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="bg-[#ECF4E9]">
                <th className="w-[72px] rounded-l-md px-4 py-3 font-medium text-[#6B726F]">
                  #
                </th>
                <th className="px-4 py-3 font-medium text-[#6B726F]">Field</th>
                <th className="px-4 py-3 text-right font-medium text-[#6B726F]">Jobs</th>
                <th className="rounded-r-md px-4 py-3 text-right font-medium text-[#6B726F]">
                  Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8E6]">
              {visibleFields.map((f, i) => {
                const pct =
                  grandTotal > 0 ? ((f.count / grandTotal) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={f.name}>
                    <td className="px-4 py-4 text-[#6B726F]">{startRank + i}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BBF49C] text-xs font-semibold text-[#1E4841]">
                          {getFieldAbbr(f.name)}
                        </span>
                        <span className="font-medium text-[#24302C]">{f.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-[#24302C]">
                      {f.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center rounded-md bg-[#1E4841] px-2.5 py-1 text-xs font-semibold text-[#BBF49C]">
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {visibleFields.map((f, i) => {
            const pct =
              grandTotal > 0 ? ((f.count / grandTotal) * 100).toFixed(1) : "0.0";

            return (
              <div key={f.name} className="rounded-xl border border-[#E4E8E6] p-3">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BBF49C] text-xs font-semibold text-[#1E4841]">
                      {getFieldAbbr(f.name)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#24302C]">{f.name}</p>
                      <p className="text-xs text-[#6B726F]">#{startRank + i}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-[#1E4841] px-2 py-1 text-xs font-semibold text-[#BBF49C]">
                    {pct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B726F]">Jobs</span>
                  <span className="font-semibold text-[#24302C]">
                    {f.count.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {visibleFields.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[#E4E8E6] p-4 text-sm text-[#6B726F]">
            No fields found on this page for that search.
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} basePath="/fields" theme="fields" />
      </div>
    </div>
  );
}

function getFieldAbbr(name: string) {
  const words = name.split(/[ /-]+/).filter(Boolean);
  if (words.length === 0) return "F";
  if (words.length === 1) return words[0].slice(0, 1).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function getMiniTrendData(top15: { name: string; count: number }[]) {
  const firstSeven = top15.slice(0, 7);
  const ictCandidate = top15.find((field) => {
    const name = field.name.toLowerCase();
    return /\bict\b/.test(name) || name.includes("computer") || name.includes("information technology");
  });

  if (!ictCandidate) return firstSeven;
  if (firstSeven.some((field) => field.name === ictCandidate.name)) return firstSeven;

  return [...firstSeven.slice(0, 6), ictCandidate];
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
