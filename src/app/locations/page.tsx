import { queryOne, queryAll } from "@/lib/db";
import LocationsView from "./LocationsView";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

async function getLocationsData(page: number) {
  const offset = (page - 1) * PAGE_SIZE;

  const [nairobiRow, totalWithLocationRow, totalRow, locations, top15] = await Promise.all([
    queryOne<{ c: number }>(
      "SELECT COUNT(*) as c FROM jobs WHERE location = 'Nairobi'"
    ),
    queryOne<{ c: number }>(
      "SELECT COUNT(*) as c FROM jobs WHERE location IS NOT NULL AND location <> ''"
    ),
    queryOne<{ c: number }>(
      "SELECT COUNT(DISTINCT location) as c FROM jobs WHERE location IS NOT NULL AND location <> '' AND location <> 'Nairobi'"
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location <> '' AND location <> 'Nairobi'
       GROUP BY location ORDER BY count DESC
       LIMIT :limit OFFSET :offset`,
      { limit: PAGE_SIZE, offset }
    ),
    queryAll<{ name: string; count: number }>(
      `SELECT location as name, COUNT(*) as count
       FROM jobs WHERE location IS NOT NULL AND location <> '' AND location <> 'Nairobi'
       GROUP BY location ORDER BY count DESC LIMIT 15`
    ),
  ]);

  const nairobiCount = nairobiRow?.c ?? 0;
  const totalWithLocation = totalWithLocationRow?.c ?? 0;
  const total = totalRow?.c ?? 0;

  return {
    locations,
    top15,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
    nairobiCount,
    totalWithLocation,
  };
}

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Math.min(parseInt(pageParam || "1", 10), 10000));
  const { locations, top15, total, totalPages, nairobiCount, totalWithLocation } =
    await getLocationsData(page);

  const nairobiPct =
    totalWithLocation > 0 ? Math.round((nairobiCount / totalWithLocation) * 100) : 0;
  const outsideNairobi = totalWithLocation - nairobiCount;
  const summaryCards: {
    title: string;
    value: string;
    subtitle?: string;
    tone: string;
  }[] = [
    {
      title: "Nairobi Dominance",
      value: `${nairobiPct}%`,
      subtitle: `${nairobiCount.toLocaleString()} of ${totalWithLocation.toLocaleString()} located jobs`,
      tone: "text-[#1E4841] bg-[#ECF4E9] border-[#D9E2D7]",
    },
    {
      title: "Top City Outside Nairobi",
      value: top15[0]?.name ?? "—",
      subtitle: `${(top15[0]?.count ?? 0).toLocaleString()} jobs`,
      tone: "text-[#2F5F90] bg-[#EAF1F8] border-[#D6E1EE]",
    },
    {
      title: "Jobs Outside Nairobi",
      value: outsideNairobi.toLocaleString(),
      subtitle: `${Math.max(0, 100 - nairobiPct)}% of located listings`,
      tone: "text-[#9F6A1F] bg-[#FBF3E8] border-[#F0DFCA]",
    },
    {
      title: "Unique Locations",
      value: (total + 1).toLocaleString(),
      subtitle: "including Nairobi",
      tone: "text-[#7F4A83] bg-[#F5ECF7] border-[#E8D7EC]",
    },
  ];

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-[#23302D] sm:text-2xl lg:text-[30px]">
          Locations
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6E7875]">
          {total.toLocaleString()} locations across Kenyan counties and cities (excluding Nairobi)
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

      <LocationsView
        locations={locations}
        top15={top15}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        nairobiCount={nairobiCount}
        totalWithLocation={totalWithLocation}
      />
    </>
  );
}
