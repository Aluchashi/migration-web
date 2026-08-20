"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/career-matcher", label: "Career matcher" },
  { href: "/dashboard/skill-gap", label: "Skill gap" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-zinc-200 bg-white">
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6" aria-label="Dashboard">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

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
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
