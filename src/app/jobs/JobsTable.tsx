"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/Pagination";
import type { JobItem } from "./page";

interface Props {
  jobs: JobItem[];
  total: number;
  page: number;
  totalPages: number;
  allFields: string[];
  allLocations: string[];
  currentField?: string;
  currentLocation?: string;
  currentSearch?: string;
}

const PAGE_SIZE = 20;

export default function JobsTable({
  jobs,
  total,
  page,
  totalPages,
  allFields,
  allLocations,
  currentField,
  currentLocation,
  currentSearch,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(currentSearch || "");

  function navigate(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.field) sp.set("field", params.field);
    if (params.location) sp.set("location", params.location);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    router.push(`/jobs${sp.toString() ? `?${sp.toString()}` : ""}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({
      q: search || undefined,
      field: currentField,
      location: currentLocation,
      page: "1",
    });
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  const hasFilters = Boolean(currentSearch || currentField || currentLocation);

  return (
    <section className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-[17px] font-semibold text-[#24302C]">
            All Jobs ({total.toLocaleString()})
          </h3>
          <p className="mt-1 text-xs text-[#6B726F]">
            Page {page} of {Math.max(totalPages, 1)}
          </p>
        </div>
        {hasFilters && (
          <button
            onClick={() => navigate({ page: "1" })}
            className="inline-flex h-9 items-center justify-center rounded-full border border-[#E4E8E6] px-4 text-xs font-semibold text-[#36514B] transition-colors hover:bg-[#ECF4E9]"
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px] lg:items-end">
        <form onSubmit={handleSearch}>
          <label className="mb-1 block text-xs font-medium text-[#6B726F]">Search</label>
          <div className="flex gap-2">
            <label className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#6B726F]">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or company"
                className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] pr-3 pl-9 text-sm text-[#24302C] outline-none placeholder:text-[#6B726F] focus:border-[#1E4841]"
              />
            </label>
            <button
              type="submit"
              className="h-9 rounded-full bg-[#1E4841] px-4 text-sm font-semibold text-[#ECF4E9] transition-colors hover:bg-[#173832]"
            >
              Search
            </button>
          </div>
        </form>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#6B726F]">Field</label>
          <select
            value={deriveFieldGroup(currentField) || ""}
            onChange={(e) =>
              navigate({
                field: e.target.value || undefined,
                location: currentLocation,
                q: currentSearch,
                page: "1",
              })
            }
            className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] px-3 text-sm text-[#24302C] outline-none focus:border-[#1E4841]"
          >
            <option value="">All fields</option>
            {allFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#6B726F]">Location</label>
          <select
            value={deriveLocationGroup(currentLocation) || ""}
            onChange={(e) =>
              navigate({
                location: e.target.value || undefined,
                field: currentField,
                q: currentSearch,
                page: "1",
              })
            }
            className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] px-3 text-sm text-[#24302C] outline-none focus:border-[#1E4841]"
          >
            <option value="">All locations</option>
            {allLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead>
            <tr className="bg-[#ECF4E9]">
              <th className="w-[72px] rounded-l-md px-4 py-3 font-medium text-[#6B726F]">#</th>
              <th className="px-4 py-3 font-medium text-[#6B726F]">Title</th>
              <th className="px-4 py-3 font-medium text-[#6B726F]">Company</th>
              <th className="px-4 py-3 font-medium text-[#6B726F]">Field</th>
              <th className="px-4 py-3 font-medium text-[#6B726F]">Location</th>
              <th className="px-4 py-3 font-medium text-[#6B726F]">Type</th>
              <th className="w-[130px] rounded-r-md px-4 py-3 font-medium text-[#6B726F]">
                Posted
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8E6]">
            {jobs.map((job, index) => (
              <tr key={job.id}>
                <td className="px-4 py-4 text-[#6B726F]">{start + index}</td>
                <td className="max-w-[300px] px-4 py-4">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="line-clamp-2 font-medium text-[#1E4841] underline-offset-2 hover:underline"
                  >
                    {job.title}
                  </a>
                </td>
                <td className="max-w-[220px] truncate px-4 py-4 text-[#24302C]">
                  {job.company || "-"}
                </td>
                <td className="max-w-[200px] truncate px-4 py-4 text-xs text-[#6B726F]">
                  {job.field || "-"}
                </td>
                <td className="max-w-[180px] truncate px-4 py-4 text-xs text-[#6B726F]">
                  {job.location || "-"}
                </td>
                <td className="px-4 py-4">
                  {job.job_type ? (
                    <span className="inline-flex rounded-full bg-[#ECF4E9] px-2.5 py-1 text-xs font-semibold text-[#1E4841]">
                      {job.job_type}
                    </span>
                  ) : (
                    <span className="text-xs text-[#9AA6A2]">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-[#6B726F]">
                  {job.posted_date || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {jobs.map((job, index) => (
          <article key={job.id} className="rounded-xl border border-[#E4E8E6] p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#6B726F]">#{start + index}</p>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm font-semibold text-[#1E4841] underline-offset-2 hover:underline"
                >
                  {job.title}
                </a>
              </div>
              <span className="text-xs text-[#6B726F]">{job.posted_date || "-"}</span>
            </div>

            <p className="mb-2 text-xs text-[#24302C]">
              <span className="font-semibold">Company:</span> {job.company || "-"}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F1F0F0] px-2.5 py-1 text-[11px] text-[#6B726F]">
                {job.field || "No field"}
              </span>
              <span className="rounded-full bg-[#F1F0F0] px-2.5 py-1 text-[11px] text-[#6B726F]">
                {job.location || "No location"}
              </span>
              {job.job_type && (
                <span className="rounded-full bg-[#ECF4E9] px-2.5 py-1 text-[11px] font-semibold text-[#1E4841]">
                  {job.job_type}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-[#E4E8E6] p-4 text-sm text-[#6B726F]">
          No jobs found matching your filters.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#6B726F]">
          Showing {start.toLocaleString()}-{end.toLocaleString()} of {total.toLocaleString()}
        </p>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/jobs"
        theme="fields"
        queryParams={{
          q: currentSearch,
          field: currentField,
          location: currentLocation,
        }}
      />
    </section>
  );
}

function deriveFieldGroup(value?: string): string {
  if (!value) return "";
  return value.split(/\s*[\/,]\s*/)[0].trim();
}

const LOCATION_PREFIXES = new Set(["West", "North", "South", "East", "Trans", "Homa", "Taita", "Tharaka"]);

function deriveLocationGroup(value?: string): string {
  if (!value) return "";
  const words = value.split(/\s+/);
  const first = words[0].replace(/[^a-zA-Z0-9]/g, "").trim();
  const second = words[1]?.replace(/[^a-zA-Z0-9]/g, "").trim();
  return LOCATION_PREFIXES.has(first) && second ? `${first} ${second}` : first;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
