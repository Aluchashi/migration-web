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

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold text-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4"
        >
          Migration Web
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
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
                aria-current={pathname.startsWith("/dashboard/profile") ? "page" : undefined}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    pathname.startsWith("/dashboard/profile")
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
                className={linkClass(pathname === "/login")}
                aria-current={pathname === "/login" ? "page" : undefined}
              >
                Login
              </Link>
              <Link
                href="/register"
                aria-current={pathname === "/register" ? "page" : undefined}
                className={[
                  "rounded-md border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
                  pathname === "/register"
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-zinc-950 bg-zinc-950 text-white hover:border-zinc-800 hover:bg-zinc-800",
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
