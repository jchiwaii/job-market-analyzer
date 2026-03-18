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
  const safeTotalPages = Math.max(1, totalPages);

  if (safeTotalPages <= 1) {
    return null;
  }

  const go = (p: number) => {
    const targetPage = Math.min(Math.max(1, p), safeTotalPages);
    const sp = new URLSearchParams();
    Object.entries(queryParams ?? {}).forEach(([key, value]) => {
      if (value) sp.set(key, value);
    });
    if (targetPage > 1) sp.set("page", String(targetPage));
    router.push(`${basePath}${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  const pages: number[] = [];
  if (safeTotalPages <= 7) {
    for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
  } else if (page <= 4) {
    for (let i = 1; i <= 7; i++) pages.push(i);
  } else if (page >= safeTotalPages - 3) {
    for (let i = Math.max(1, safeTotalPages - 6); i <= safeTotalPages; i++) pages.push(i);
  } else {
    for (let i = page - 3; i <= page + 3; i++) pages.push(i);
  }

  const isFieldsTheme = theme === "fields";
  const navButtonClass = isFieldsTheme
    ? "inline-flex items-center justify-center rounded-lg border border-[#1E4841] bg-[#1E4841] px-3 py-1.5 text-xs font-semibold text-[#ECF4E9] transition-colors hover:bg-[#173832] sm:px-4 sm:py-2 sm:text-sm disabled:cursor-not-allowed disabled:border-[#D9E2D7] disabled:bg-[#ECF4E9] disabled:text-[#9AA6A2] disabled:opacity-100"
    : "inline-flex items-center justify-center rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 sm:px-4 sm:py-2 sm:text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800";
  const pageButtonBaseClass = isFieldsTheme
    ? "h-7 w-7 rounded-lg text-xs font-semibold transition-colors text-[#36514B] hover:bg-[#ECF4E9] sm:h-8 sm:w-8 sm:text-sm"
    : "h-7 w-7 rounded-lg text-xs font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 sm:h-8 sm:w-8 sm:text-sm";
  const activePageClass = isFieldsTheme ? "bg-[#1E4841] text-white" : "bg-emerald-600 text-white";

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="order-2 grid grid-cols-2 gap-2 sm:order-1 sm:flex sm:items-center sm:gap-2">
          <button
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            className={navButtonClass}
          >
            <span className="sm:hidden">Prev</span>
            <span className="hidden sm:inline">← Previous</span>
          </button>
          <button
            onClick={() => go(page + 1)}
            disabled={page >= safeTotalPages}
            className={navButtonClass}
          >
            <span className="sm:hidden">Next</span>
            <span className="hidden sm:inline">Next →</span>
          </button>
        </div>

        <div className="order-1 flex items-center justify-center sm:order-2">
          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-[#E4E8E6] bg-[#FBFCFB] px-2 py-1">
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
        </div>
      </div>
    </div>
  );
}
