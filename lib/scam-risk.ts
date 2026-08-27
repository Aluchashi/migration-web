export type VerificationStatus =
  | "verified"
  | "unverified"
  | "unknown"
  | "expired"
  | "invalid";

export type DocumentStatus = "verified" | "invalid" | "unknown";

export type RiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "HIGH" | "VERY_HIGH";

export type ScamRiskInput = {
  agencyName: string;
  destinationCountry: string;
  occupation: string;
  offeredSalaryMonthly?: number;
  agencyCost?: number;
  claimedProcessingDays?: number;
  selectionReasons: string[];
  paymentToPersonalAccount: boolean;
  urgentPaymentRequest: boolean;
  guaranteedJob: boolean;
  guaranteedVisa: boolean;
  agencyVerificationStatus: VerificationStatus;
  licenseStatus: VerificationStatus;
  writtenContract: DocumentStatus;
  employerIdentity: DocumentStatus;
  feeBreakdown: DocumentStatus;
};

export type ScamRiskFactor = {
  code: string;
  title: string;
  description: string;
  points: number;
  severity: "info" | "low" | "elevated" | "high";
};

export type ScamRiskResult = {
  score: number;
  level: RiskLevel;
  factors: ScamRiskFactor[];
  informationGaps: string[];
  standardNote: string;
};

export type AlternativeAgencyRecommendation = {
  name: string;
  verified: boolean;
  verificationLabel: string;
  safetyNote: string;
  sourceName: string;
  sourceType: string | null;
  sourceUrl: string | null;
  reason: string;
};

export type ScamRiskAssessmentResponse = {
  agency: {
    name: string;
    found: boolean;
    isVerified: boolean;
    verificationStatus: string;
    freshness: string;
    isCurrent: boolean;
    notes: string[];
    source: {
      name: string;
      type: string | null;
      url: string | null;
      reference: string | null;
      documentUrl: string | null;
      retrievedAt: string | null;
    } | null;
    licenseStatus: string | null;
  };
  risk: ScamRiskResult;
  officialSource: {
    name: string;
    type: string | null;
    url: string | null;
    reference: string | null;
    documentUrl: string | null;
    retrievedAt: string | null;
    freshness: string;
  } | null;
  alternatives: AlternativeAgencyRecommendation[];
};

const SELECTION_REASONS = [
  "lowCost",
  "highSalary",
  "fastProcessing",
  "goodReputation",
  "recommendation",
  "promisedJob",
  "easyVisaProcessing",
] as const;

const STANDARD_NOTE =
  "This screening is a decision aid, not an official verification. Always confirm an agency through the government authority before paying any money.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function levelFor(score: number): RiskLevel {
  if (score <= 0) return "LOW";
  if (score <= 24) return "MODERATE";
  if (score <= 49) return "ELEVATED";
  if (score <= 79) return "HIGH";
  return "VERY_HIGH";
}

function severityFor(points: number): ScamRiskFactor["severity"] {
  if (points >= 25) return "high";
  if (points >= 15) return "elevated";
  return "low";
}

