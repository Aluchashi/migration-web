export type AgencyVerificationStatus =
  | "VERIFIED"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED"
  | "INVALID"
  | "UNMATCHED"
  | "UNAVAILABLE";

export type AgencyFreshness = "CURRENT" | "STALE" | "UNKNOWN" | "UNAVAILABLE";

export type AgencySourceType = "REGISTRY" | "OFFICIAL_NOTICE" | "OFFICIAL_DOCUMENT";

export type AgencyRecord = {
  id: string;
  name: string;
  normalizedName: string;
  status: AgencyVerificationStatus;
  freshness: AgencyFreshness;
  sourceName: string;
  sourceType: AgencySourceType;
  sourceUrl: string;
  sourceReference?: string | null;
  sourceDocumentUrl?: string | null;
  retrievedAt: string;
  legalName?: string | null;
  tradingName?: string | null;
  countryOfRegistration?: string | null;
  licenseStatus?: string | null;
  isSynthetic?: boolean;
};

export type AgencyLookupResult = {
  found: boolean;
  agency: AgencyRecord | null;
  normalizedName: string;
  isVerified: boolean;
  verificationStatus: AgencyVerificationStatus;
  freshness: AgencyFreshness;
  isCurrent: boolean;
  sourceName: string;
  sourceType: AgencySourceType | null;
  sourceUrl: string | null;
  sourceReference: string | null;
  sourceDocumentUrl: string | null;
  retrievedAt: string | null;
  isFraudulent: boolean;
  notes: string[];
  licenseStatus: string | null;
};

export type RecommendationInput = {
  destinationCountry: string;
  occupation: string;
  selectionReasons: string[];
};

export type AlternativeAgencyRecommendation = {
  name: string;
  verified: boolean;
  verificationLabel: string;
  safetyNote: string;
  sourceName: string;
  sourceType: AgencySourceType | null;
  sourceUrl: string | null;
  reason: string;
};

function normalizeAgencyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const syntheticAgencies: AgencyRecord[] = [
  {
    id: "synthetic-verified-1",
    name: "Verified Migration Services",
    normalizedName: "verified migration services",
    status: "VERIFIED",
    freshness: "CURRENT",
    sourceName: "Synthetic test dataset",
    sourceType: "REGISTRY",
    sourceUrl: "https://example.com/official/registry",
    sourceReference: "REG-2026-1024",
    sourceDocumentUrl: "https://example.com/official/registry/verified-migration-services",
    retrievedAt: "2026-08-23T09:00:00.000Z",
    legalName: "Verified Migration Services Ltd.",
    countryOfRegistration: "Bangladesh",
    licenseStatus: "ACTIVE",
    isSynthetic: true,
  },
  {
    id: "synthetic-stale-1",
    name: "Stale Verification Group",
    normalizedName: "stale verification group",
    status: "VERIFIED",
    freshness: "STALE",
    sourceName: "Synthetic test dataset",
    sourceType: "OFFICIAL_NOTICE",
    sourceUrl: "https://example.com/official/notice",
    sourceReference: "NOTICE-2025-033",
    sourceDocumentUrl: "https://example.com/official/notice/stale-verification-group",
    retrievedAt: "2025-01-04T09:00:00.000Z",
    legalName: "Stale Verification Group",
    countryOfRegistration: "Bangladesh",
    licenseStatus: "ACTIVE",
    isSynthetic: true,
  },
  {
    id: "synthetic-expired-1",
    name: "Expired Agency Work",
    normalizedName: "expired agency work",
    status: "EXPIRED",
    freshness: "CURRENT",
    sourceName: "Synthetic test dataset",
    sourceType: "OFFICIAL_NOTICE",
    sourceUrl: "https://example.com/official/notice/expired-agency-work",
    sourceReference: "NOTICE-2026-021",
    sourceDocumentUrl: "https://example.com/official/notice/expired-agency-work/document",
    retrievedAt: "2026-08-21T08:00:00.000Z",
    legalName: "Expired Agency Work",
    countryOfRegistration: "Bangladesh",
    licenseStatus: "EXPIRED",
    isSynthetic: true,
  },
  {
    id: "synthetic-suspended-1",
    name: "Suspended Migration House",
    normalizedName: "suspended migration house",
    status: "SUSPENDED",
    freshness: "CURRENT",
    sourceName: "Synthetic test dataset",
    sourceType: "OFFICIAL_NOTICE",
    sourceUrl: "https://example.com/official/notice/suspended-migration-house",
    sourceReference: "NOTICE-2026-071",
    sourceDocumentUrl: "https://example.com/official/notice/suspended-migration-house/document",
    retrievedAt: "2026-08-20T08:00:00.000Z",
    legalName: "Suspended Migration House",
    countryOfRegistration: "Bangladesh",
    licenseStatus: "SUSPENDED",
    isSynthetic: true,
  },
  {
    id: "synthetic-unavailable-1",
    name: "Unavailable Verification Agency",
    normalizedName: "unavailable verification agency",
    status: "UNAVAILABLE",
    freshness: "UNAVAILABLE",
    sourceName: "Synthetic test dataset",
    sourceType: "OFFICIAL_DOCUMENT",
    sourceUrl: "https://example.com/official/document/unavailable-verification-agency",
    sourceReference: "DOC-2026-081",
    sourceDocumentUrl: "https://example.com/official/document/unavailable-verification-agency/file",
    retrievedAt: "2026-08-23T08:00:00.000Z",
    legalName: "Unavailable Verification Agency",
    countryOfRegistration: "Bangladesh",
    licenseStatus: "UNKNOWN",
    isSynthetic: true,
  },
];

