import { HomeHeader } from "@/components/home-header";
import { auth } from "@/auth";
import {
  DashboardPreview,
  FeatureGrid,
  JourneySection,
  PlatformDetails,
  ProblemSection,
  ScamCheckerHighlight,
} from "@/components/home/home-content-sections";
import { FinalCta } from "@/components/home/final-cta";
import { HomeHero } from "@/components/home/home-hero";

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#2e86c1] from-10% via-[#8ecdf1] via-55% to-[#f3fafe] dark:from-[#07142b] dark:from-10% dark:via-[#0d2340] dark:via-55% dark:to-[#14304a]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%]">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-[#16324c] dark:via-[#16324c]/90" />
        <div className="absolute -bottom-24 -left-[10%] h-64 w-[70%] rounded-full bg-white/80 blur-2xl dark:bg-white/10" />
        <div className="absolute -bottom-28 left-[30%] h-72 w-[80%] rounded-full bg-white/85 blur-3xl dark:bg-white/[0.12]" />
        <div className="absolute -bottom-20 right-[-15%] h-64 w-[65%] rounded-full bg-white/80 blur-2xl dark:bg-white/10" />
      </div>

      <HomeHeader authenticated={Boolean(session?.user)} />

      <main className="relative z-10">
        <HomeHero />
        <ProblemSection />
        <JourneySection />
        <FeatureGrid />
        <ScamCheckerHighlight />
        <PlatformDetails />
        <DashboardPreview />
        <FinalCta />
      </main>
    </div>
  );
}
