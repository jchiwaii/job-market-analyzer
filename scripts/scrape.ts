import { startScrapeRun, finishScrapeRun } from "../src/lib/db";
import { runFullScrape } from "../src/lib/scraper";

const maxPages = parseInt(process.argv[2] || "20", 10);

async function main() {
  console.log(`Starting scrape (max ${maxPages} pages)...\n`);
  const runId = startScrapeRun();

  try {
    const stats = await runFullScrape(maxPages);
    finishScrapeRun(runId, {
      pages_scraped: stats.pagesScraped,
      jobs_found: stats.jobsFound,
      new_jobs: stats.newJobs,
    });
    console.log(`\nScrape run #${runId} recorded.`);
  } catch (err) {
    console.error("Scrape failed:", err);
    process.exit(1);
  }
}

main();
