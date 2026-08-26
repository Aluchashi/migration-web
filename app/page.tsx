import {
  DashboardPreview,
  FeatureGrid,
  JourneySection,
  PlatformDetails,
  ProblemSection,
  ScamCheckerHighlight,
} from "@/components/Page1-Homepage/home-content-sections";
import { FinalCta } from "@/components/Page1-Homepage/final-cta";
import { HomeHero } from "@/components/Page1-Homepage/home-hero";

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
