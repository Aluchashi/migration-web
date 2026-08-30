"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare02Icon,
  GlobalSearchIcon,
  ChartUpIcon,
  GraduationCapIcon,
  Navigation04Icon,
  ShieldAlertIcon,
  UserIcon,
  Settings01Icon,
  Logout02Icon,
  SidebarLeft01Icon,
  LanguagesIcon,
} from "@hugeicons/core-free-icons";

import { logout } from "@/app/actions/auth";
import { BrandLogo } from "@/components/Elements/brand-logo";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainNav = [
  {
    titleKey: "overview",
    href: "/dashboard",
    icon: DashboardSquare02Icon,
  },
  {
    titleKey: "careerMatcher",
    href: "/dashboard/career-matcher",
    icon: GlobalSearchIcon,
  },
  { titleKey: "skillGap", href: "/dashboard/skill-gap", icon: ChartUpIcon },
  {
    titleKey: "learningRoadmap",
    href: "/dashboard/learning-roadmap",
    icon: GraduationCapIcon,
  },
  {
    titleKey: "legalGuidance",
    href: "/dashboard/legal-guidance",
    icon: Navigation04Icon,
  },
  { titleKey: "scamChecker", href: "/dashboard/scam-checker", icon: ShieldAlertIcon },
];

const bottomNav = [
  { titleKey: "profile", href: "/dashboard/profile", icon: UserIcon },
  { titleKey: "settings", href: "/dashboard/settings", icon: Settings01Icon },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();
  const locale = useLocale();
  const t = useTranslations("Dashboard.sidebar");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const switchTo = (next: "en" | "bn") => {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  };

  const actionButtonClass =
    "flex h-8 w-8 shrink-0 items-center justify-center gap-0.5 rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-end gap-1 px-2 py-1">
          <button
            type="button"
            onClick={() => switchTo(locale === "bn" ? "en" : "bn")}
            className={actionButtonClass}
            aria-label={locale === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
            title={locale === "bn" ? "English" : "বাংলা"}
          >
            <HugeiconsIcon icon={LanguagesIcon} className="size-5" strokeWidth={2} />
            <span className="text-[10px] font-bold">
              {locale === "bn" ? "EN" : "বাং"}
            </span>
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
            className="group-data-[state=collapsed]:mx-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <HugeiconsIcon icon={SidebarLeft01Icon} className="size-5" strokeWidth={2} />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-6 flex items-center group-data-[state=collapsed]:hidden">
            <BrandLogo className="h-8 w-auto" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item.href)}
                    tooltip={t(item.titleKey)}
                    render={<Link href={item.href} />}
                  >
                    <HugeiconsIcon icon={item.icon} />
                    <span>{t(item.titleKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mb-6 mt-4">
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={isActive(item.href)}
                tooltip={t(item.titleKey)}
                render={<Link href={item.href} />}
              >
                <HugeiconsIcon icon={item.icon} />
                <span>{t(item.titleKey)}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton
                tooltip={t("logout")}
                className="text-red-600 hover:!bg-red-500/10 hover:!text-red-700 focus-visible:!ring-red-500"
                render={<button type="submit" />}
              >
                <HugeiconsIcon icon={Logout02Icon} />
                <span>{t("logout")}</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}