import { getDb } from "@/lib/db";
import FieldsView from "./FieldsView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function getFieldsData(page: number) {
  const db = getDb();
  const offset = (page - 1) * PAGE_SIZE;

  const total = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT field) as c FROM jobs WHERE field IS NOT NULL AND field <> ''"
      )
      .get() as { c: number }
  ).c;

  const fields = db
    .prepare(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field <> ''
       GROUP BY field ORDER BY count DESC
       LIMIT @limit OFFSET @offset`
    )
    .all({ limit: PAGE_SIZE, offset }) as { name: string; count: number }[];

  const top15 = db
    .prepare(
      `SELECT field as name, COUNT(*) as count
       FROM jobs WHERE field IS NOT NULL AND field <> ''
       GROUP BY field ORDER BY count DESC LIMIT 15`
    )
    .all() as { name: string; count: number }[];

  const qualifications = db
    .prepare(
      `SELECT qualification as name, COUNT(*) as count
       FROM jobs WHERE qualification IS NOT NULL AND qualification <> ''
       GROUP BY qualification ORDER BY count DESC LIMIT 10`
    )
    .all() as { name: string; count: number }[];

  const jobTypes = db
    .prepare(
      `SELECT job_type as name, COUNT(*) as count
       FROM jobs WHERE job_type IS NOT NULL AND job_type <> ''
       GROUP BY job_type ORDER BY count DESC LIMIT 10`
    )
    .all() as { name: string; count: number }[];

  return {
    fields,
    top15,
    qualifications,
    jobTypes,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export default async function FieldsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.min(parseInt(pageParam || "1", 10), 10000));
  const { fields, top15, qualifications, jobTypes, total, totalPages } = getFieldsData(page);

  const summaryCards: {
    title: string;
    value: string;
    subtitle?: string;
    desc: string;
    tone: string;
  }[] = [
    {
      title: "Unique Job Fields",
      value: total.toLocaleString(),
      desc: "Spans all unique career fields found across every job listing in the dataset",
      tone: "text-[#1E4841] bg-[#ECF4E9] border-[#D9E2D7]",
    },
    {
      title: "Most Required Qualification",
      value: qualifications[0]?.name ?? "—",
      subtitle: `${(qualifications[0]?.count ?? 0).toLocaleString()} listings`,
      desc: "Top credential employers ask for",
      tone: "text-[#2F5F90] bg-[#EAF1F8] border-[#D6E1EE]",
    },
    {
      title: "Most Common Work Type",
      value: jobTypes[0]?.name ?? "—",
      subtitle: `${(jobTypes[0]?.count ?? 0).toLocaleString()} listings`,
      desc: "Dominant employment arrangement in the market",
      tone: "text-[#9F6A1F] bg-[#FBF3E8] border-[#F0DFCA]",
    },
  ];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          Job Fields
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6E7875]">
          Breakdown by field, qualification, and job type
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
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
            <p className="mt-2 text-xs opacity-60">{card.desc}</p>
          </div>
        ))}
      </div>

      <FieldsView
        fields={fields}
        top15={top15}
        qualifications={qualifications}
        jobTypes={jobTypes}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </>
  );
}
