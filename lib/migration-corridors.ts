import type { REGION_OPTIONS } from "@/lib/profile-options";

export type RegionName = (typeof REGION_OPTIONS)[number];

export type DemandLevel = "high" | "medium" | "low";
export type DataConfidence = "verified" | "estimated";

export type CorridorRequirements = {
  minAge: number;
  maxAge: number;
  minExperienceYears: number;
  minEducationLevel: string | null;
  requiredCertifications: string[];
  languageNames: string[];
  languageLevel: string;
  medicalRequirement: string;
};

export type MigrationCorridor = {
  id: string;
  country: string;
  region: RegionName;
  jobTitle: string;
  category: string;
  demandLevel: DemandLevel;
  confidence: DataConfidence;
  monthlySalaryLabel: string;
  monthlySalaryApproxBDT: number;
  migrationCostLabel: string;
  migrationCostApproxBDT: number;
  timelineMonths: number;
  timelineLabel: string;
  skillKeywords: string[];
  requirements: CorridorRequirements;
  source: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  notes: string;
  confidenceNote?: string;
};

const GAMCA_MEDICAL = "GAMCA/Wafid medical fitness certificate";

export const MIGRATION_CORRIDORS: MigrationCorridor[] = [
  {
    id: "saudi-arabia-electrician",
    country: "Saudi Arabia",
    region: "Middle East",
    jobTitle: "Electrician",
    category: "Construction",
    demandLevel: "high",
    confidence: "estimated",
    monthlySalaryLabel: "SAR 1,200-1,800/month (~35,000-53,000 BDT)",
    monthlySalaryApproxBDT: 44000,
    migrationCostLabel: "~165,000 BDT (within BMET smart-card cost cap, estimated)",
    migrationCostApproxBDT: 165000,
    timelineMonths: 3,
    timelineLabel: "About 3 months (demand letter + visa + GAMCA)",
    skillKeywords: ["electric", "electrical", "wiring", "repair", "installation", "maintenance"],
    requirements: {
      minAge: 21,
      maxAge: 45,
      minExperienceYears: 2,
      minEducationLevel: "SSC",
      requiredCertifications: ["Electrical wiring certificate"],
      languageNames: ["Arabic", "English"],
      languageLevel: "Basic",
      medicalRequirement: GAMCA_MEDICAL,
    },
    source: "BMET demand-letter pattern + BOESL posting history (estimate)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    notes: "Most demanded Gulf trade for Bangladeshi workers; employer usually provides accommodation.",
  },
  {
    id: "uae-driver-light",
    country: "United Arab Emirates",
    region: "Middle East",
    jobTitle: "Light Vehicle Driver",
    category: "Driving/Transport",
    demandLevel: "high",
    confidence: "estimated",
    monthlySalaryLabel: "AED 1,500-2,500/month (~45,000-76,000 BDT)",
    monthlySalaryApproxBDT: 60000,
    migrationCostLabel: "~210,000 BDT incl. license conversion (estimated)",
    migrationCostApproxBDT: 210000,
    timelineMonths: 4,
    timelineLabel: "3-6 months incl. UAE license conversion",
    skillKeywords: ["driving", "driver", "license", "vehicle", "transport", "delivery"],
    requirements: {
      minAge: 23,
      maxAge: 45,
      minExperienceYears: 3,
      minEducationLevel: null,
      requiredCertifications: ["Valid driving license (5+ years old preferred)"],
      languageNames: ["Arabic", "English"],
      languageLevel: "Basic",
      medicalRequirement: GAMCA_MEDICAL,
    },
    source: "UAE MOHRE skill profiles + BMET clearance data (estimate)",
    sourceUrl: "https://www.mohre.gov.ae",
    lastVerifiedDate: "2026-08-01",
    notes: "RTA license conversion in UAE is mandatory after arrival.",
  },
  {
    id: "qatar-construction-helper",
    country: "Qatar",
    region: "Middle East",
    jobTitle: "Construction Helper",
    category: "Construction",
    demandLevel: "high",
    confidence: "estimated",
    monthlySalaryLabel: "QAR 800-1,200/month (~24,000-36,000 BDT)",
    monthlySalaryApproxBDT: 30000,
    migrationCostLabel: "~130,000 BDT (govt-set cap for Qatar, estimated)",
    migrationCostApproxBDT: 130000,
    timelineMonths: 2,
    timelineLabel: "Fastest corridor: about 2 months",
    skillKeywords: ["construction", "concrete", "masonry", "scaffolding", "labour", "labor", "site"],
    requirements: {
      minAge: 21,
      maxAge: 50,
      minExperienceYears: 1,
      minEducationLevel: null,
      requiredCertifications: [],
      languageNames: ["English"],
      languageLevel: "Basic",
      medicalRequirement: GAMCA_MEDICAL,
    },
    source: "Qatar Migrant Workers Welfare + BMET demand list (estimate)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    notes: "Low entry barrier; physically demanding outdoor work in heat.",
  },
  {
    id: "malaysia-factory-operator",
    country: "Malaysia",
    region: "Southeast Asia",
    jobTitle: "Factory Machine Operator",
    category: "Manufacturing",
    demandLevel: "high",
    confidence: "estimated",
    monthlySalaryLabel: "MYR 1,500-1,900/month (~40,000-51,000 BDT)",
    monthlySalaryApproxBDT: 45000,
    migrationCostLabel: "~185,000 BDT (G2G channel, estimated)",
    migrationCostApproxBDT: 185000,
    timelineMonths: 3,
    timelineLabel: "About 3 months (calling visa + PLKS)",
    skillKeywords: ["machine", "assembly", "production", "operator", "packing", "factory"],
    requirements: {
      minAge: 20,
      maxAge: 40,
      minExperienceYears: 1,
      minEducationLevel: "SSC",
      requiredCertifications: [],
      languageNames: ["English"],
      languageLevel: "Basic",
      medicalRequirement: "FSMM medical screening (approved clinics)",
    },
    source: "MALB/G2G recruitment framework + BOESL announcements (estimate)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    notes: "Recruitment runs through government-to-government channel; avoid private agents claiming shortcuts.",
  },
  {
    id: "oman-cleaner",
    country: "Oman",
    region: "Middle East",
    jobTitle: "Facility Cleaner",
    category: "Domestic Work",
    demandLevel: "medium",
    confidence: "estimated",
    monthlySalaryLabel: "OMR 120-160/month (~33,000-44,000 BDT)",
    monthlySalaryApproxBDT: 38000,
    migrationCostLabel: "~95,000 BDT (lowest-cost Gulf corridor, estimated)",
    migrationCostApproxBDT: 95000,
    timelineMonths: 2,
    timelineLabel: "About 2 months",
    skillKeywords: ["cleaning", "housekeeping", "sanitation", "clean"],
    requirements: {
      minAge: 21,
      maxAge: 45,
      minExperienceYears: 0,
      minEducationLevel: null,
      requiredCertifications: [],
      languageNames: ["Arabic", "English"],
      languageLevel: "None",
      medicalRequirement: GAMCA_MEDICAL,
    },
    source: "Oman MoL SD-listed occupations + BMET statistics (estimate)",
    sourceUrl: "https://www.bmet.gov.bd",
    lastVerifiedDate: "2026-08-01",
    notes: "No prior experience required; often bundled accommodation in facility contracts.",
  },
  {
    id: "korea-eps-production-worker",
    country: "South Korea",
    region: "East Asia",
    jobTitle: "Production Worker (EPS E-9)",
    category: "Manufacturing",
    demandLevel: "high",
    confidence: "verified",
    confidenceNote: "EPS system rules are public and stable",
    monthlySalaryLabel: "KRW 2.0-2.6M/month (~170,000-225,000 BDT)",
    monthlySalaryApproxBDT: 195000,
    migrationCostLabel: "~350,000 BDT total incl. TOPIK + airfare (estimated)",
    migrationCostApproxBDT: 350000,
    timelineMonths: 9,
    timelineLabel: "8-12 months (EPS-TOPIK + roster + visa)",
    skillKeywords: ["production", "machine", "assembly", "factory", "welding", "operating"],
    requirements: {
      minAge: 18,
      maxAge: 39,
      minExperienceYears: 1,
      minEducationLevel: null,
      requiredCertifications: [],
      languageNames: ["Korean"],
      languageLevel: "Intermediate",
      medicalRequirement: "EPS medical examination (KOICA-standard panel)",
    },
    source: "EPS Operating Regulations (HRD Korea + BMET G2G) - official",
    sourceUrl: "https://www.hrdkorea.or.kr",
    lastVerifiedDate: "2026-08-01",
    notes: "Selection is score-based and transparent; passing EPS-TOPIK is mandatory. Highest legal salary among MVP corridors.",
  },
  {
    id: "germany-ausbildung-electrical",
    country: "Germany",
    region: "Europe",
    jobTitle: "Electrical Vocational Trainee (Ausbildung)",
    category: "IT/Technology",
    demandLevel: "medium",
    confidence: "estimated",
    monthlySalaryLabel: "EUR 1,000-1,300 stipend/month (~115,000-150,000 BDT)",
    monthlySalaryApproxBDT: 130000,
    migrationCostLabel: "~480,000 BDT incl. language + blocked account top-up (estimated)",
    migrationCostApproxBDT: 480000,
    timelineMonths: 12,
    timelineLabel: "12+ months (B1 German + contract + visa)",
    skillKeywords: ["electric", "electrical", "wiring", "technical", "apprentice", "training"],
    requirements: {
      minAge: 18,
      maxAge: 30,
      minExperienceYears: 0,
      minEducationLevel: "HSC",
      requiredCertifications: [],
      languageNames: ["German"],
      languageLevel: "Intermediate",
      medicalRequirement: "Standard Schengen visa medical declaration",
    },
    source: "Germany Skilled Immigration Act (Fachkräfteeinwanderungsgesetz) + BOESL pilot",
    sourceUrl: "https://www.make-it-in-germany.com",
    lastVerifiedDate: "2026-08-01",
    notes: "Stretch option: leads to recognized EU qualification and long-term settlement after training.",
  },
];

export const CORRIDOR_CATEGORIES = Array.from(new Set(MIGRATION_CORRIDORS.map((c) => c.category)));
