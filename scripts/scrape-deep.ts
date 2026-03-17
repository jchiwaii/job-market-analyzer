/**
 * Deep scraper for MyJobMag Kenya.
 *
 * Strategy:
 *  1. Try sitemap.xml / sitemap_index.xml for direct job URLs.
 *  2. Crawl the homepage to discover all category / field / location / industry
 *     listing-section URLs.
 *  3. For every discovered section URL paginate until there are no more pages.
 *  4. All deduplication is handled by jobExists() (slug-based).
 *
 * Usage:
 *   npx tsx scripts/scrape-deep.ts              # unlimited pages per section
 *   npx tsx scripts/scrape-deep.ts 50           # max 50 pages per section
 */

import * as cheerio from "cheerio";
import {
  insertJob,
  jobExists,
  startScrapeRun,
  finishScrapeRun,
} from "../src/lib/db";
import { scrapeJobDetail } from "./scraper";

const BASE_URL = "https://www.myjobmag.co.ke";
const DELAY_MS = 1000; // 1 s between every request (polite but faster than default 1.5 s)

// ─── helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// ─── job extraction from a listing HTML page ────────────────────────────────

interface RawJob {
  slug: string;
  url: string;
  title: string;
}

function extractJobsFromHtml($: cheerio.CheerioAPI): RawJob[] {
  const jobs: RawJob[] = [];
  const seen = new Set<string>();

  function add(href: string, title: string) {
    if (!href.includes("/job/")) return;
    const slug = href.split("/job/")[1]?.split(/[/?#]/)[0];
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    const url = href.startsWith("http") ? href : `${BASE_URL}${href}`;
    jobs.push({ slug, url, title: title.trim() });
  }

  // Primary selector (structured list items)
  $("ul.job-list li, .job-info, .mag-b").each((_, el) => {
    const a = $(el).find("a[href*='/job/']").first();
    if (a.length) add(a.attr("href") || "", a.text());
  });

  // Fallback: grab every job link on the page
  if (jobs.length === 0) {
    $("a[href*='/job/']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      if (text.length >= 3) add(href, text);
    });
  }

  return jobs;
}

function pageHasNext($: cheerio.CheerioAPI, pageNum: number): boolean {
  return (
    $(`a[href*="/page/${pageNum + 1}"]`).length > 0 ||
    $("a:contains('Next')").length > 0 ||
    $("a.next, .next a, .pagination .next").length > 0
  );
}

// ─── sitemap parsing ─────────────────────────────────────────────────────────

async function jobUrlsFromSitemap(): Promise<string[]> {
  const sitemapUrls = [
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/sitemap_index.xml`,
    `${BASE_URL}/post-sitemap.xml`,
    `${BASE_URL}/jobs-sitemap.xml`,
  ];

  const jobUrls: string[] = [];

  for (const sitemapUrl of sitemapUrls) {
    try {
      console.log(`  Trying sitemap: ${sitemapUrl}`);
      const xml = await fetchPage(sitemapUrl);
      await sleep(DELAY_MS);

      // Collect child sitemaps (sitemap index)
      const childSitemaps = Array.from(
        xml.matchAll(/<loc>(https?:\/\/[^<]+sitemap[^<]*)<\/loc>/gi),
        (m) => m[1]
      );

      for (const childUrl of childSitemaps) {
        try {
          const childXml = await fetchPage(childUrl);
          await sleep(DELAY_MS);
          const urls = Array.from(
            childXml.matchAll(/<loc>(https?:\/\/[^<]+\/job\/[^<]+)<\/loc>/gi),
            (m) => m[1]
          );
          jobUrls.push(...urls);
          console.log(`    ${childUrl} → ${urls.length} job URLs`);
        } catch {
          // child sitemap unavailable
        }
      }

      // Direct job URLs in this sitemap
      const direct = Array.from(
        xml.matchAll(/<loc>(https?:\/\/[^<]+\/job\/[^<]+)<\/loc>/gi),
        (m) => m[1]
      );
      jobUrls.push(...direct);

      if (jobUrls.length > 0) {
        console.log(`  Sitemap total job URLs found: ${jobUrls.length}`);
        break;
      }
    } catch {
      // sitemap not found
    }
  }

  return [...new Set(jobUrls)];
}

// ─── listing-section URL discovery ──────────────────────────────────────────

/** Known field slugs used by MyJobMag — used as a seed list for URL probing. */
const KNOWN_FIELD_SLUGS = [
  "accounting-auditing",
  "administration-secretarial",
  "agriculture-agro-allied",
  "architecture-interior-design",
  "aviation-airline",
  "banking-finance",
  "building-construction",
  "consulting",
  "customer-service",
  "education-teaching",
  "engineering",
  "executive-management",
  "finance-accounting",
  "graduate-jobs",
  "health-medical-pharmaceutical",
  "hospitality-catering",
  "hr-recruitment",
  "ict-computer",
  "insurance",
  "internship-industrial-training",
  "law-legal",
  "logistics-transport",
  "manufacturing",
  "marketing-communications-pr",
  "media-publishing",
  "ngo-non-profit",
  "oil-gas-energy",
  "procurement-purchasing",
  "project-management",
  "public-sector",
  "research-statistics",
  "sales",
  "science-laboratory",
  "security-intelligence",
  "social-sciences",
  "supply-chain",
  "telecommunications",
  "travel-tourism",
];

/** Known industry slugs. */
const KNOWN_INDUSTRY_SLUGS = [
  "agriculture",
  "airline-aviation",
  "banking",
  "construction",
  "consulting",
  "consumer-goods",
  "education",
  "engineering",
  "finance",
  "fmcg",
  "government",
  "health",
  "hospitality",
  "ict",
  "insurance",
  "law",
  "logistics",
  "manufacturing",
  "media",
  "ngo",
  "oil-gas",
  "real-estate",
  "retail",
  "security",
  "telecommunications",
  "transport",
];

/** Kenyan locations. */
const KNOWN_LOCATION_SLUGS = [
  "nairobi",
  "mombasa",
  "kisumu",
  "nakuru",
  "eldoret",
  "thika",
  "malindi",
  "kitale",
  "garissa",
  "kakamega",
  "nyeri",
  "meru",
  "coast",
  "central",
  "rift-valley",
  "western",
  "eastern",
  "north-eastern",
  "kenya",
];

async function discoverSectionUrls(): Promise<string[]> {
  const sections = new Set<string>();

  // Always include the main listing
  sections.add(BASE_URL);

  // ── Discover from homepage navigation ──────────────────────────────────
  try {
    console.log("Fetching homepage to discover navigation links...");
    const html = await fetchPage(BASE_URL);
    await sleep(DELAY_MS);
    const $ = cheerio.load(html);

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      const full = href.startsWith("http") ? href : `${BASE_URL}${href}`;

      // Accept any URL that looks like a category/listing page on this domain
      if (
        full.startsWith(BASE_URL) &&
        !href.includes("/job/") &&
        !href.includes("/jobs-at/") &&
        (href.match(/\/(jobs|job-fields|job-category|job-types|locations)\//i) ||
          href.match(/\/jobs-in-[a-z]/i) ||
          href.match(/\/jobs-by-[a-z]/i) ||
          href.match(/\/[a-z]+-jobs($|\/)/i))
      ) {
        sections.add(full.split("?")[0].replace(/\/$/, ""));
      }
    });

    console.log(
      `  Discovered ${sections.size - 1} extra listing URLs from homepage`
    );
  } catch (err) {
    console.error("  Could not fetch homepage for discovery:", err);
  }

  // ── Seed known field/industry/location patterns ────────────────────────
  for (const slug of KNOWN_FIELD_SLUGS) {
    sections.add(`${BASE_URL}/jobs/${slug}`);
    sections.add(`${BASE_URL}/jobs-in-${slug}`);
  }
  for (const slug of KNOWN_INDUSTRY_SLUGS) {
    sections.add(`${BASE_URL}/jobs-by-industry/${slug}`);
  }
  for (const slug of KNOWN_LOCATION_SLUGS) {
    sections.add(`${BASE_URL}/jobs-in-${slug}`);
    sections.add(`${BASE_URL}/locations/${slug}`);
  }

  // Remove the base URL — it's added first and will be scraped in phase 1
  const result = Array.from(sections).filter((u) => u !== BASE_URL);
  return result;
}

// ─── scrape one listing section (all pages) ──────────────────────────────────

interface Stats {
  pagesScraped: number;
  jobsFound: number;
  newJobs: number;
  errors: number;
  startTime: number;
}

async function scrapeSectionPages(
  sectionUrl: string,
  maxPages: number,
  stats: Stats
): Promise<void> {
  for (let page = 1; page <= maxPages; page++) {
    const url =
      page === 1 ? sectionUrl : `${sectionUrl}/page/${page}`;

    let html: string;
    try {
      html = await fetchPage(url);
      await sleep(DELAY_MS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("HTTP 404") || msg.includes("HTTP 4")) {
        // Section doesn't exist or no more pages — stop silently
      } else {
        console.log(`  [err] ${url}: ${msg}`);
      }
      break;
    }

    const $ = cheerio.load(html);
    const jobs = extractJobsFromHtml($);

    if (jobs.length === 0) {
      break; // empty page means end of section
    }

    stats.pagesScraped++;
    stats.jobsFound += jobs.length;

    const newOnPage = jobs.filter((j) => !jobExists(j.slug)).length;
    console.log(
      `  p${page}: ${jobs.length} jobs (${newOnPage} new) | total new so far: ${stats.newJobs}`
    );

    for (const job of jobs) {
      if (jobExists(job.slug)) continue;

      await sleep(DELAY_MS);
      try {
        const detail = await scrapeJobDetail(job.url);
        insertJob({
          slug: job.slug,
          url: job.url,
          title: job.title,
          company: detail.company,
          field: detail.field,
          location: detail.location,
          experience: detail.experience,
          qualification: detail.qualification,
          job_type: detail.job_type,
          industry: detail.industry,
          description: detail.description,
          posted_date: detail.posted_date,
          deadline: detail.deadline,
        });
        stats.newJobs++;
      } catch {
        stats.errors++;
      }
    }

    if (!pageHasNext($, page)) break;
  }
}

// ─── scrape from sitemap job URLs directly ───────────────────────────────────

async function scrapeFromSitemapUrls(
  urls: string[],
  stats: Stats
): Promise<void> {
  console.log(`\nPhase 0 — Sitemap: processing ${urls.length} job URLs`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const slug = url.split("/job/")[1]?.split(/[/?#]/)[0];
    if (!slug || jobExists(slug)) continue;

    if (i % 100 === 0) {
      const elapsed = ((Date.now() - stats.startTime) / 60_000).toFixed(1);
      console.log(
        `  [${i}/${urls.length}] new: ${stats.newJobs} | elapsed: ${elapsed} min`
      );
    }

    await sleep(DELAY_MS);
    try {
      const detail = await scrapeJobDetail(url);
      insertJob({
        slug,
        url,
        title: "—", // title not available from sitemap; detail page may fill it
        company: detail.company,
        field: detail.field,
        location: detail.location,
        experience: detail.experience,
        qualification: detail.qualification,
        job_type: detail.job_type,
        industry: detail.industry,
        description: detail.description,
        posted_date: detail.posted_date,
        deadline: detail.deadline,
      });
      stats.newJobs++;
      stats.jobsFound++;
    } catch {
      stats.errors++;
    }
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const maxPagesPerSection = parseInt(process.argv[2] || "9999", 10);

  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║    MyJobMag Kenya — DEEP SCRAPE (overnight mode)    ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`Max pages per section : ${maxPagesPerSection}`);
  console.log(`Delay between requests: ${DELAY_MS} ms`);
  console.log(`Started at            : ${new Date().toISOString()}\n`);

  const runId = startScrapeRun();
  const stats: Stats = {
    pagesScraped: 0,
    jobsFound: 0,
    newJobs: 0,
    errors: 0,
    startTime: Date.now(),
  };

  // ── Phase 0: Sitemap (fastest path if available) ───────────────────────
  const sitemapUrls = await jobUrlsFromSitemap();
  if (sitemapUrls.length > 0) {
    await scrapeFromSitemapUrls(sitemapUrls, stats);
  }

  // ── Phase 1: Main listing pages ────────────────────────────────────────
  console.log(`\nPhase 1 — Main listing: ${BASE_URL}`);
  await scrapeSectionPages(BASE_URL, maxPagesPerSection, stats);

  // ── Phase 2: Discovered + seeded section URLs ──────────────────────────
  const sectionUrls = await discoverSectionUrls();
  console.log(`\nPhase 2 — ${sectionUrls.length} listing sections to crawl`);

  for (let i = 0; i < sectionUrls.length; i++) {
    const sectionUrl = sectionUrls[i];
    const elapsed = ((Date.now() - stats.startTime) / 60_000).toFixed(1);
    console.log(
      `\n[${i + 1}/${sectionUrls.length}] ${sectionUrl}` +
        ` | new: ${stats.newJobs} | ${elapsed} min elapsed`
    );
    await scrapeSectionPages(sectionUrl, maxPagesPerSection, stats);
  }

  // ── Done ───────────────────────────────────────────────────────────────
  const totalMin = ((Date.now() - stats.startTime) / 60_000).toFixed(1);

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                  DEEP SCRAPE COMPLETE               ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`Pages scraped : ${stats.pagesScraped}`);
  console.log(`Jobs found    : ${stats.jobsFound}`);
  console.log(`New jobs added: ${stats.newJobs}`);
  console.log(`Errors        : ${stats.errors}`);
  console.log(`Total time    : ${totalMin} min`);
  console.log(`Finished at   : ${new Date().toISOString()}`);

  finishScrapeRun(runId, {
    pages_scraped: stats.pagesScraped,
    jobs_found: stats.jobsFound,
    new_jobs: stats.newJobs,
  });

  console.log(`\nScrape run #${runId} recorded.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
