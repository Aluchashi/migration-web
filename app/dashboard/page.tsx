import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { OverviewCards } from "@/components/Page3-Dashboard/overview-cards";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, matchCount, reportCount, legalSteps] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } }),
    prisma.careerMatch.count({ where: { userId: user.id } }),
    prisma.skillGapReport.count({ where: { userId: user.id } }),
    prisma.legalStepProgress.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm font-medium text-emerald-700">Dashboard</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">
        Welcome, {user.name ?? "there"}.
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600">
        Build your career profile, then compare practical country and job options.
      </p>

      <div className="mt-8">
        <OverviewCards
          profileSaved={!!profile}
          matchCount={matchCount}
          reportCount={reportCount}
          legalSteps={legalSteps}
        />
      </div>
    </div>
  );
}
