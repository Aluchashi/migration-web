export const verificationStatuses = [
  "verified",
  "unverified",
  "unknown",
  "unavailable",
  "expired",
  "invalid",
] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];
export type SelectionReason =
  | "lowCost"
  | "highSalary"
  | "fastProcessing"
  | "goodReputation"
  | "recommendation"
  | "promisedJob"
  | "easyVisaProcessing";
export type RiskSeverity = "low" | "medium" | "high";
export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

export type ScamRiskInput = {
  agencyName: string;
  destinationCountry: string;
  occupation: string;
  offeredSalaryMonthly?: number | null;
  agencyCost?: number | null;
  claimedProcessingDays?: number | null;
  selectionReasons: SelectionReason[];
  agencyVerificationStatus?: VerificationStatus;
  licenseStatus?: VerificationStatus;
  paymentToPersonalAccount?: boolean;
  urgentPaymentRequest?: boolean;
  guaranteedJob?: boolean;
  guaranteedVisa?: boolean;
  writtenContract?: VerificationStatus;
  employerIdentity?: VerificationStatus;
  feeBreakdown?: VerificationStatus;
};

export type RiskFactor = {
  code: string;
  title: string;
  description: string;
  severity: RiskSeverity;
  points: number;
  metadata?: Record<string, string | number | boolean>;
};

export type ScamRiskResult = {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  informationGaps: string[];
};

export type ScamRiskValidation =
  | { valid: true; data: ScamRiskInput }
  | { valid: false; errors: string[] };

const selectionReasons: SelectionReason[] = [
  "lowCost",
  "highSalary",
  "fastProcessing",
  "goodReputation",
  "recommendation",
  "promisedJob",
  "easyVisaProcessing",
];

