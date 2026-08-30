"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const items = [
  { href: "/dashboard", labelKey: "overview" },
  { href: "/dashboard/profile", labelKey: "profile" },
  { href: "/dashboard/career-matcher", labelKey: "careerMatcher" },
  { href: "/dashboard/skill-gap", labelKey: "skillGap" },
  { href: "/dashboard/legal-guidance", labelKey: "legalGuidance" },
  { href: "/dashboard/learning-roadmap", labelKey: "learningMap" },
  { href: "/dashboard/scam-checker", labelKey: "scamCheck" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations("Dashboard.nav");

  return (
    <div className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6" aria-label="Dashboard">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600",
                active ? "bg-emerald-50 text-emerald-800" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
              ].join(" ")}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}