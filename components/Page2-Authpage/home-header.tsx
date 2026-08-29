"use client";

import Link from "next/link";

import { UserIcon } from "@/components/Elements/floating-field";
import { SwitchMode } from "@/components/Elements/switch-mode";
import { BrandLogo } from "@/components/Elements/brand-logo";

type HomeHeaderProps = {
  authenticated: boolean;
};

export function HomeHeader({ authenticated }: HomeHeaderProps) {
  return (
    <header className="relative z-20 flex w-full items-center justify-between px-5 py-5 sm:px-8">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-xl outline-none transition-transform duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <BrandLogo className="h-9 w-auto drop-shadow-sm" />
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        <SwitchMode />

        {authenticated ? (
          <Link
            href="/dashboard/profile"
            className="group flex flex-col items-center gap-1 rounded-xl px-2 py-1 outline-none transition-transform duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-white/70"
            aria-label="Your profile"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/70 bg-white/25 text-white backdrop-blur transition-colors group-hover:bg-white/40">
              <UserIcon />
            </span>
            <span className="text-[11px] font-semibold leading-none text-white drop-shadow-sm">
              Profile
            </span>
          </Link>
        ) : null}

        <Link
          href="/register"
          className="rounded-full border border-white/60 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-5"
        >
          Register
        </Link>
      </div>
    </header>
  );
}