const maxLengths = {
  agencyName: 160,
  destinationCountry: 100,
  occupation: 160,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanRequiredText(value: unknown, field: string, maxLength: number, errors: string[]) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${field} is required.`);
    return "";
  }

  const result = value.trim();
  if (result.length > maxLength) errors.push(`${field} must be ${maxLength} characters or fewer.`);
  return result;
}

function optionalNumber(
  value: unknown,
  field: string,
  errors: string[],
  maximum: number,
) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > maximum) {
    errors.push(`${field} must be a finite number between 0 and ${maximum}.`);
    return null;
  }
  return value;
}

function optionalStatus(value: unknown, field: string, errors: string[]): VerificationStatus {
  if (value === undefined || value === null) return "unavailable";
  if (typeof value !== "string" || !verificationStatuses.includes(value as VerificationStatus)) {
    errors.push(`${field} must be a supported verification status.`);
    return "unavailable";
  }
  return value as VerificationStatus;
}

function optionalBoolean(value: unknown, field: string, errors: string[]) {
  if (value === undefined || value === null) return false;
  if (typeof value !== "boolean") errors.push(`${field} must be true or false.`);
  return typeof value === "boolean" ? value : false;
}

export function validateScamRiskInput(value: unknown): ScamRiskValidation {
  if (!isRecord(value)) return { valid: false, errors: ["Assessment input must be an object."] };

  const errors: string[] = [];
  const reasonsValue = value.selectionReasons;
  const reasons: SelectionReason[] = [];

  if (!Array.isArray(reasonsValue) || reasonsValue.length > selectionReasons.length) {
    errors.push("selectionReasons must be an array with no more than 7 items.");
  } else {
    for (const reason of reasonsValue) {
      if (typeof reason !== "string" || !selectionReasons.includes(reason as SelectionReason)) {
        errors.push("selectionReasons contains an unsupported reason.");
      } else if (!reasons.includes(reason as SelectionReason)) {
        reasons.push(reason as SelectionReason);
      }
    }
  }

  const data: ScamRiskInput = {
    agencyName: cleanRequiredText(value.agencyName, "agencyName", maxLengths.agencyName, errors),
    destinationCountry: cleanRequiredText(
      value.destinationCountry,
      "destinationCountry",
      maxLengths.destinationCountry,
      errors,
    ),
    occupation: cleanRequiredText(value.occupation, "occupation", maxLengths.occupation, errors),
    offeredSalaryMonthly: optionalNumber(value.offeredSalaryMonthly, "offeredSalaryMonthly", errors, 100_000_000),
    agencyCost: optionalNumber(value.agencyCost, "agencyCost", errors, 100_000_000),
    claimedProcessingDays: optionalNumber(value.claimedProcessingDays, "claimedProcessingDays", errors, 3_650),
    selectionReasons: reasons,
    agencyVerificationStatus: optionalStatus(value.agencyVerificationStatus, "agencyVerificationStatus", errors),
    licenseStatus: optionalStatus(value.licenseStatus, "licenseStatus", errors),
    paymentToPersonalAccount: optionalBoolean(value.paymentToPersonalAccount, "paymentToPersonalAccount", errors),
    urgentPaymentRequest: optionalBoolean(value.urgentPaymentRequest, "urgentPaymentRequest", errors),
    guaranteedJob: optionalBoolean(value.guaranteedJob, "guaranteedJob", errors),
    guaranteedVisa: optionalBoolean(value.guaranteedVisa, "guaranteedVisa", errors),
    writtenContract: optionalStatus(value.writtenContract, "writtenContract", errors),
    employerIdentity: optionalStatus(value.employerIdentity, "employerIdentity", errors),
    feeBreakdown: optionalStatus(value.feeBreakdown, "feeBreakdown", errors),
  };

  if (data.agencyCost !== null && data.offeredSalaryMonthly !== null && data.offeredSalaryMonthly === 0 && data.agencyCost > 0) {
    errors.push("offeredSalaryMonthly cannot be 0 when agencyCost is greater than 0.");
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true, data };
}

function factor(
  code: string,
  title: string,
  description: string,
  severity: RiskSeverity,
  points: number,
  metadata?: RiskFactor["metadata"],
): RiskFactor {
  return { code, title, description, severity, points, metadata };
}

function statusFactor(
  status: VerificationStatus,
  subject: string,
  codePrefix: string,
  weights: Partial<Record<VerificationStatus, number>>,
): RiskFactor | null {
  const points = weights[status] ?? 0;
  if (points === 0) return null;

  const wording = status === "unverified"
    ? "was not found as verified"
    : status === "unknown" || status === "unavailable"
      ? "could not be verified from the information provided"
      : `has a status of ${status}`;
  const severity: RiskSeverity = points >= 25 ? "high" : points >= 15 ? "medium" : "low";
  return factor(
    `${codePrefix}_${status.toUpperCase()}`,
    `${subject} verification needs attention`,
    `${subject} ${wording}. This is an indicator to investigate, not a definitive fraud finding.`,
    severity,
    points,
    { status },
  );
}

export function calculateScamRisk(input: ScamRiskInput): ScamRiskResult {
  const factors: RiskFactor[] = [];
  const addStatusFactor = (
    status: VerificationStatus | undefined,
    subject: string,
    codePrefix: string,
    weights: Partial<Record<VerificationStatus, number>>,
  ) => {
    const result = statusFactor(status ?? "unavailable", subject, codePrefix, weights);
    if (result) factors.push(result);
  };

  addStatusFactor(input.agencyVerificationStatus, "The agency", "AGENCY", {
    unverified: 20,
    unknown: 10,
    unavailable: 10,
    expired: 35,
    invalid: 35,
  });
  addStatusFactor(input.licenseStatus, "The agency license", "LICENSE", {
    unverified: 12,
    unknown: 8,
    unavailable: 8,
    expired: 25,
    invalid: 25,
  });

  if (input.claimedProcessingDays !== null && input.claimedProcessingDays !== undefined && input.claimedProcessingDays <= 7) {
    factors.push(factor(
      "PROCESSING_TIME_UNUSUALLY_FAST",
      "Unusually fast processing claim",
      "A very short claimed processing time can make pressure tactics harder to spot. Confirm the timeline with the relevant official authority.",
      "medium",
      15,
      { claimedProcessingDays: input.claimedProcessingDays },
    ));
  }

  if (input.agencyCost !== null && input.agencyCost !== undefined && input.offeredSalaryMonthly !== null && input.offeredSalaryMonthly !== undefined && input.offeredSalaryMonthly > 0) {
    const salaryRatio = input.agencyCost / input.offeredSalaryMonthly;
    if (salaryRatio >= 12) {
      factors.push(factor("AGENCY_COST_HIGH_RELATIVE_TO_SALARY", "High cost relative to salary", "The requested agency cost is at least twelve months of the stated monthly salary. Request an itemized fee schedule and compare it with official guidance.", "high", 25, { salaryRatio: Number(salaryRatio.toFixed(2)) }));
    } else if (salaryRatio >= 6) {
      factors.push(factor("AGENCY_COST_ELEVATED_RELATIVE_TO_SALARY", "Elevated cost relative to salary", "The requested agency cost is at least six months of the stated monthly salary. Check what is included and whether each charge is permitted.", "medium", 15, { salaryRatio: Number(salaryRatio.toFixed(2)) }));
    }
  }

  if (input.paymentToPersonalAccount) factors.push(factor("PAYMENT_TO_PERSONAL_ACCOUNT", "Payment requested to a personal account", "Payments to a personal account make it harder to establish who received the money. Confirm the recipient through an official agency channel before paying.", "high", 25));
  if (input.urgentPaymentRequest) factors.push(factor("URGENT_PAYMENT_PRESSURE", "Pressure to pay urgently", "Urgency can reduce the time available to verify the agency, employer, contract, and payment instructions.", "medium", 15));
  if (input.guaranteedJob || input.guaranteedVisa || input.selectionReasons.includes("promisedJob") || input.selectionReasons.includes("easyVisaProcessing")) {
    factors.push(factor("GUARANTEED_OUTCOME_LANGUAGE", "Guaranteed job or visa outcome", "No recruiter can guarantee every employment or visa outcome. Verify the offer and application process independently.", "high", 25));
  }
  if (input.selectionReasons.includes("lowCost") && input.selectionReasons.includes("highSalary")) {
    factors.push(factor("LOW_COST_HIGH_SALARY_COMBINATION", "Unusually attractive combination of claims", "Low cost and high salary claims together deserve independent comparison with official job and migration information.", "medium", 10));
  }

  addStatusFactor(input.writtenContract, "The written contract", "CONTRACT", { invalid: 20, expired: 15, unverified: 10, unknown: 0, unavailable: 0 });
  addStatusFactor(input.employerIdentity, "The employer identity", "EMPLOYER", { invalid: 20, expired: 15, unverified: 10, unknown: 0, unavailable: 0 });
  addStatusFactor(input.feeBreakdown, "The fee breakdown", "FEE_BREAKDOWN", { invalid: 15, expired: 10, unverified: 8, unknown: 0, unavailable: 0 });

  const informationGaps: string[] = [];
  if (["unknown", "unavailable"].includes(input.agencyVerificationStatus ?? "unavailable")) informationGaps.push("Agency verification information was not available.");
  if (["unknown", "unavailable"].includes(input.licenseStatus ?? "unavailable")) informationGaps.push("License verification information was not available.");
  if (["unknown", "unavailable"].includes(input.writtenContract ?? "unavailable")) informationGaps.push("Written contract status was not provided.");
  if (["unknown", "unavailable"].includes(input.employerIdentity ?? "unavailable")) informationGaps.push("Employer identity status was not provided.");
  if (["unknown", "unavailable"].includes(input.feeBreakdown ?? "unavailable")) informationGaps.push("Fee breakdown status was not provided.");
  if (input.offeredSalaryMonthly === null || input.offeredSalaryMonthly === undefined) informationGaps.push("Offered salary was not provided.");
  if (input.agencyCost === null || input.agencyCost === undefined) informationGaps.push("Agency cost was not provided.");

  const score = Math.min(100, Math.max(0, factors.reduce((total, current) => total + current.points, 0)));
  const level: RiskLevel = score >= 75 ? "VERY_HIGH" : score >= 50 ? "HIGH" : score >= 25 ? "MODERATE" : "LOW";
  return { score, level, factors, informationGaps };
}

export function assessScamRisk(value: unknown): ScamRiskResult {
  const validation = validateScamRiskInput(value);
  if (!validation.valid) {
    throw new Error(`Invalid scam risk assessment: ${validation.errors.join(" ")}`);
  }
  return calculateScamRisk(validation.data);
}