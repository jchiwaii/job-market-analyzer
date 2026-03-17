"use client";

import { useMemo, useState, type ReactNode } from "react";
import BarChartCard from "@/components/charts/BarChartCard";
import PieChartCard from "@/components/charts/PieChartCard";
import type {
  CompanyConcentrationRow,
  ExperienceBucketRow,
  ExperienceByFieldRow,
  FieldLocationRow,
  QualificationByFieldRow,
  WorkTypeRow,
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
  const [comboQuery, setComboQuery] = useState("");
  const [qualificationQuery, setQualificationQuery] = useState("");
  const normalizedComboQuery = comboQuery.trim().toLowerCase();
  const normalizedQualificationQuery = qualificationQuery.trim().toLowerCase();

  const workTypeData = workTypes.map((row) => ({ name: row.category, count: row.count }));
  const expBucketData = experienceBuckets.map((row) => ({ name: row.bucket, count: row.count }));
  const companyConcentrationData = companyConcentration.map((row) => ({
    name: row.bucket,
    count: row.companies,
  }));
  const expByFieldData = experienceByField.map((row) => ({
    name: row.field,
    count: row.avg_years,
  }));

  const visibleCombos = useMemo(
    () =>
      fieldLocationCombos.filter((row) => {
        if (!normalizedComboQuery) return true;
        const target = `${row.field} ${row.location}`.toLowerCase();
        return target.includes(normalizedComboQuery);
      }),
    [fieldLocationCombos, normalizedComboQuery]
  );

  const visibleQualifications = useMemo(
    () =>
      topQualByField.filter((row) => {
        if (!normalizedQualificationQuery) return true;
        const target = `${row.field} ${row.qualification}`.toLowerCase();
        return target.includes(normalizedQualificationQuery);
      }),
    [topQualByField, normalizedQualificationQuery]
  );

  const visibleComboTotal = visibleCombos.reduce((sum, row) => sum + row.count, 0);
  const visibleComboMax = Math.max(...visibleCombos.map((row) => row.count), 1);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-2xl border border-[#D6E1EE] bg-gradient-to-r from-[#F5FAF4] via-white to-[#EEF4FA] p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#58706A]">
              Narrative Layer
            </p>
            <h2 className="mt-1 text-[17px] font-semibold text-[#24302C]">
              Insight + Illustration Blocks
            </h2>
          </div>
          <span className="inline-flex w-fit items-center rounded-full border border-[#C8DCD2] bg-[#ECF4E9] px-3 py-1 text-[11px] font-semibold text-[#1E4841]">
            Text placeholders ready
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <InsightNarrativeCard
            step="Important Insight 01"
            title="Add your first key market takeaway"
            beforeText="Use this space to explain what the audience should notice before they look at the illustration."
            afterText="Add the important insight right after the illustration to explain why this trend matters."
            illustration={<DemandPulseIllustration />}
          />
          <InsightNarrativeCard
            step="Important Insight 02"
            title="Add your second key market takeaway"
            beforeText="Use this setup text to frame the context, assumption, or trend direction before the visual cue."
            afterText="Add the important insight after the visual to interpret the signal and recommend an action."
            illustration={<MomentumFlowIllustration />}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <BarChartCard
          title="Work Arrangement Distribution"
          data={workTypeData}
          color="#1E4841"
          horizontal
          maxItems={8}
          dashboardStyle
          dashboardVariant="focus"
          className="xl:col-span-2"
        />
        <PieChartCard title="Experience Bucket Mix" data={expBucketData} maxItems={7} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BarChartCard
          title="Company Concentration by Posting Volume"
          data={companyConcentrationData}
          color="#2F5F90"
          horizontal
          maxItems={10}
          dashboardStyle
        />
        <BarChartCard
          title="Average Years Experience by Field"
          data={expByFieldData}
          color="#9F6A1F"
          horizontal
          maxItems={12}
          dashboardStyle
        />
      </div>

      <section className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-[17px] font-semibold text-[#24302C]">
            Field x Location Hotspots (Outside Nairobi)
          </h3>
          <label className="relative w-full sm:w-[280px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#6B726F]">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={comboQuery}
              onChange={(e) => setComboQuery(e.target.value)}
              placeholder="Search field or location"
              className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] pr-3 pl-9 text-sm text-[#24302C] outline-none placeholder:text-[#6B726F] focus:border-[#1E4841]"
            />
          </label>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-[#ECF4E9]">
                <th className="w-[72px] rounded-l-md px-4 py-3 font-medium text-[#6B726F]">#</th>
                <th className="px-4 py-3 font-medium text-[#6B726F]">Field</th>
                <th className="px-4 py-3 font-medium text-[#6B726F]">Location</th>
                <th className="w-[120px] px-4 py-3 text-right font-medium text-[#6B726F]">Jobs</th>
                <th className="w-[220px] rounded-r-md px-4 py-3 font-medium text-[#6B726F]">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8E6]">
              {visibleCombos.map((row, i) => {
                const pct =
                  visibleComboTotal > 0
                    ? ((row.count / visibleComboTotal) * 100).toFixed(1)
                    : "0.0";
                const barWidth = Math.max(6, Math.min(100, (row.count / visibleComboMax) * 100));

                return (
                  <tr key={`${row.field}-${row.location}`}>
                    <td className="px-4 py-4 text-[#6B726F]">{i + 1}</td>
                    <td className="px-4 py-4 font-medium text-[#24302C]">{row.field}</td>
                    <td className="px-4 py-4 text-[#6B726F]">{row.location}</td>
                    <td className="px-4 py-4 text-right font-semibold text-[#24302C]">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="ml-auto w-[184px]">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#6B726F]">Share</span>
                          <span className="text-[11px] font-semibold text-[#24302C]">{pct}%</span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-[4px]">
                          <div className="bg-[#1E4841]" style={{ width: `${barWidth}%` }} />
                          <div className="bg-[#BBF49C]" style={{ width: `${100 - barWidth}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {visibleCombos.map((row, i) => {
            const pct =
              visibleComboTotal > 0 ? ((row.count / visibleComboTotal) * 100).toFixed(1) : "0.0";
            const barWidth = Math.max(6, Math.min(100, (row.count / visibleComboMax) * 100));

            return (
              <div
                key={`${row.field}-${row.location}`}
                className="rounded-xl border border-[#E4E8E6] p-3"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#24302C]">{row.field}</p>
                    <p className="text-xs text-[#6B726F]">
                      #{i + 1} · {row.location}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#24302C]">{pct}%</span>
                </div>

                <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-[4px]">
                  <div className="bg-[#1E4841]" style={{ width: `${barWidth}%` }} />
                  <div className="bg-[#BBF49C]" style={{ width: `${100 - barWidth}%` }} />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B726F]">Jobs</span>
                  <span className="font-semibold text-[#24302C]">{row.count.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>

        {visibleCombos.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[#E4E8E6] p-4 text-sm text-[#6B726F]">
            No field-location hotspots match this search.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#E4E8E6] bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="text-[17px] font-semibold text-[#24302C]">
            Most Required Qualification by Field
          </h3>
          <label className="relative w-full sm:w-[280px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#6B726F]">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={qualificationQuery}
              onChange={(e) => setQualificationQuery(e.target.value)}
              placeholder="Search field or qualification"
              className="h-9 w-full rounded-full border border-[#E4E8E6] bg-[#F1F0F0] pr-3 pl-9 text-sm text-[#24302C] outline-none placeholder:text-[#6B726F] focus:border-[#1E4841]"
            />
          </label>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-[#ECF4E9]">
                <th className="w-[72px] rounded-l-md px-4 py-3 font-medium text-[#6B726F]">#</th>
                <th className="px-4 py-3 font-medium text-[#6B726F]">Field</th>
                <th className="px-4 py-3 font-medium text-[#6B726F]">Top Qualification</th>
                <th className="w-[140px] rounded-r-md px-4 py-3 text-right font-medium text-[#6B726F]">
                  Jobs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8E6]">
              {visibleQualifications.map((row, i) => (
                <tr key={`${row.field}-${row.qualification}`}>
                  <td className="px-4 py-4 text-[#6B726F]">{i + 1}</td>
                  <td className="px-4 py-4 font-medium text-[#24302C]">{row.field}</td>
                  <td className="px-4 py-4 text-[#6B726F]">{row.qualification}</td>
                  <td className="px-4 py-4 text-right">
                    <span className="inline-flex items-center rounded-md bg-[#1E4841] px-2.5 py-1 text-xs font-semibold text-[#BBF49C]">
                      {row.count.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {visibleQualifications.map((row, i) => (
            <div
              key={`${row.field}-${row.qualification}`}
              className="rounded-xl border border-[#E4E8E6] p-3"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#24302C]">{row.field}</p>
                  <p className="text-xs text-[#6B726F]">#{i + 1}</p>
                </div>
                <span className="inline-flex items-center rounded-md bg-[#1E4841] px-2 py-1 text-xs font-semibold text-[#BBF49C]">
                  {row.count.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-[#6B726F]">
                <span className="font-semibold text-[#24302C]">Top qualification:</span>{" "}
                {row.qualification}
              </p>
            </div>
          ))}
        </div>

        {visibleQualifications.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[#E4E8E6] p-4 text-sm text-[#6B726F]">
            No qualifications match this search.
          </div>
        )}
      </section>
    </div>
  );
}

interface InsightNarrativeCardProps {
  step: string;
  title: string;
  beforeText: string;
  afterText: string;
  illustration: ReactNode;
}

function InsightNarrativeCard({
  step,
  title,
  beforeText,
  afterText,
  illustration,
}: InsightNarrativeCardProps) {
  return (
    <article className="rounded-2xl border border-[#D6E1EE] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#58706A]">{step}</p>
      <h3 className="mt-2 text-sm font-semibold text-[#24302C]">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-[#5E6B77]">{beforeText}</p>

      <div className="mt-4 rounded-xl border border-[#E4E8E6] bg-[#F8FBF7] p-3">{illustration}</div>

      <div className="mt-3 rounded-lg border border-dashed border-[#C8DCD2] bg-[#ECF4E9] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1E4841]">
          Important Insight
        </p>
        <p className="mt-1 text-sm text-[#2F3C38]">{afterText}</p>
      </div>
    </article>
  );
}

function DemandPulseIllustration() {
  return (
    <svg viewBox="0 0 280 120" className="h-[120px] w-full" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="279" height="119" rx="12" fill="#F8FBF7" stroke="#E4E8E6" />
      <path d="M24 90H256" stroke="#D3DDD8" strokeWidth="2" />
      <path d="M24 72L72 60L120 68L168 42L216 50L256 28" stroke="#1E4841" strokeWidth="3" />
      <circle cx="168" cy="42" r="5" fill="#1E4841" />
      <circle cx="168" cy="42" r="10" stroke="#BBF49C" strokeWidth="4" />
      <rect x="180" y="18" width="76" height="28" rx="8" fill="#1E4841" />
      <text x="218" y="36" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ECF4E9">
        Demand Spike
      </text>
    </svg>
  );
}

function MomentumFlowIllustration() {
  return (
    <svg viewBox="0 0 280 120" className="h-[120px] w-full" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="279" height="119" rx="12" fill="#F8FBF7" stroke="#E4E8E6" />
      <rect x="24" y="26" width="58" height="68" rx="10" fill="#EAF1F8" />
      <rect x="96" y="40" width="58" height="54" rx="10" fill="#ECF4E9" />
      <rect x="168" y="18" width="58" height="76" rx="10" fill="#FBF3E8" />
      <path d="M86 60H92" stroke="#6B726F" strokeWidth="2" />
      <path d="M158 56H164" stroke="#6B726F" strokeWidth="2" />
      <path d="M228 32H252" stroke="#1E4841" strokeWidth="3" />
      <path d="M246 26L252 32L246 38" stroke="#1E4841" strokeWidth="3" />
      <text x="239" y="54" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1E4841">
        Momentum
      </text>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
