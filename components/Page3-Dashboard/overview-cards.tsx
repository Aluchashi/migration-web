"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  GlobalSearchIcon,
  ChartUpIcon,
  Navigation04Icon,
  GraduationCapIcon,
  ShieldAlertIcon,
  ArrowUpRight01Icon,
} from "@hugeicons/core-free-icons";

type OverviewCardsProps = {
  profileSaved: boolean;
  matchCount: number;
  reportCount: number;
  legalSteps: number;
};

const ICON_TILE =
  "bg-muted dark:bg-muted/10 mb-4 size-fit rounded-lg p-px";
const ICON_INNER =
  "flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]";
const BADGE_WRAP = "bg-muted dark:bg-muted/10 inline-flex rounded-lg p-0.5";
const BADGE_INNER =
  "text-muted-foreground inline-flex items-center rounded-md bg-white/80 px-2 py-1 text-[10px] font-medium shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.04),0_0px_2px_0_rgba(0,0,0,0.08),0_1px_4px_0_rgba(0,0,0,0.05)]";

export function OverviewCards({
  profileSaved,
  matchCount,
  reportCount,
  legalSteps,
}: OverviewCardsProps) {
  const t = useTranslations("Dashboard.overview");

  const cards = [
    {
      titleKey: "careerProfileTitle",
      href: "/dashboard/profile",
      descKey: "careerProfileDesc",
      icon: UserIcon,
      tint: "text-emerald-500",
      badge: profileSaved ? t("saved") : t("notStarted"),
      badgeClass: profileSaved ? "text-emerald-600" : "",
    },
    {
      titleKey: "matcherTitle",
      href: "/dashboard/career-matcher",
      descKey: "matcherDesc",
      icon: GlobalSearchIcon,
      tint: "text-purple-500",
      badge: t("itemsSaved", { count: matchCount }),
      badgeClass: "",
    },
    {
      titleKey: "skillGapTitle",
      href: "/dashboard/skill-gap",
      descKey: "skillGapDesc",
      icon: ChartUpIcon,
      tint: "text-blue-500",
      badge: t("itemsSaved", { count: reportCount }),
      badgeClass: "",
    },
    {
      titleKey: "legalTitle",
      href: "/dashboard/legal-guidance",
      descKey: "legalDesc",
      icon: Navigation04Icon,
      tint: "text-orange-500",
      badge: t("stepsDone", { count: legalSteps }),
      badgeClass: "",
    },
    {
      titleKey: "roadmapTitle",
      href: "/dashboard/learning-roadmap",
      descKey: "roadmapDesc",
      icon: GraduationCapIcon,
      tint: "text-pink-500",
      badge: t("planPath"),
      badgeClass: "",
    },
    {
      titleKey: "scamTitle",
      href: "/dashboard/scam-checker",
      descKey: "scamDesc",
      icon: ShieldAlertIcon,
      tint: "text-red-500",
      badge: t("staySafe"),
      badgeClass: "",
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="group block rounded-3xl bg-muted/50 p-0 shadow-none ring-0 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
        >
          <div className="p-6">
            <div className={ICON_TILE}>
              <div className={ICON_INNER}>
                <HugeiconsIcon icon={card.icon} className={`h-5 w-5 ${card.tint}`} />
              </div>
            </div>

            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
                {t(card.titleKey)}
              </h3>
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                className="mt-1 size-4 shrink-0 text-zinc-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600"
              />
            </div>

            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t(card.descKey)}
            </p>

            <div className={`${BADGE_WRAP} mt-4`}>
              <div className={`${BADGE_INNER} ${card.badgeClass}`}>
                {card.badge}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}