export function validateScamRiskInput(input: unknown): {
  valid: boolean;
  data?: ScamRiskInput;
  errors?: string[];
} {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { valid: false, errors: ["Assessment input must be an object."] };
  }

  const readString = (key: string, max: number, label: string): string => {
    const value = input[key];
    if (value === undefined || value === null) {
      errors.push(`${label} is required.`);
      return "";
    }
    if (typeof value !== "string") {
      errors.push(`${label} must be text.`);
      return "";
    }
    const trimmed = value.trim();
    if (!trimmed) {
      errors.push(`${label} is required.`);
      return "";
    }
    if (trimmed.length > max) {
      errors.push(`${label} is too long.`);
      return trimmed.slice(0, max);
    }
    return trimmed;
  };

  const agencyName = readString("agencyName", 160, "Agency name");
  const destinationCountry = readString("destinationCountry", 100, "Destination country");
  const occupation = readString("occupation", 160, "Occupation");

  const readNumber = (key: string, label: string, max: number): number | undefined => {
    const value = input[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      errors.push(`${label} must be a positive number.`);
      return undefined;
    }
    if (value > max) {
      errors.push(`${label} is too large.`);
      return undefined;
    }
    return value;
  };

  const offeredSalaryMonthly = readNumber("offeredSalaryMonthly", "Offered monthly salary", 100_000_000);
  const agencyCost = readNumber("agencyCost", "Agency cost", 100_000_000);
  const claimedProcessingDays = readNumber("claimedProcessingDays", "Claimed processing days", 3650);
  if (
    input.claimedProcessingDays !== undefined &&
    input.claimedProcessingDays !== null &&
    (typeof input.claimedProcessingDays !== "number" ||
      !Number.isInteger(input.claimedProcessingDays) ||
      input.claimedProcessingDays < 1)
  ) {
    errors.push("Claimed processing days must be a whole number of at least 1.");
  }

  const reasonsRaw = input.selectionReasons;
  const selectionReasons: string[] = [];
  if (Array.isArray(reasonsRaw)) {
    for (const reason of reasonsRaw) {
      if (typeof reason === "string" && (SELECTION_REASONS as readonly string[]).includes(reason)) {
        selectionReasons.push(reason);
      } else if (reason !== undefined && reason !== null) {
        errors.push(`Unknown selection reason: ${String(reason)}.`);
      }
    }
  } else if (reasonsRaw !== undefined) {
    errors.push("Selection reasons must be a list.");
  }

  const readBool = (key: string, label: string): boolean => {
    const value = input[key];
    if (value === undefined || value === null) return false;
    if (typeof value !== "boolean") {
      errors.push(`${label} must be true or false.`);
      return false;
    }
    return value;
  };
  const paymentToPersonalAccount = readBool("paymentToPersonalAccount", "Payment to personal account");
  const urgentPaymentRequest = readBool("urgentPaymentRequest", "Urgent payment request");
  const guaranteedJob = readBool("guaranteedJob", "Guaranteed job");
  const guaranteedVisa = readBool("guaranteedVisa", "Guaranteed visa");

  const readStatus = (
    key: string,
    allowed: readonly string[],
    label: string,
    fallback: string,
  ): string => {
    const value = input[key];
    if (value === undefined || value === null) return fallback;
    if (typeof value !== "string" || !allowed.includes(value)) {
      errors.push(`${label} is invalid.`);
      return fallback;
    }
    return value;
  };
  const agencyVerificationStatus = readStatus(
    "agencyVerificationStatus",
    ["verified", "unverified", "unknown", "expired", "invalid"],
    "Agency verification status",
    "unknown",
  ) as VerificationStatus;
  const licenseStatus = readStatus(
    "licenseStatus",
    ["verified", "unverified", "unknown", "expired", "invalid"],
    "License status",
    "unknown",
  ) as VerificationStatus;
  const writtenContract = readStatus(
    "writtenContract",
    ["verified", "invalid", "unknown"],
    "Contract status",
    "unknown",
  ) as DocumentStatus;
  const employerIdentity = readStatus(
    "employerIdentity",
    ["verified", "invalid", "unknown"],
    "Employer identity",
    "unknown",
  ) as DocumentStatus;
  const feeBreakdown = readStatus(
    "feeBreakdown",
    ["verified", "invalid", "unknown"],
    "Fee breakdown",
    "unknown",
  ) as DocumentStatus;

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      agencyName,
      destinationCountry,
      occupation,
      offeredSalaryMonthly,
      agencyCost,
      claimedProcessingDays,
      selectionReasons,
      paymentToPersonalAccount,
      urgentPaymentRequest,
      guaranteedJob,
      guaranteedVisa,
      agencyVerificationStatus,
      licenseStatus,
      writtenContract,
      employerIdentity,
      feeBreakdown,
    },
  };
}

