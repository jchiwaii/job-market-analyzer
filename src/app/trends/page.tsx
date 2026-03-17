import { queryOne, queryAll } from "@/lib/db";
import TrendsCharts from "./TrendsCharts";

export const dynamic = "force-dynamic";

async function getTrendsData() {
  const [totalJobsRow, jobsWithDatesRow, monthly] = await Promise.all([
    queryOne<{ c: number }>("SELECT COUNT(*) as c FROM jobs"),
    queryOne<{ c: number }>(
      "SELECT COUNT(*) as c FROM jobs WHERE posted_date IS NOT NULL"
    ),
    queryAll<{ period: string; count: number }>(
      `SELECT strftime('%Y-%m', posted_date) as period, COUNT(*) as count
       FROM jobs
       WHERE posted_date IS NOT NULL
         AND strftime('%Y-%m', posted_date) >= '2026-01'
       GROUP BY period
       ORDER BY period ASC`
    ),
  ]);

  return {
    totalJobs: totalJobsRow?.c ?? 0,
    jobsWithDates: jobsWithDatesRow?.c ?? 0,
    monthly,
  };
}

export default async function TrendsPage() {
  const { totalJobs, jobsWithDates, monthly } = await getTrendsData();
  const withoutDates = Math.max(totalJobs - jobsWithDates, 0);
  const pct = totalJobs > 0 ? ((withoutDates / totalJobs) * 100).toFixed(1) : "0.0";
  const withDatesPct =
    totalJobs > 0 ? ((jobsWithDates / totalJobs) * 100).toFixed(1) : "0.0";

  const firstMonth = monthly[0]?.period ?? "—";
  const lastMonth = monthly[monthly.length - 1]?.period ?? "—";

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          Trends
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6E7875]">
          Job posting activity over time
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[284px_minmax(0,1fr)]">
        {/* Sidebar KPI */}
        <aside className="rounded-2xl bg-[#ECF4E9] p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBFBFC] text-[#1E4841]">
              <TrendIcon />
            </span>
            <div>
              <p className="text-xs font-medium text-[#5F6A67]">Active window</p>
              <p className="text-sm font-semibold text-[#24302C]">{firstMonth} – {lastMonth}</p>
            </div>
          </div>

          {/* Dated jobs KPI */}
          <div className="rounded-xl bg-[#BBF49C] p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#2D6B52]">
              Jobs with a date
            </p>
            <div className="flex items-end gap-2">
              <p className="text-[36px] font-bold leading-none tracking-tight text-[#1E4841]">
                {jobsWithDates.toLocaleString()}
              </p>
              <p className="pb-1 text-sm font-semibold text-[#2D6B52]">
                {withDatesPct}%
              </p>
            </div>
            <div className="mt-4 h-[8px] overflow-hidden rounded-full bg-[#D5F6C0]">
              <div
                className="h-full rounded-full bg-[#1E4841]"
                style={{ width: `${withDatesPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-[#3A6B55]">
              <span>{withoutDates.toLocaleString()} undated</span>
              <span>{totalJobs.toLocaleString()} total</span>
            </div>
          </div>

          <div className="my-4 border-t border-[#C8CFC9]" />

          {/* Undated callout */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#3A5C4E]">Why so few dates?</p>
            <p className="text-xs leading-relaxed text-[#5F6A67]">
              <strong className="text-[#3A5C4E]">{pct}%</strong> of listings are archived
              scrapes from MyJobMag historical pages — these do not carry a{" "}
              <code className="rounded bg-[#DFF2D4] px-1 py-0.5 text-[11px]">datePosted</code>{" "}
              field and are excluded from the timeline.
            </p>
          </div>
        </aside>

        {/* Chart + context */}
        <div className="flex flex-col gap-4">
          {monthly.length > 0 && <TrendsCharts monthly={monthly} />}

          <div className="rounded-2xl border border-[#E4E8E6] bg-white px-5 py-4">
            <p className="text-xs font-semibold text-[#24302C]">Reading this chart</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5F6A67]">
              Each point shows the total number of job postings published on MyJobMag in that
              calendar month, from{" "}
              <strong className="text-[#24302C]">{firstMonth}</strong> to{" "}
              <strong className="text-[#24302C]">{lastMonth}</strong>. Only listings that
              carried a <code className="rounded bg-[#F3F5F4] px-1 py-0.5 text-[11px]">datePosted</code>{" "}
              value when scraped are included — representing the most recent active hiring window.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <path
        d="M3 15.5 8 10.5l2.5 2.5L16 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 7.5h2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
