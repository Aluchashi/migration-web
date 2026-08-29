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
import { Contact7 } from "@/components/Page1-Homepage/contact-7";
import Footer20 from "@/components/ui/footer-20";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
            repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
            repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
            repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
          `,
        }}
      />
      <div className="relative z-10">
        <HomeHero />
        <ProblemSection />
        <JourneySection />
        <FeatureGrid />
        <ScamCheckerHighlight />
        <PlatformDetails />
        <DashboardPreview />
        <FinalCta />
        <Contact7
          subheading="CONNECT WITH US"
          heading="Let's Start a Conversation"
          nameLabel="Full Name *"
          namePlaceholder="Imran Hasan"
          emailLabel="Email Address *"
          emailPlaceholder="imranhsn.bd@gmail.com"
          phoneLabel="Phone Number *"
          phonePlaceholder="+880 1712 345678"
          enquiryLabel="Enquiry Type *"
          enquiryPlaceholder="Select an enquiry type"
          enquiryOptions={[
            { value: "general", label: "General Inquiry" },
            { value: "support", label: "Technical Support" },
            { value: "sales", label: "Sales & Pricing" },
            { value: "partnership", label: "Partnership Opportunities" },
          ]}
          messageLabel="Message *"
          messagePlaceholder="How can we help you today? Please provide as much detail as possible."
          agreementText="I agree to the privacy policy and terms of service for this communication."
          buttonText="Send Message"
        />
        <Footer20 />
      </div>
    </div>
  );
}
