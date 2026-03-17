import * as cheerio from "cheerio";
import { insertJob, jobExists } from "./db";

const BASE_URL = "https://www.myjobmag.co.ke";
const DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export interface ListingJob {
  slug: string;
  url: string;
  title: string;
  company: string | null;
  posted_date: string | null;
}

export async function scrapeListingPage(
  pageNum: number
): Promise<{ jobs: ListingJob[]; hasNext: boolean }> {
  const url = pageNum === 1 ? BASE_URL : `${BASE_URL}/page/${pageNum}`;
  console.log(`  Fetching listing page ${pageNum}: ${url}`);

  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const jobs: ListingJob[] = [];

  $("ul.job-list li, .job-info, .mag-b").each((_, el) => {
    const titleEl = $(el).find("a[href*='/job/']").first();
    if (!titleEl.length) return;

    const href = titleEl.attr("href") || "";
    const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
    const slug = href.split("/job/")[1] || "";
    if (!slug) return;

    const title = titleEl.text().trim();
    const company = extractCompanyFromTitle(title);

    const dateText = $(el).find("li span, .job-date, time").text().trim();
    const posted_date = parsePostedDate(dateText);

    jobs.push({ slug, url: fullUrl, title, company, posted_date });
  });

  if (jobs.length === 0) {
    $("a[href*='/job/']").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (!href.includes("/job/")) return;
      const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
      const slug = href.split("/job/")[1] || "";
      if (!slug || slug.includes("/")) return;

      const title = $(el).text().trim();
      if (!title || title.length < 3) return;

      const existing = jobs.find((j) => j.slug === slug);
      if (existing) return;

      jobs.push({
        slug,
        url: fullUrl,
        title,
        company: extractCompanyFromTitle(title),
        posted_date: null,
      });
    });
  }

  const hasNext =
    $(`a[href*="/page/${pageNum + 1}"]`).length > 0 ||
    $("a:contains('Next')").length > 0;

  return { jobs, hasNext };
}

