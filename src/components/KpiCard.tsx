interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  accent?: "emerald" | "blue" | "amber" | "rose";
}

function JobsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="4.5" width="12" height="8.5" rx="1.75" />
      <path d="M5.5 4.5v-1A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v1" />
      <path d="M2 8h12" />
    </svg>
  );
}

function CompaniesIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M2.5 13.5h11" />
      <rect x="3.5" y="3" width="4.5" height="10.5" rx="0.75" />
      <rect x="8.75" y="5" width="3.75" height="8.5" rx="0.75" />
      <path d="M5.25 5.25h1M5.25 7.5h1M5.25 9.75h1" />
    </svg>
  );
}

function FieldsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M2.25 5.25 8 2.5l5.75 2.75L8 8 2.25 5.25Z" />
      <path d="M2.75 8.1 8 10.6l5.25-2.5" />
      <path d="M2.75 10.75 8 13.25l5.25-2.5" />
    </svg>
  );
}

function LocationsIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M8 14s4-3.7 4-7A4 4 0 1 0 4 7c0 3.3 4 7 4 7Z" />
      <circle cx="8" cy="7" r="1.5" />
    </svg>
  );
}

const accentStyles = {
  emerald: {
    iconBg: "bg-[#ecf4ea]",
    iconText: "text-[#1e4841]",
    valueText: "text-[#1e4841]",
    icon: JobsIcon,
  },
  blue: {
    iconBg: "bg-[#eaf1f8]",
    iconText: "text-[#2f5f90]",
    valueText: "text-[#2f5f90]",
    icon: CompaniesIcon,
  },
  amber: {
    iconBg: "bg-[#fbf3e8]",
    iconText: "text-[#9f6a1f]",
    valueText: "text-[#9f6a1f]",
    icon: FieldsIcon,
  },
  rose: {
    iconBg: "bg-[#fbecee]",
    iconText: "text-[#b2435c]",
    valueText: "text-[#b2435c]",
    icon: LocationsIcon,
  },
};

export default function KpiCard({
  title,
  value,
  subtitle,
  description,
  accent = "emerald",
}: KpiCardProps) {
  const styles = accentStyles[accent];
  const Icon = styles.icon;

  return (
    <div className="rounded-2xl border border-[#e4e8e6] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${styles.iconBg} ${styles.iconText}`}>
          <Icon />
        </span>
        <span className="inline-flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#aeb7b4]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#aeb7b4]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#aeb7b4]" />
        </span>
      </div>

      <p className={`text-[28px] font-bold leading-none tracking-tight sm:text-[32px] ${styles.valueText}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>

      <p className="mt-3 text-sm font-semibold text-[#26312f]">{title}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-[#6e7875]">{subtitle}</p>
      )}
      {description && (
        <p className="mt-2 text-xs font-medium leading-relaxed text-[#5F6A67]">{description}</p>
      )}
    </div>
  );
}
