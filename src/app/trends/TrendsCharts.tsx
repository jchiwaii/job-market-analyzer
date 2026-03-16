"use client";

import LineChartCard from "@/components/charts/LineChartCard";

interface Props {
  monthly: { period: string; count: number }[];
}

export default function TrendsCharts({ monthly }: Props) {
  return (
    <LineChartCard
      title="Monthly Job Postings (Jan – Mar 2026)"
      data={monthly}
      color="#059669"
    />
  );
}
