"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type IconProps = { className?: string };
type NavItem = {
  href: string;
  label: string;
  icon: (props: IconProps) => React.ReactNode;
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: SquaresIcon },
  { href: "/trends", label: "Trends", icon: TrendIcon },
  { href: "/fields", label: "Fields", icon: SwapIcon },
  { href: "/locations", label: "Locations", icon: ReceiptIcon },
  { href: "/companies", label: "Companies", icon: CardIcon },
  { href: "/industry", label: "Industry", icon: CoinsIcon },
  { href: "/insights", label: "Insights", icon: EthIcon },
  { href: "/jobs", label: "All Jobs", icon: NewspaperIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed top-4 left-4 z-50 rounded-xl border border-[#d6dfd4] bg-[#f9fbfa] p-2 text-[#24302c] shadow-sm lg:hidden"
        aria-label="Toggle menu"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-[#1e4841]/20 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-[192px] border-r border-[#d9e2d7] bg-[#ecf4e9] px-4 py-[22px] transition-transform lg:static lg:h-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <header className="flex h-[38px] items-center px-2">
            <div className="flex items-center gap-3">
              <BrandSymbol className="h-[22px] w-[22px]" />
              <span className="text-lg font-bold tracking-tight text-[#24302c]">MyJobMag</span>
            </div>
          </header>

          <nav className="mt-5 flex flex-1 flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex h-10 items-center gap-3 rounded-full px-4 transition-colors ${
                    active
                      ? "bg-[#bbf49c] text-[#24302c]"
                      : "text-[#6b726f] hover:bg-[#e4ece1] hover:text-[#24302c]"
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm font-semibold leading-none">{item.label}</span>

                  {item.badge && (
                    <span className="ml-auto flex items-center gap-2">
                      {item.badge && <Badge>{item.badge}</Badge>}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <PromoCard />
        </div>
      </aside>
    </>
  );
}

function PromoCard() {
  return (
    <div className="relative mt-5 rounded-2xl bg-[#1e4841] p-4 text-[#ecf4e9]">
      <div className="absolute -top-2 right-[-6px] opacity-95">
        <BrandSymbol className="h-[65px] w-[65px]" muted />
      </div>

      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecf4e9]">
        <BrandSymbol className="h-[18px] w-[18px] text-[#1e4841]" mono />
      </div>

      <p className="mt-4 text-sm font-semibold leading-relaxed text-[#bbf49c]">
        About this project
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#c8d9c6]">
        A personal data project scraping and analysing the Kenyan job market using listings from MyJobMag.
      </p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#f73640] px-1 text-[10px] font-semibold leading-none text-[#fbfbfc]">
      {children}
    </span>
  );
}

function BrandSymbol({
  className,
  muted,
  mono,
}: {
  className?: string;
  muted?: boolean;
  mono?: boolean;
}) {
  const dark = mono ? "#1e4841" : muted ? "#bbf49c" : "#1e4841";
  const light = mono ? "#ecf4e9" : muted ? "#ecf4e9" : "#fbfbfc";

  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="17" r="5" fill={dark} />
      <circle cx="17" cy="17" r="5" fill={dark} />
      <circle cx="17" cy="5" r="5" fill={dark} />
      <circle cx="5" cy="5" r="5" fill={dark} />
      <path
        d="M8.5 11.4V10a2.5 2.5 0 0 1 4.9-.8"
        stroke={light}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <rect x="8.2" y="11.1" width="5.8" height="4.6" rx="1.6" fill={light} />
      <circle cx="11.1" cy="13.4" r="0.85" fill={dark} />
    </svg>
  );
}

function SquaresIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="13" y="4" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="4" y="13" width="7" height="7" rx="2" fill="currentColor" />
      <rect x="13" y="13" width="7" height="7" rx="2" fill="currentColor" />
    </svg>
  );
}

function TrendIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 16.5h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 13l4.5-4.5 3 3L18 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SwapIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 5l4 3-4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 16H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 19l-4-3 4-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReceiptIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4h12v16l-3-2-3 2-3-2-3 2V4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5.5" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function CoinsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="10" cy="7" rx="5.5" ry="2.7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 7v6c0 1.5 2.5 2.7 5.5 2.7s5.5-1.2 5.5-2.7V7" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="15.6" cy="12.8" rx="3.9" ry="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11.7 12.8v4.3c0 1.1 1.7 2 3.9 2s3.9-.9 3.9-2v-4.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EthIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.5 6.5 12 12 15.3 17.5 12 12 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 13.3 12 21l5.5-7.7L12 16.6l-5.5-3.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function NewspaperIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
