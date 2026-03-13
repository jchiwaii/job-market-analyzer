interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: "emerald" | "blue" | "amber" | "rose";
}

const accentStyles = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function KpiCard({
  title,
  value,
  subtitle,
  accent = "emerald",
}: KpiCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p
        className={`mt-2 text-3xl font-bold tracking-tight ${accentStyles[accent]
          .split(" ")
          .filter((c) => c.startsWith("text-"))
          .join(" ")}`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