export function lookupAgencyProfile(name: string): AgencyLookupResult {
  const normalizedName = normalizeAgencyName(name);

  if (!normalizedName) {
    return {
      found: false,
      agency: null,
      normalizedName,
      isVerified: false,
      verificationStatus: "UNMATCHED",
      freshness: "UNKNOWN",
      isCurrent: false,
      sourceName: "",
      sourceType: null,
      sourceUrl: null,
      sourceReference: null,
      sourceDocumentUrl: null,
      retrievedAt: null,
      isFraudulent: false,
      notes: ["No agency name was provided."],
      licenseStatus: null,
    };
  }

  const agency = syntheticAgencies.find((entry) => entry.normalizedName === normalizedName) ?? null;

  if (!agency) {
    return {
      found: false,
      agency: null,
      normalizedName,
      isVerified: false,
      verificationStatus: "UNMATCHED",
      freshness: "UNKNOWN",
      isCurrent: false,
      sourceName: "",
      sourceType: null,
      sourceUrl: null,
      sourceReference: null,
      sourceDocumentUrl: null,
      retrievedAt: null,
      isFraudulent: false,
      notes: ["We could not match this agency against our verified dataset. This is an information gap, not a finding of fraud."],
      licenseStatus: null,
    };
  }

  return {
    found: true,
    agency,
    normalizedName,
    isVerified: agency.status === "VERIFIED",
    verificationStatus: agency.status,
    freshness: agency.freshness,
    isCurrent: agency.freshness === "CURRENT",
    sourceName: agency.sourceName,
    sourceType: agency.sourceType,
    sourceUrl: agency.sourceUrl,
    sourceReference: agency.sourceReference ?? null,
    sourceDocumentUrl: agency.sourceDocumentUrl ?? null,
    retrievedAt: agency.retrievedAt,
    isFraudulent: false,
    notes: [
      agency.isSynthetic
        ? "Synthetic or test data is clearly labeled and is not a real official verification record."
        : "Official source information is available.",
    ],
    licenseStatus: agency.licenseStatus ?? null,
  };
}

export function recommendAlternativeAgencies({
  destinationCountry,
  occupation,
  selectionReasons,
}: RecommendationInput): AlternativeAgencyRecommendation[] {
  const reasons = new Set(selectionReasons.map((reason) => reason.trim()).filter(Boolean));

  const candidates = syntheticAgencies.filter((agency) => agency.status === "VERIFIED" && agency.freshness === "CURRENT");

  const ranked = [...candidates].sort((left, right) => {
    const leftReasonScore = Number(reasons.has("goodReputation")) + Number(reasons.has("recommendation")) + Number(reasons.has("lowCost"));
    const rightReasonScore = Number(reasons.has("goodReputation")) + Number(reasons.has("recommendation")) + Number(reasons.has("lowCost"));
    return rightReasonScore - leftReasonScore;
  });

  return ranked.map((agency) => ({
    name: agency.name,
    verified: true,
    verificationLabel: "verified agency",
    safetyNote: "This lower-risk alternative is based on current verification details and should still be reviewed with the user’s destination and occupation context.",
    sourceName: agency.sourceName,
    sourceType: agency.sourceType,
    sourceUrl: agency.sourceUrl,
    reason:
      destinationCountry && occupation
        ? `Matched to ${destinationCountry} and ${occupation} using the selected reasons: ${Array.from(reasons).join(", ") || "general review"}.`
        : "Matched by available destination and occupation context.",
  }));
}
