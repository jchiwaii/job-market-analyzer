"use client";

import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";

interface Props {
  topFields: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  topCompanies: { name: string; count: number }[];
}

export default function DashboardCharts({
  topFields,
  topLocations,
  topCompanies,
}: Props) {
  const totalListed = topLocations.reduce((sum, l) => sum + l.count, 0);
  const nairobi = topLocations.find((l) => l.name.toLowerCase().includes("nairobi"));
  const nairobiPct = nairobi && totalListed > 0
    ? Math.round((nairobi.count / totalListed) * 100)
    : null;

  const locationNote = nairobiPct !== null
    ? `Nairobi dominates the listings, accounting for roughly ${nairobiPct}% of all jobs in the top ${topLocations.length} locations shown. Most roles are concentrated in the capital, with Mombasa and a handful of other towns making up the remainder.`
    : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
      <BarChartCard
        title="Top Companies Hiring"
        data={topCompanies}
        color="#1E4841"
        horizontal
        maxItems={6}
        dashboardStyle
        dashboardVariant="focus"
        className="xl:col-span-2"
      />
      <PieChartCard title="Top Job Fields" data={topFields} />
      <BarChartCard
        title="Jobs by Location"
        data={topLocations}
        color="#0284c7"
        horizontal
        maxItems={8}
        dashboardStyle
        note={locationNote}
      />
      <BarChartCard
        title="Jobs by Field"
        data={topFields}
        horizontal
        maxItems={6}
        dashboardStyle
        className="xl:col-span-2"
      />
    </div>
  );
}
