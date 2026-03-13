"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
    router.push(`/jobs?${sp.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ q: search || undefined, field: currentField, location: currentLocation });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <form onSubmit={handleSearch} className="flex-1">
          <label className="text-xs font-medium text-zinc-500">Search</label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or company..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Search
            </button>
          </div>
        </form>

        <div>
          <label className="text-xs font-medium text-zinc-500">Field</label>
          <select
            value={currentField || ""}
            onChange={(e) =>
              navigate({
                field: e.target.value || undefined,
                location: currentLocation,
                q: search || undefined,
              })
            }
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 sm:w-48"
          >
            <option value="">All Fields</option>
            {allFields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-500">Location</label>
          <select
            value={currentLocation || ""}
            onChange={(e) =>
              navigate({
                location: e.target.value || undefined,
                field: currentField,
                q: search || undefined,
              })
            }
            className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 sm:w-48"
          >
            <option value="">All Locations</option>
            {allLocations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-3 font-medium text-zinc-500">Title</th>
                <th className="px-4 py-3 font-medium text-zinc-500">
                  Company
                </th>
                <th className="px-4 py-3 font-medium text-zinc-500">Field</th>
                <th className="px-4 py-3 font-medium text-zinc-500">
                  Location
                </th>
                <th className="px-4 py-3 font-medium text-zinc-500">Type</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Posted</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="max-w-xs px-4 py-3">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      {job.title}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {job.company || "—"}
                  </td>
                  <td className="max-w-[150px] truncate px-4 py-3 text-xs text-zinc-500">
                    {job.field || "—"}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-xs text-zinc-500">
                    {job.location || "—"}
                  </td>
                  <td className="px-4 py-3">
                    {job.job_type ? (
                      <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {job.job_type}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                    {job.posted_date || "—"}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    No jobs found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
            {total.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() =>
                navigate({
                  page: String(page - 1),
                  field: currentField,
                  location: currentLocation,
                  q: search || undefined,
                })
              }
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
            >
              Previous
            </button>
            <span className="flex items-center text-xs text-zinc-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() =>
                navigate({
                  page: String(page + 1),
                  field: currentField,
                  location: currentLocation,
                  q: search || undefined,
                })
              }
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
