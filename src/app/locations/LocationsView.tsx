"use client";

import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";

interface Props {
  locations: { name: string; count: number }[];
}

export default function LocationsView({ locations }: Props) {
  const total = locations.reduce((s, l) => s + l.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarChartCard
          title="Jobs by Location"
          data={locations}
          color="#0284c7"
          horizontal
          maxItems={15}
        />
        <PieChartCard
          title="Location Distribution"
          data={locations}
          maxItems={10}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          All Locations ({locations.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="pb-3 pr-4 font-medium text-zinc-500">#</th>
                <th className="pb-3 pr-4 font-medium text-zinc-500">
                  Location
                </th>
                <th className="pb-3 font-medium text-zinc-500 text-right">
                  Jobs
                </th>
                <th className="pb-3 pl-4 font-medium text-zinc-500 text-right">
                  Share
                </th>
                <th className="pb-3 pl-4 font-medium text-zinc-500" />
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, i) => {
                const pct = ((loc.count / total) * 100).toFixed(1);
                const barWidth = (loc.count / locations[0].count) * 100;
                return (
                  <tr
                    key={loc.name}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-2.5 pr-4 text-zinc-400">{i + 1}</td>
                    <td className="py-2.5 pr-4 font-medium">{loc.name}</td>
                    <td className="py-2.5 text-right">{loc.count}</td>
                    <td className="py-2.5 pl-4 text-right text-zinc-500">
                      {pct}%
                    </td>
                    <td className="w-32 py-2.5 pl-4">
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
