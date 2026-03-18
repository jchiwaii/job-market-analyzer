import { queryOne, queryAll } from "@/lib/db";
import IndustryView from "./IndustryView";

export const revalidate = 86400;

const PAGE_SIZE = 10;

async function getIndustryData(page: number) {
  const offset = (page - 1) * PAGE_SIZE;

  const [totalRow, industries, top15, totalIndustryJobsRow] = await Promise.all([
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT industry) as c FROM jobs WHERE industry IS NOT NULL AND industry <> ''"
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT industry as name, COUNT(*) as count
       FROM jobs WHERE industry IS NOT NULL AND industry <> ''
       GROUP BY industry ORDER BY count DESC
       LIMIT :limit OFFSET :offset`,
      { limit: PAGE_SIZE, offset }
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT industry as name, COUNT(*) as count
       FROM jobs WHERE industry IS NOT NULL AND industry <> ''
       GROUP BY industry ORDER BY count DESC LIMIT 15`
    ),
    queryOne<{ c: number }>(
      "SELECT COUNT(*) as c FROM jobs WHERE industry IS NOT NULL AND industry <> ''"
    ),
  ]);

  const total = totalRow?.c ?? 0;
  const totalIndustryJobs = totalIndustryJobsRow?.c ?? 0;

  return {
    industries,
    top15,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    totalIndustryJobs,
  };
}

export default async function IndustryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.min(parseInt(pageParam || "1", 10), 10000));
  const { industries, top15, total, totalPages, totalIndustryJobs } =
    await getIndustryData(page);

  const leadingPct =
    totalIndustryJobs > 0 && top15[0]
      ? Math.round((top15[0].count / totalIndustryJobs) * 100)
      : 0;
  const avgJobsPerIndustry = total > 0 ? Math.round(totalIndustryJobs / total) : 0;
  const summaryCards: {
    title: string;
    value: string;
    subtitle?: string;
    desc?: string;
    tone: string;
  }[] = [
    {
      title: "Unique Industries",
      value: total.toLocaleString(),
      desc: "Distinct industries represented across all job listings",
      tone: "text-[#1E4841] bg-[#ECF4E9] border-[#D9E2D7]",
    },
    {
      title: "Leading Industry",
      value: top15[0]?.name ?? "—",
      subtitle: `${leadingPct}% of industry-tagged jobs`,
      desc: "The single industry with the highest number of job listings",
      tone: "text-[#2F5F90] bg-[#EAF1F8] border-[#D6E1EE]",
    },
    {
      title: "Avg Jobs per Industry",
      value: avgJobsPerIndustry.toLocaleString(),
      subtitle: "across all industries",
      desc: "Average listing count if jobs were evenly spread across every industry",
      tone: "text-[#9F6A1F] bg-[#FBF3E8] border-[#F0DFCA]",
    },
  ];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          Industry
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6E7875]">
          Across {total.toLocaleString()} industries, see which sectors are driving the most hiring
          activity and where the concentration of jobs actually sits.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
            {card.desc && <p className="mt-2 text-xs opacity-60">{card.desc}</p>}
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
