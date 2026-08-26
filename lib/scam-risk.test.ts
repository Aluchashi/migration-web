import assert from "node:assert/strict";
import test from "node:test";

import {
  assessScamRisk,
  calculateScamRisk,
  type ScamRiskInput,
  validateScamRiskInput,
} from "./scam-risk";

const safeInput: ScamRiskInput = {
  agencyName: "Verified Migration Services",
  destinationCountry: "Germany",
  occupation: "Electrician",
  offeredSalaryMonthly: 250_000,
  agencyCost: 500_000,
  claimedProcessingDays: 30,
  selectionReasons: ["goodReputation"],
  agencyVerificationStatus: "verified",
  licenseStatus: "verified",
  paymentToPersonalAccount: false,
  urgentPaymentRequest: false,
  guaranteedJob: false,
  guaranteedVisa: false,
  writtenContract: "verified",
  employerIdentity: "verified",
  feeBreakdown: "verified",
};

test("minimum possible score is zero", () => {
  const result = calculateScamRisk(safeInput);
  assert.equal(result.score, 0);
  assert.equal(result.level, "LOW");
  assert.deepEqual(result.factors, []);
});

test("maximum possible score is capped at 100", () => {
  const result = assessScamRisk({
    ...safeInput,
    agencyVerificationStatus: "invalid",
    licenseStatus: "invalid",
    claimedProcessingDays: 1,
    agencyCost: 3_000_000,
    offeredSalaryMonthly: 100_000,
    selectionReasons: ["lowCost", "highSalary", "promisedJob", "easyVisaProcessing"],
    paymentToPersonalAccount: true,
    urgentPaymentRequest: true,
    guaranteedJob: true,
    guaranteedVisa: true,
    writtenContract: "invalid",
    employerIdentity: "invalid",
    feeBreakdown: "invalid",
  });
  assert.equal(result.score, 100);
  assert.equal(result.level, "VERY_HIGH");
});

test("score cannot fall below zero", () => {
  const result = calculateScamRisk(safeInput);
  assert.ok(result.score >= 0);
});

test("score cannot exceed 100", () => {
  const result = calculateScamRisk({ ...safeInput, agencyVerificationStatus: "invalid", licenseStatus: "invalid" });
  assert.ok(result.score <= 100);
});

const ruleCases: Array<[string, Partial<ScamRiskInput>, string]> = [
  ["unverified agency", { agencyVerificationStatus: "unverified" }, "AGENCY_UNVERIFIED"],
  ["unknown agency", { agencyVerificationStatus: "unknown" }, "AGENCY_UNKNOWN"],
  ["expired agency", { agencyVerificationStatus: "expired" }, "AGENCY_EXPIRED"],
  ["invalid license", { licenseStatus: "invalid" }, "LICENSE_INVALID"],
  ["unusually fast processing", { claimedProcessingDays: 7 }, "PROCESSING_TIME_UNUSUALLY_FAST"],
  ["high relative cost", { agencyCost: 1_500_000, offeredSalaryMonthly: 100_000 }, "AGENCY_COST_HIGH_RELATIVE_TO_SALARY"],
  ["elevated relative cost", { agencyCost: 600_000, offeredSalaryMonthly: 100_000 }, "AGENCY_COST_ELEVATED_RELATIVE_TO_SALARY"],
  ["personal account", { paymentToPersonalAccount: true }, "PAYMENT_TO_PERSONAL_ACCOUNT"],
  ["urgent payment", { urgentPaymentRequest: true }, "URGENT_PAYMENT_PRESSURE"],
  ["attractive claims", { selectionReasons: ["lowCost", "highSalary"] }, "LOW_COST_HIGH_SALARY_COMBINATION"],
  ["invalid contract", { writtenContract: "invalid" }, "CONTRACT_INVALID"],
  ["invalid employer", { employerIdentity: "invalid" }, "EMPLOYER_INVALID"],
  ["invalid fee breakdown", { feeBreakdown: "invalid" }, "FEE_BREAKDOWN_INVALID"],
];