const AGENCY_CONFIG: Record<
  VerificationStatus,
  { points: number; title: string; desc: string; gap?: string }
> = {
  verified: { points: 0, title: "", desc: "" },
  unknown: {
    points: 10,
    title: "Agency verification not confirmed",
    desc: "We could not confirm this agency's verification status from the information provided.",
    gap: "Agency verification information was not available.",
  },
  unverified: {
    points: 25,
    title: "Agency is unverified",
    desc: "This agency could not be found in the official verified list.",
    gap: "Agency verification information was not available.",
  },
  expired: {
    points: 20,
    title: "Agency licence appears expired",
    desc: "The agency's licence may have expired and should be renewed before you proceed.",
  },
  invalid: {
    points: 40,
    title: "Agency verification is invalid",
    desc: "The agency's verification status is flagged as invalid. Treat this as a serious warning sign.",
  },
};

const LICENSE_CONFIG: Record<VerificationStatus, { points: number; title: string; desc: string; gap?: string }> = {
  verified: { points: 0, title: "", desc: "" },
  unknown: {
    points: 2,
    title: "Licence status not confirmed",
    desc: "The agency licence could not be confirmed from the information provided.",
    gap: "Licence verification information was not available.",
  },
  unverified: { points: 15, title: "Licence is unverified", desc: "The agency licence was not found in the official list." },
  expired: { points: 15, title: "Licence appears expired", desc: "The agency licence may have expired." },
  invalid: {
    points: 25,
    title: "Licence is invalid",
    desc: "The agency licence is flagged as invalid. Treat this as a serious warning sign.",
  },
};

const DOC_CONFIG: Record<DocumentStatus, { points: number; title: string; desc: string; gap?: string }> = {
  verified: { points: 0, title: "", desc: "" },
  unknown: {
    points: 2,
    title: "Document not confirmed",
    desc: "This document could not be confirmed from the information provided.",
    gap: "Verification information was not available.",
  },
  invalid: {
    points: 20,
    title: "Document looks invalid",
    desc: "The provided document is flagged as invalid. Treat this as a warning sign.",
  },
};

