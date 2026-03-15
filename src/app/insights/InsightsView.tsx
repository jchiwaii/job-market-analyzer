"use client";

import BarChartCard from "@/components/charts/BarChartCard";
import type {
  WorkTypeRow,
  ExperienceBucketRow,
  CompanyConcentrationRow,
  FieldLocationRow,
  ExperienceByFieldRow,
  QualificationByFieldRow,
} from "./page";

interface Props {
  workTypes: WorkTypeRow[];
  experienceBuckets: ExperienceBucketRow[];
  companyConcentration: CompanyConcentrationRow[];
  fieldLocationCombos: FieldLocationRow[];
  experienceByField: ExperienceByFieldRow[];
  topQualByField: QualificationByFieldRow[];
}

export default function InsightsView({
  workTypes,
  experienceBuckets,
  companyConcentration,
  fieldLocationCombos,
  experienceByField,
  topQualByField,
}: Props) {
  const workTypeData = workTypes.map((r) => ({ name: r.category, count: r.count }));
  const expBucketData = experienceBuckets.map((r) => ({ name: r.bucket, count: r.count }));
  const companyConcentrationData = companyConcentration.map((r) => ({
    name: r.bucket,
    count: r.companies,
  }));
  const expByFieldData = experienceByField.map((r) => ({
    name: r.field,
    count: r.avg_years,
  }));

  return (
    <div className="space-y-8">
      {/* Section 1: Work Type */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Work Arrangement
        </h2>
        <BarChartCard
          title="Work Arrangement"
          data={workTypeData}
          color="#7c3aed"
          horizontal
          maxItems={10}
        />
      </section>

      {/* Section 2: Experience Demand */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Experience Demand
        </h2>
        <BarChartCard
          title="Experience Required"
          data={expBucketData}
          color="#059669"
          maxItems={10}
        />
      </section>

      {/* Section 3: Company Concentration */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Company Concentration
        </h2>
        <BarChartCard
          title="Company Size by Job Postings"
          data={companyConcentrationData}
          color="#0284c7"
          horizontal
          maxItems={10}
        />
      </section>

      {/* Section 4: Field × Location */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Field × Location (Outside Nairobi)
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Top Field + Location Combinations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="pb-3 pr-4 font-medium text-zinc-500">#</th>
                  <th className="pb-3 pr-4 font-medium text-zinc-500">Field</th>
                  <th className="pb-3 pr-4 font-medium text-zinc-500">Location</th>
                  <th className="pb-3 font-medium text-zinc-500 text-right">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {fieldLocationCombos.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2.5 pr-4 text-zinc-400">{i + 1}</td>
                    <td className="py-2.5 pr-4 font-medium">{row.field}</td>
                    <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-400">{row.location}</td>
                    <td className="py-2.5 text-right">{row.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: Avg Experience by Field */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Average Experience by Field
        </h2>
        <BarChartCard
          title="Avg Years Experience Required by Field"
          data={expByFieldData}
          color="#d97706"
          horizontal
          maxItems={12}
        />
      </section>

      {/* Section 6: Top Qualification per Field */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Top Qualification per Field
        </h2>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Most Required Qualification by Field (Top 10 Fields)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="pb-3 pr-4 font-medium text-zinc-500">#</th>
                  <th className="pb-3 pr-4 font-medium text-zinc-500">Field</th>
                  <th className="pb-3 pr-4 font-medium text-zinc-500">Top Qualification Required</th>
                  <th className="pb-3 font-medium text-zinc-500 text-right">Job Count</th>
                </tr>
              </thead>
              <tbody>
                {topQualByField.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2.5 pr-4 text-zinc-400">{i + 1}</td>
                    <td className="py-2.5 pr-4 font-medium">{row.field}</td>
                    <td className="py-2.5 pr-4 text-zinc-600 dark:text-zinc-400">
                      {row.qualification}
                    </td>
                    <td className="py-2.5 text-right">{row.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
