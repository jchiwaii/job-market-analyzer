import { getDb } from "@/lib/db";
import TrendsCharts from "./TrendsCharts";

export const dynamic = "force-dynamic";

function getTrendsData() {
  const db = getDb();

  const totalJobs = (
    db.prepare("SELECT COUNT(*) as c FROM jobs").get() as { c: number }
  ).c;

  const jobsWithDates = (
    db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE posted_date IS NOT NULL")
      .get() as { c: number }
  ).c;

  const monthly = db
    .prepare(
      `SELECT strftime('%Y-%m', posted_date) as period, COUNT(*) as count
       FROM jobs
       WHERE posted_date IS NOT NULL
         AND strftime('%Y-%m', posted_date) >= '2026-01'
       GROUP BY period
       ORDER BY period ASC`
    )
    .all() as { period: string; count: number }[];

  return { totalJobs, jobsWithDates, monthly };
}

export default function TrendsPage() {
  const { totalJobs, jobsWithDates, monthly } = getTrendsData();
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
        <aside className="rounded-2xl bg-[#ECF4E9] p-4">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBFBFC] text-[#1E4841]">
              <TrendIcon />
            </span>
            <h2 className="text-lg font-semibold text-[#24302C]">Trends</h2>
          </div>

          <p className="mb-4 text-sm text-[#6E7875]">Job posting activity over time</p>

          <div className="rounded-xl bg-[#BBF49C] p-3">
            <div className="flex items-end gap-2">
              <p className="text-[32px] font-bold leading-none tracking-tight text-[#1E4841]">
                {jobsWithDates.toLocaleString()}
              </p>
              <p className="pb-1 text-sm font-semibold text-[#1E4841]">
                {withDatesPct}%
              </p>
            </div>

            <div className="mt-3 h-[10px] overflow-hidden rounded-md bg-[#D5F6C0]">
              <div
                className="h-full rounded-md bg-[#1E4841]"
                style={{ width: `${withDatesPct}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[#1E4841]">
              <span>{withoutDates.toLocaleString()}</span>
              <span>{totalJobs.toLocaleString()}</span>
            </div>
          </div>

          <div className="my-5 border-t border-[#BCC0BF]" />

          <p className="text-xs leading-relaxed text-[#5F6A67]">
            <strong>{withoutDates.toLocaleString()}</strong> of{" "}
            <strong>{totalJobs.toLocaleString()}</strong> jobs ({pct}%) have no date and are
            excluded. To extend coverage, re-scrape with a targeted date range.
          </p>
        </aside>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#24302C]">
              Understanding this chart
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-[#5F6A67]">
              <p>
                The line above shows job postings with a recorded date scraped from
                MyJobMag&apos;s active listings between{" "}
                <strong className="text-[#24302C]">{firstMonth}</strong> and{" "}
                <strong className="text-[#24302C]">{lastMonth}</strong>.
              </p>
              <p>
                The remaining{" "}
                <strong className="text-[#24302C]">
                  {withoutDates.toLocaleString()} jobs ({pct}%)
                </strong>{" "}
                are archived listings pulled from historical archive pages. Archived entries
                do not include a{" "}
                <code className="rounded bg-[#F3F5F4] px-1 py-0.5 text-xs">datePosted</code>{" "}
                value in their structured data, so they cannot be placed on a timeline and
                are excluded from this chart.
              </p>
            </div>
          </div>

          {monthly.length > 0 && <TrendsCharts monthly={monthly} />}
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
