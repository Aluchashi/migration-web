import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm font-medium text-emerald-700">Dashboard</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">
        Welcome, {user.name ?? "there"}.
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600">
        Build your career profile, then compare practical country and job options.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Link href="/dashboard/profile" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-zinc-950">Career profile</h2>
            <span className={profile ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-amber-700"}>
              {profile ? "Saved" : "Not started"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Add your work history, skills, languages, budget, and destination preferences.</p>
        </Link>

        <Link href="/dashboard/career-matcher" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-zinc-950">Career &amp; Country Matcher</h2>
            <span className="text-sm font-medium text-zinc-500">{matchCount} saved</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Generate country fit scores, suitable job paths, and a requirements checklist.</p>
        </Link>

        <Link href="/dashboard/skill-gap" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-zinc-950">Skill Gap Analyzer</h2>
            <span className="text-sm font-medium text-zinc-500">{reportCount} saved</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Prioritize the skills, training, and qualifications needed for a target role.</p>
        </Link>

        <Link href="/dashboard/legal-guidance" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-zinc-950">Legal Migration Guidance</h2>
            <span className="text-sm font-medium text-zinc-500">{legalSteps} steps done</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Step-by-step government process, documents, and cost transparency for your destination.</p>
        </Link>

        <Link href="/dashboard/learning-roadmap" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-zinc-950">Learning Roadmap</h2>
            <span className="text-sm font-medium text-zinc-500">Plan your path</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">An ordered study and training plan to close your skill gaps for a target role abroad.</p>
        </Link>

        <Link href="/dashboard/scam-checker" className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-semibold text-zinc-950">Scam Risk Checker</h2>
            <span className="text-sm font-medium text-zinc-500">Stay safe</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Screen a recruitment agency against common warning signs before you pay.</p>
        </Link>
      </div>
    </main>
  );
}
