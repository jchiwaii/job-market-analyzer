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
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PieChartCard title="Top Job Fields" data={topFields} />
      <BarChartCard
        title="Top Companies Hiring"
        data={topCompanies}
        color="#059669"
        horizontal
        maxItems={8}
      />
      <BarChartCard
        title="Jobs by Location"
        data={topLocations}
        color="#0284c7"
        horizontal
        maxItems={8}
      />
      <BarChartCard
        title="Jobs by Field"
        data={topFields}
        horizontal
        maxItems={8}
      />
    </div>
  );
}
