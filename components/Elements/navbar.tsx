"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/app/actions/auth";

type NavbarProps = {
  authenticated: boolean;
};

function linkClass(active: boolean) {
  return [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
    active
      ? "bg-zinc-100 text-zinc-950"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
  ].join(" ");
}

export function Navbar({ authenticated }: NavbarProps) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 shadow-sm shadow-emerald-950/5 backdrop-blur-xl">
      <nav
        className="flex min-h-[76px] w-full items-center justify-between gap-3 px-5 sm:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-xl outline-none transition-transform hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-700/20" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-5 w-5">
              <path d="M21 3 3 10.5l6.5 2L11.5 19l3-6L21 3Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m9.5 12.5 11.5-9.5-9.5 11.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">Migration Web</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {authenticated ? (
            <>
              <Link
                href="/dashboard"
                className={linkClass(pathname === "/dashboard")}
                aria-current={pathname === "/dashboard" ? "page" : undefined}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                aria-current={pathname?.startsWith("/dashboard/profile") ? "page" : undefined}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    pathname?.startsWith("/dashboard/profile")
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-zinc-300 bg-zinc-100 text-zinc-500",
                  ].join(" ")}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <circle cx="12" cy="8" r="4" strokeLinecap="round" />
                    <path d="M5 20c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
                  </svg>
                </span>
                Profile
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 transition-all hover:-translate-y-px hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                aria-current={pathname === "/login" ? "page" : undefined}
              >
                Login
              </Link>
              <Link
                href="/register"
                aria-current={pathname === "/register" ? "page" : undefined}
                className={[
                  "rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
                  pathname === "/register"
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-emerald-700 bg-emerald-700 text-white hover:border-emerald-800 hover:bg-emerald-800",
                ].join(" ")}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