export function calculateScamRisk(input: ScamRiskInput): ScamRiskResult {
  const factors: ScamRiskFactor[] = [];
  const informationGaps: string[] = [];
  let score = 0;

  const add = (code: string, title: string, description: string, points: number) => {
    if (points <= 0) return;
    score += points;
    factors.push({ code, title, description, points, severity: severityFor(points) });
  };

  const applyStatus = (
    status: VerificationStatus | DocumentStatus,
    config: Record<string, { points: number; title: string; desc: string; gap?: string }>,
    code: string,
  ) => {
    const entry = config[status];
    if (entry.points > 0) {
      add(code, entry.title, entry.desc, entry.points);
    }
    if (entry.gap) informationGaps.push(entry.gap);
  };

  applyStatus(input.agencyVerificationStatus, AGENCY_CONFIG, `AGENCY_${input.agencyVerificationStatus.toUpperCase()}`);
  applyStatus(input.licenseStatus, LICENSE_CONFIG, `LICENSE_${input.licenseStatus.toUpperCase()}`);
  applyStatus(input.writtenContract, DOC_CONFIG, `CONTRACT_${input.writtenContract.toUpperCase()}`);
  applyStatus(input.employerIdentity, DOC_CONFIG, `EMPLOYER_${input.employerIdentity.toUpperCase()}`);
  applyStatus(input.feeBreakdown, DOC_CONFIG, `FEE_${input.feeBreakdown.toUpperCase()}`);

  if (input.claimedProcessingDays !== undefined && input.claimedProcessingDays <= 7) {
    add(
      "PROCESSING_TIME_UNUSUALLY_FAST",
      "Unusually fast processing promised",
      "Genuine visa processing usually takes longer; very short timelines are a warning sign.",
      15,
    );
  }

  if (
    input.offeredSalaryMonthly &&
    input.offeredSalaryMonthly > 0 &&
    input.agencyCost &&
    input.agencyCost > 0
  ) {
    const ratio = input.agencyCost / input.offeredSalaryMonthly;
    if (ratio >= 10) {
      add(
        "AGENCY_COST_HIGH_RELATIVE_TO_SALARY",
        "Agency cost is very high relative to salary",
        "The charged amount is far above the offered salary, a common overcharging pattern.",
        20,
      );
    } else if (ratio >= 4) {
      add(
        "AGENCY_COST_ELEVATED_RELATIVE_TO_SALARY",
        "Agency cost is elevated relative to salary",
        "The charged amount is high compared with the offered salary. Confirm the fee breakdown.",
        10,
      );
    }
  }

  if (input.paymentToPersonalAccount) {
    add(
      "PAYMENT_TO_PERSONAL_ACCOUNT",
      "Payment requested to a personal account",
      "Legitimate agencies collect fees through official accounts, not personal ones.",
      25,
    );
  }

  if (input.urgentPaymentRequest) {
    add(
      "URGENT_PAYMENT_PRESSURE",
      "Urgent payment pressure",
      "High-pressure demands to pay immediately are a warning sign.",
      20,
    );
  }

  if (input.selectionReasons.includes("lowCost") && input.selectionReasons.includes("highSalary")) {
    add(
      "LOW_COST_HIGH_SALARY_COMBINATION",
      "Low-cost and high-salary claims together",
      "Offers promising both unusually low cost and high salary are often misleading.",
      15,
    );
  }

  if (
    input.guaranteedJob ||
    input.guaranteedVisa ||
    input.selectionReasons.includes("promisedJob") ||
    input.selectionReasons.includes("easyVisaProcessing")
  ) {
    add(
      "GUARANTEED_OUTCOME_LANGUAGE",
      "Guaranteed job or visa language",
      "No agency can guarantee a job or visa; such promises are a strong warning sign.",
      30,
    );
  }

  const finalScore = clampScore(score);
  return {
    score: finalScore,
    level: levelFor(finalScore),
    factors,
    informationGaps,
    standardNote: STANDARD_NOTE,
  };
}

export function assessScamRisk(input: unknown): ScamRiskAssessmentResponse {
  if (!isRecord(input)) {
    throw new Error("Assessment input must be an object");
  }
  const validation = validateScamRiskInput(input);
  if (!validation.valid || !validation.data) {
    throw new Error("Invalid scam risk input.");
  }
  const data = validation.data;
  const risk = calculateScamRisk(data);

  const notes: string[] = [];
  if (data.agencyVerificationStatus === "unknown") notes.push("Agency verification status was not provided.");
  else if (data.agencyVerificationStatus === "invalid") notes.push("This agency's verification status is flagged as invalid.");
  else if (data.agencyVerificationStatus === "unverified") notes.push("This agency was not found in the verified list.");
  else if (data.agencyVerificationStatus === "expired") notes.push("This agency's licence may be expired.");
  else notes.push("This agency appears in the verified list.");

  if (data.licenseStatus === "unknown") notes.push("Licence status was not confirmed.");
  else if (data.licenseStatus === "invalid") notes.push("The agency licence is flagged as invalid.");

  const agency = {
    name: data.agencyName,
    found: data.agencyVerificationStatus !== "unknown" && data.agencyVerificationStatus !== "unverified",
    isVerified: data.agencyVerificationStatus === "verified",
    verificationStatus: data.agencyVerificationStatus,
    freshness: data.agencyVerificationStatus === "verified" ? "Verified record" : "Not confirmed",
    isCurrent: data.agencyVerificationStatus !== "expired",
    notes,
    source: null,
    licenseStatus: data.licenseStatus,
  };

  return {
    agency,
    risk,
    officialSource: null,
    alternatives: [],
  };
}
