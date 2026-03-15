"use client";

import BarChartCard from "@/components/charts/BarChartCard";
import LineChartCard from "@/components/charts/LineChartCard";
import PieChartCard from "@/components/charts/PieChartCard";

interface Props {
  topFields: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  recentTrend: { period: string; count: number }[];
}

export default function DashboardCharts({
  topFields,
  topLocations,
  recentTrend,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <LineChartCard title="Jobs Posted per Month" data={recentTrend} />
      <PieChartCard title="Top Job Fields" data={topFields} />
      <BarChartCard
        title="Jobs by Location"
        data={topLocations}
        color="#0284c7"
        horizontal
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
