import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function getDateStats() {
  const db = getDb();
  const totalJobs = (
    db.prepare("SELECT COUNT(*) as c FROM jobs").get() as { c: number }
  ).c;
  const jobsWithDates = (
    db
      .prepare("SELECT COUNT(*) as c FROM jobs WHERE posted_date IS NOT NULL")
      .get() as { c: number }
  ).c;
  return { totalJobs, jobsWithDates };
}

export default function TrendsPage() {
  const { totalJobs, jobsWithDates } = getDateStats();
  const withoutDates = totalJobs - jobsWithDates;
  const pct = ((withoutDates / totalJobs) * 100).toFixed(1);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Trends</h1>
        <p className="mt-1 text-sm text-zinc-500">Job posting trends over time</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
        <h2 className="mb-2 text-base font-semibold text-amber-800 dark:text-amber-300">
          Date data not available for trend analysis
        </h2>
        <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          <strong>{withoutDates.toLocaleString()}</strong> of{" "}
          <strong>{totalJobs.toLocaleString()}</strong> jobs ({pct}%) are
          archived listings scraped from historical pages of MyJobMag. These
          archived jobs do not carry a <code>datePosted</code> field in their
          structured data, so no reliable post date could be extracted.
        </p>
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          Only <strong>{jobsWithDates.toLocaleString()}</strong> jobs (the most
          recent listings) have dates — too small a slice to represent meaningful
          hiring trends across the full dataset. A time-series chart built on
          this data would be misleading.
        </p>
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
          To analyze trends, consider re-scraping with a targeted date range, or
          use the <strong>Fields</strong>, <strong>Locations</strong>, and{" "}
          <strong>Companies</strong> pages which are based on the full{" "}
          {totalJobs.toLocaleString()}-job dataset.
        </p>
      </div>
    </>
  );
}
