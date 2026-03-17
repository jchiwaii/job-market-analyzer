import { getDb } from "@/lib/db";
import IndustryView from "./IndustryView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function getIndustryData(page: number) {
  const db = getDb();
  const offset = (page - 1) * PAGE_SIZE;

  const total = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT industry) as c FROM jobs WHERE industry IS NOT NULL AND industry <> ''"
      )
      .get() as { c: number }
  ).c;

  const industries = db
    .prepare(
      `SELECT industry as name, COUNT(*) as count
       FROM jobs WHERE industry IS NOT NULL AND industry <> ''
       GROUP BY industry ORDER BY count DESC
       LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    )
    .all() as { name: string; count: number }[];

  const top15 = db
    .prepare(
      `SELECT industry as name, COUNT(*) as count
       FROM jobs WHERE industry IS NOT NULL AND industry <> ''
       GROUP BY industry ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number }[];

  const totalIndustryJobs = (
    db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE industry IS NOT NULL AND industry <> ''")
      .get() as { c: number }
  ).c;

  return { industries, top15, total, totalPages: Math.ceil(total / PAGE_SIZE), totalIndustryJobs };
}

export default async function IndustryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const { industries, top15, total, totalPages, totalIndustryJobs } = getIndustryData(page);

  const leadingPct = totalIndustryJobs > 0 && top15[0] ? Math.round((top15[0].count / totalIndustryJobs) * 100) : 0;
  const top3Sum = top15.slice(0, 3).reduce((s, r) => s + r.count, 0);
  const top3Pct = totalIndustryJobs > 0 ? Math.round((top3Sum / totalIndustryJobs) * 100) : 0;
  const avgJobsPerIndustry = total > 0 ? Math.round(totalIndustryJobs / total) : 0;
  const summaryCards: {
    title: string;
    value: string;
    subtitle?: string;
    tone: string;
  }[] = [
    {
      title: "Unique Industries",
      value: total.toLocaleString(),
      tone: "text-[#1E4841] bg-[#ECF4E9] border-[#D9E2D7]",
    },
    {
      title: "Leading Industry",
      value: top15[0]?.name ?? "—",
      subtitle: `${leadingPct}% of industry-tagged jobs`,
      tone: "text-[#2F5F90] bg-[#EAF1F8] border-[#D6E1EE]",
    },
    {
      title: "Top 3 Market Share",
      value: `${top3Pct}%`,
      subtitle: "of jobs concentrated in top 3 industries",
      tone: "text-[#9F6A1F] bg-[#FBF3E8] border-[#F0DFCA]",
    },
    {
      title: "Avg Jobs per Industry",
      value: avgJobsPerIndustry.toLocaleString(),
      subtitle: "across all industries",
      tone: "text-[#7F4A83] bg-[#F5ECF7] border-[#E8D7EC]",
    },
  ];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          Industry
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6E7875]">
          {total.toLocaleString()} unique industries in the Kenyan job market
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${card.tone}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {card.title}
            </p>
            <p className="mt-2 break-words text-lg font-semibold leading-snug">
              {card.value}
            </p>
            {card.subtitle && (
              <p className="mt-1 text-xs font-medium opacity-85">{card.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      <IndustryView
        industries={industries}
        top15={top15}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
