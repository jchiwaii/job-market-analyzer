"use client";

import { useRouter } from "next/navigation";

interface Props {
  page: number;
  totalPages: number;
  basePath: string;
  theme?: "default" | "fields";
  queryParams?: Record<string, string | undefined>;
}

export default function Pagination({
  page,
  totalPages,
  basePath,
  theme = "default",
  queryParams,
}: Props) {
  const router = useRouter();

  const go = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(queryParams ?? {}).forEach(([key, value]) => {
      if (value) sp.set(key, value);
    });
    if (p > 1) sp.set("page", String(p));
    router.push(`${basePath}${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  const pages: number[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (page <= 4) {
    for (let i = 1; i <= 7; i++) pages.push(i);
  } else if (page >= totalPages - 3) {
    for (let i = totalPages - 6; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = page - 3; i <= page + 3; i++) pages.push(i);
  }

  const isFieldsTheme = theme === "fields";
  const navButtonClass = isFieldsTheme
    ? "rounded-lg border border-[#1E4841] bg-[#1E4841] px-4 py-2 text-sm font-medium text-[#ECF4E9] transition-colors hover:bg-[#173832] disabled:cursor-not-allowed disabled:border-[#D9E2D7] disabled:bg-[#ECF4E9] disabled:text-[#9AA6A2] disabled:opacity-100"
    : "rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";
  const pageButtonBaseClass = isFieldsTheme
    ? "h-8 w-8 rounded-lg text-sm font-medium transition-colors text-[#36514B] hover:bg-[#ECF4E9]"
    : "h-8 w-8 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400";
  const activePageClass = isFieldsTheme ? "bg-[#1E4841] text-white" : "bg-emerald-600 text-white";

  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={navButtonClass}
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className={`${pageButtonBaseClass} ${p === page ? activePageClass : ""}`.trim()}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className={navButtonClass}
      >
        Next →
      </button>
    </div>
  );
}
