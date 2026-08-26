import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ScamRiskChecker } from "@/components/scam-risk-checker";
import { getAuthenticatedUser } from "@/lib/auth-user";

export const metadata: Metadata = {
  title: "Scam & Offer Risk | Migration Web",
};

export default async function ScamRiskPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="border-b border-zinc-200 pb-7">
        <p className="text-sm font-medium text-emerald-700">Scam &amp; Offer Risk</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Check migration agency risk</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          This assessment highlights risk indicators and verification details. It does not make a definitive fraud accusation.
        </p>
      </div>

      <div className="mt-7">
        <ScamRiskChecker />
      </div>
    </main>
  );
}
