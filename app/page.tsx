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

export default function Home() {
  return (
    <main>
      <HomeHero />
      <ProblemSection />
      <JourneySection />
      <FeatureGrid />
      <ScamCheckerHighlight />
      <PlatformDetails />
      <DashboardPreview />
      <FinalCta />
    </main>
  );
}
