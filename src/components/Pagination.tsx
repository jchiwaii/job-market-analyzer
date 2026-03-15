"use client";

import { useRouter } from "next/navigation";

interface Props {
  page: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ page, totalPages, basePath }: Props) {
  const router = useRouter();

  const go = (p: number) => router.push(`${basePath}?page=${p}`);

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

  return (
    <div className="mt-4 flex items-center justify-between gap-2">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-emerald-600 text-white"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Next →
      </button>
    </div>
  );
}
