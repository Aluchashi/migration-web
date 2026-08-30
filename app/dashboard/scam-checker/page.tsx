import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ScamRiskChecker } from "@/components/Page9-ScamDetect/scam-risk-checker";
import { getAuthenticatedUser } from "@/lib/auth-user";

export const metadata: Metadata = { title: "Scam Risk Checker | Porizayi" };

export default async function ScamRiskPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const t = await getTranslations("Dashboard");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm font-medium text-emerald-700">{t("scamCheck.firstLine")}</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl dark:text-zinc-50">
        {t("scamCheck.title")}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("scamCheck.description")}
      </p>
      <div className="mt-7">
        <ScamRiskChecker />
      </div>
    </div>
  );
}