function extractCompanyFromTitle(title: string): string | null {
  const match = title.match(/\bat\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function parsePostedDate(text: string): string | null {
  if (!text) return null;

  const months: Record<string, string> = {
    January: "01", February: "02", March: "03", April: "04",
    May: "05", June: "06", July: "07", August: "08",
    September: "09", October: "10", November: "11", December: "12",
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };

  const fullMatch = text.match(
    /(\w+)\s+(\d{1,2}),?\s*(\d{4})/
  );
  if (fullMatch) {
    const m = months[fullMatch[1]];
    if (m) return `${fullMatch[3]}-${m}-${fullMatch[2].padStart(2, "0")}`;
  }

  const shortMatch = text.match(/(\d{1,2})\s+(\w+)/);
  if (shortMatch) {
    const m = months[shortMatch[2]];
    if (m) {
      const year = new Date().getFullYear();
      return `${year}-${m}-${shortMatch[1].padStart(2, "0")}`;
    }
  }

  return null;
}

export interface JobDetail {
  field: string | null;
  location: string | null;
  experience: string | null;
  qualification: string | null;
  job_type: string | null;
  industry: string | null;
  description: string | null;
  posted_date: string | null;
  deadline: string | null;
  company: string | null;
}

export async function scrapeJobDetail(url: string): Promise<JobDetail> {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const detail: JobDetail = {
    field: null,
    location: null,
    experience: null,
    qualification: null,
    job_type: null,
    industry: null,
    description: null,
    posted_date: null,
    deadline: null,
    company: null,
  };

  // Try JSON-LD structured data first (most reliable)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = ($(el).html() || "").replace(/[\x00-\x1f]/g, " ");
      const json = JSON.parse(raw);
      if (json["@type"] === "JobPosting") {
        if (json.datePosted) {
          detail.posted_date = json.datePosted.split("T")[0];
        }
        if (json.validThrough) {
          detail.deadline = json.validThrough.split("T")[0];
        }
        if (json.hiringOrganization?.name) {
          detail.company = json.hiringOrganization.name;
        }
        if (json.occupationalCategory) {
          detail.field = json.occupationalCategory;
        }
        if (json.employmentType) {
          detail.job_type = json.employmentType;
        }
        if (json.industry) {
          detail.industry = json.industry;
        }
        if (json.jobLocation?.address?.addressLocality) {
          detail.location = json.jobLocation.address.addressLocality;
        }
        if (json.description) {
          const descPlain = json.description
            .replace(/<[^>]+>/g, " ")
            .replace(/&[^;]+;/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          detail.description = descPlain.substring(0, 5000);
        }
        if (json.experienceRequirements?.monthsOfExperience) {
          const months = parseInt(json.experienceRequirements.monthsOfExperience, 10);
          detail.experience = months >= 12
            ? `${Math.round(months / 12)} year${Math.round(months / 12) !== 1 ? "s" : ""}`
            : `${months} months`;
        }
      }
    } catch {
      // JSON parse failure — fall through to HTML parsing
    }
  });

  // Supplement with HTML parsing for any missing fields
  $("li, .job-detail-item, p").each((_, el) => {
    const text = $(el).text().trim();

    if (!detail.field && text.startsWith("Job Field")) {
      const links = $(el).find("a");
      if (links.length) {
        const fields: string[] = [];
        links.each((_, a) => { fields.push($(a).text().trim()); });
        detail.field = fields.join(", ");
      } else {
        detail.field = text.replace("Job Field", "").trim();
      }
    } else if (!detail.location && text.startsWith("Location")) {
      const links = $(el).find("a");
      if (links.length) {
        const locs: string[] = [];
        links.each((_, a) => { locs.push($(a).text().trim()); });
        detail.location = locs.join(", ");
      } else {
        detail.location = text.replace("Location", "").trim();
      }
    } else if (!detail.experience && text.startsWith("Experience")) {
      detail.experience = text.replace("Experience", "").trim();
    } else if (!detail.qualification && text.startsWith("Qualification")) {
      const links = $(el).find("a");
      if (links.length) {
        const quals: string[] = [];
        links.each((_, a) => { quals.push($(a).text().trim()); });
        detail.qualification = quals.join(", ");
      } else {
        detail.qualification = text.replace("Qualification", "").trim();
      }
    } else if (!detail.job_type && text.startsWith("Job Type")) {
      const links = $(el).find("a");
      if (links.length) {
        const types: string[] = [];
        links.each((_, a) => { types.push($(a).text().trim()); });
        detail.job_type = types.join(", ");
      } else {
        detail.job_type = text.replace("Job Type", "").trim();
      }
    }
  });

  if (!detail.industry) {
    const industryLink = $("a[href*='/jobs-by-industry/']").first();
    if (industryLink.length) {
      detail.industry = industryLink.text().replace("View Jobs in", "").trim();
    }
  }

  if (!detail.company) {
    const companyLink = $("a[href*='/jobs-at/']").first();
    if (companyLink.length) {
      detail.company = companyLink.text().replace("View Jobs at", "").trim();
    }
  }

  return detail;
}

export async function runFullScrape(maxPages = 20): Promise<{
  pagesScraped: number;
  jobsFound: number;
  newJobs: number;
}> {
  let pagesScraped = 0;
  let jobsFound = 0;
  let newJobs = 0;

  console.log("=== Starting MyJobMag Kenya Scrape ===\n");

  for (let page = 1; page <= maxPages; page++) {
    const { jobs, hasNext } = await scrapeListingPage(page);
    pagesScraped++;
    jobsFound += jobs.length;
    console.log(`  Found ${jobs.length} jobs on page ${page}`);

    for (const job of jobs) {
      if (jobExists(job.slug)) {
        console.log(`    [skip] ${job.slug}`);
        continue;
      }

      await sleep(DELAY_MS);
      console.log(`    [new] Scraping detail: ${job.slug}`);

      try {
        const detail = await scrapeJobDetail(job.url);
        insertJob({
          slug: job.slug,
          url: job.url,
          title: job.title,
          company: detail.company || job.company,
          field: detail.field,
          location: detail.location,
          experience: detail.experience,
          qualification: detail.qualification,
          job_type: detail.job_type,
          industry: detail.industry,
          description: detail.description,
          posted_date: detail.posted_date || job.posted_date,
          deadline: detail.deadline,
        });
        newJobs++;
      } catch (err) {
        console.error(`    [error] Failed to scrape ${job.url}:`, err);
      }
    }

    if (!hasNext) {
      console.log(`  No more pages after page ${page}.`);
      break;
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n=== Scrape Complete ===`);
  console.log(`Pages: ${pagesScraped} | Found: ${jobsFound} | New: ${newJobs}`);

  return { pagesScraped, jobsFound, newJobs };
}