for (const [name, overrides, code] of ruleCases) {
  test(`triggers ${name}`, () => {
    const result = calculateScamRisk({ ...safeInput, ...overrides });
    assert.ok(result.factors.some((factor) => factor.code === code));
  });
}

const guaranteedOutcomeCases: Array<[string, Partial<ScamRiskInput>]> = [
  ["guaranteed job", { guaranteedJob: true }],
  ["guaranteed visa", { guaranteedVisa: true }],
  ["promised job reason", { selectionReasons: ["promisedJob"] }],
  ["easy visa processing reason", { selectionReasons: ["easyVisaProcessing"] }],
];

for (const [name, overrides] of guaranteedOutcomeCases) {
  test(`triggers guaranteed outcome for ${name}`, () => {
    const result = calculateScamRisk({ ...safeInput, ...overrides });
    assert.ok(result.factors.some((factor) => factor.code === "GUARANTEED_OUTCOME_LANGUAGE"));
  });
}

test("does not trigger guaranteed outcome when all conditions are false", () => {
  const result = calculateScamRisk({
    ...safeInput,
    guaranteedJob: false,
    guaranteedVisa: false,
    selectionReasons: [],
  });
  assert.equal(result.factors.some((factor) => factor.code === "GUARANTEED_OUTCOME_LANGUAGE"), false);
});

test("implemented rules do not trigger when their conditions are false", () => {
  const result = calculateScamRisk(safeInput);
  const codes = result.factors.map((factor) => factor.code);
  for (const [, , code] of ruleCases) assert.equal(codes.includes(code), false);
});

test("unknown verification is an information gap, not a definitive verdict", () => {
  const result = assessScamRisk({ ...safeInput, agencyVerificationStatus: "unknown" });
  assert.equal(result.factors[0]?.points, 10);
  assert.match(result.factors[0]?.description ?? "", /not a definitive fraud finding/);
  assert.ok(result.informationGaps.includes("Agency verification information was not available."));
});

test("missing optional values are accepted safely", () => {
  const validation = validateScamRiskInput({
    agencyName: "Agency",
    destinationCountry: "Canada",
    occupation: "Welder",
    selectionReasons: [],
  });
  assert.equal(validation.valid, true);
  if (validation.valid) assert.equal(calculateScamRisk(validation.data).score, 18);
});

test("rejects malformed input and impossible values", () => {
  const validation = validateScamRiskInput({
    agencyName: " ",
    destinationCountry: "Canada",
    occupation: "Welder",
    offeredSalaryMonthly: -1,
    claimedProcessingDays: Number.NaN,
    selectionReasons: ["not-a-reason"],
    paymentToPersonalAccount: "yes",
  });
  assert.equal(validation.valid, false);
  if (!validation.valid) assert.ok(validation.errors.length >= 4);
  assert.throws(() => assessScamRisk(null), /Assessment input must be an object/);
});

test("accepts boundary values and rejects values just outside them", () => {
  const valid = validateScamRiskInput({
    agencyName: "A".repeat(160),
    destinationCountry: "C".repeat(100),
    occupation: "O".repeat(160),
    claimedProcessingDays: 3_650,
    selectionReasons: [],
  });
  assert.equal(valid.valid, true);

  const invalid = validateScamRiskInput({
    agencyName: "A".repeat(161),
    destinationCountry: "Canada",
    occupation: "Welder",
    claimedProcessingDays: 3_651,
    selectionReasons: [],
  });
  assert.equal(invalid.valid, false);
});

test("repeated calculations are deterministic", () => {
  const first = assessScamRisk({ ...safeInput, urgentPaymentRequest: true, licenseStatus: "unknown" });
  const second = assessScamRisk({ ...safeInput, urgentPaymentRequest: true, licenseStatus: "unknown" });
  assert.deepEqual(first, second);
});