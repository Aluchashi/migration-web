export type SuggestedCountry = {
  country: string;
  matchScore: number;
  reasons: string;
};

export type SuggestedJob = {
  job: string;
  eligibility: string;
  expectedSalaryRange: string;
};

export type CareerMatchResult = {
  suggestedCountries: SuggestedCountry[];
  suggestedJobs: SuggestedJob[];
  missingRequirements: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result && result.length <= maxLength ? result : null;
}

export function parseCareerMatch(value: unknown): CareerMatchResult | null {
  if (!isRecord(value)) return null;

  const countries = value.suggestedCountries;
  const jobs = value.suggestedJobs;
  const requirements = value.missingRequirements;

  if (!Array.isArray(countries) || !Array.isArray(jobs) || !Array.isArray(requirements)) {
    return null;
  }

  if (countries.length === 0 || countries.length > 8 || jobs.length === 0 || jobs.length > 10 || requirements.length > 20) {
    return null;
  }

  const suggestedCountries: SuggestedCountry[] = [];
  for (const item of countries) {
    if (!isRecord(item)) return null;
    const country = cleanString(item.country, 100);
    const reasons = cleanString(item.reasons, 1_000);
    const matchScore = item.matchScore;

    if (
      !country ||
      !reasons ||
      typeof matchScore !== "number" ||
      !Number.isFinite(matchScore) ||
      matchScore < 0 ||
      matchScore > 100
    ) {
      return null;
    }

    suggestedCountries.push({ country, reasons, matchScore: Math.round(matchScore) });
  }

  const suggestedJobs: SuggestedJob[] = [];
  for (const item of jobs) {
    if (!isRecord(item)) return null;
    const job = cleanString(item.job, 160);
    const eligibility = cleanString(item.eligibility, 1_000);
    const expectedSalaryRange = cleanString(item.expectedSalaryRange, 200);

    if (!job || !eligibility || !expectedSalaryRange) return null;
    suggestedJobs.push({ job, eligibility, expectedSalaryRange });
  }

  const missingRequirements: string[] = [];
  for (const item of requirements) {
    const requirement = cleanString(item, 300);
    if (!requirement) return null;
    missingRequirements.push(requirement);
  }

  return { suggestedCountries, suggestedJobs, missingRequirements };
}
