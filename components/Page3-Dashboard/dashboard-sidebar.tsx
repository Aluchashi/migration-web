"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { title: "Overview", href: "/dashboard", icon: DashboardSquare02Icon },
  { title: "Career Matcher", href: "/dashboard/career-matcher", icon: GlobalSearchIcon },
  { title: "Skill gap", href: "/dashboard/skill-gap", icon: ChartUpIcon },
  {
    title: "Learning roadmap",
    href: "/dashboard/learning-roadmap",
    icon: GraduationCapIcon,
  },
  { title: "Legal Guidance", href: "/dashboard/legal-guidance", icon: Navigation04Icon },
  { title: "Scam Checker", href: "/dashboard/scam-checker", icon: ShieldAlertIcon },
];

const bottomNav = [
  { title: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { title: "Settings", href: "/dashboard/settings", icon: Settings01Icon },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-end px-2 py-1">
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
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <HugeiconsIcon icon={item.icon} />
                    <span>{item.title}</span>
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
                tooltip={item.title}
                render={<Link href={item.href} />}
              >
                <HugeiconsIcon icon={item.icon} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton
                tooltip="Log out"
                className="text-red-600 hover:!bg-red-500/10 hover:!text-red-700 focus-visible:!ring-red-500"
                render={<button type="submit" />}
              >
                <HugeiconsIcon icon={Logout02Icon} />
                <span>Log out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
