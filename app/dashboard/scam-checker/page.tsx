import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ScamRiskChecker } from "@/components/Page9-ScamDetect/scam-risk-checker";
import { getAuthenticatedUser } from "@/lib/auth-user";

export const metadata: Metadata = { title: "Scam Risk Checker | Porizayi" };

export default async function ScamRiskPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm font-medium text-emerald-700">Before you trust an agency</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Scam Risk Checker</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
        Check a recruitment agency against common warning signs before you pay or sign anything.
      </p>
      <div className="mt-7">
        <ScamRiskChecker />
      </div>
    </div>
  );
}
