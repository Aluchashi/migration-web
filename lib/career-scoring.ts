import {
  MIGRATION_CORRIDORS,
  type DataConfidence,
  type DemandLevel,
  type MigrationCorridor,
} from "@/lib/migration-corridors";
import { BUDGETS, PROFICIENCY_LEVELS } from "@/lib/profile-options";

export type ProfileLanguage = { name: string; proficiency: string };

export type ProfileSnapshot = {
  age: number | null;
  skills: string[];
  softSkills: string[];
  languages: ProfileLanguage[];
  experienceYears: number;
  jobTitles: string[];
  industries: string[];
  educationLevels: string[];
  budgetBand: string | null;
  preferredRegions: string[];
  timeline: string | null;
};

export type ScoreWeights = {
  skill: number;
  language: number;
  experience: number;
  budget: number;
  priority: number;
};

export const DEFAULT_WEIGHTS: ScoreWeights = {
  skill: 30,
  language: 20,
  experience: 20,
  budget: 15,
  priority: 15,
};

export const WEIGHT_FIELDS: Array<{ key: keyof ScoreWeights; label: string; hint: string }> = [
  { key: "skill", label: "Skill match", hint: "How much your trade skills matter" },
  { key: "language", label: "Language", hint: "Destination language readiness" },
  { key: "experience", label: "Experience", hint: "Years of relevant work" },
  { key: "budget", label: "Budget fit", hint: "Affording migration cost" },
  { key: "priority", label: "Priority alignment", hint: "Your region & timeline preference" },
];

export type MatchSubscores = {
  skill: number;
  language: number;
  experience: number;
  budget: number;
  priority: number;
};

export type EligibilityStatus = "eligible" | "partial" | "not-yet";
export type MatchTier = "best-fit" | "achievable-soon" | "stretch-option";

export type EligibilityCheck = {
  key: string;
  label: string;
  passed: boolean;
  closeable: boolean;
  detailBn: string;
};

export type WhatIfScenario = {
  action: string;
  projectedScore: number;
};

export type MatchResult = {
  corridorId: string;
  country: string;
  region: string;
  jobTitle: string;
  category: string;
  tier: MatchTier;
  matchScore: number;
  eligibility: EligibilityStatus;
  subscores: MatchSubscores;
  checks: EligibilityCheck[];
  missingRequirements: string[];
  demandLevel: DemandLevel;
  confidence: DataConfidence;
  confidenceNote?: string;
  salaryLabel: string;
  salaryApproxBDT: number;
  costLabel: string;
  costApproxBDT: number;
  timelineMonths: number;
  timelineLabel: string;
  explanationBn: string[];
  source: string;
  lastVerifiedDate: string;
  whatIf: WhatIfScenario[];
};

const GENERIC_CERT_WORDS = new Set([
  "certificate",
  "certification",
  "license",
  "licence",
  "valid",
  "years",
  "yearsold",
  "preferred",
  "with",
  "old",
]);

const educationRanks: Record<string, number> = {
  SSC: 0,
  HSC: 1,
  Diploma: 2,
  "Vocational/TVET Certificate": 2,
  "Trade License": 2,
  "Bachelor's": 3,
  "Master's": 4,
  Other: -1,
};

const budgetUpperBounds: number[] = [50_000, 150_000, 300_000, Number.POSITIVE_INFINITY];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeWeights(weights: ScoreWeights): ScoreWeights {
  const total =
    weights.skill + weights.language + weights.experience + weights.budget + weights.priority;
  if (total <= 0) return { ...DEFAULT_WEIGHTS };
  return {
    skill: weights.skill / total,
    language: weights.language / total,
    experience: weights.experience / total,
    budget: weights.budget / total,
    priority: weights.priority / total,
  };
}

function profileText(profile: ProfileSnapshot) {
  return [...profile.skills, ...profile.softSkills, ...profile.jobTitles, ...profile.industries]
    .join(" ")
    .toLowerCase();
}

function languageLevelIndex(level: string) {
  const index = PROFICIENCY_LEVELS.indexOf(level);
  return index === -1 ? 0 : index;
}

function bestUserLanguageLevel(profile: ProfileSnapshot, names: string[]) {
  let best = -1;
  for (const language of profile.languages) {
    const heldName = language.name.trim().toLowerCase();
    if (!heldName || !names.includes(heldName)) continue;
    best = Math.max(best, languageLevelIndex(language.proficiency));
  }
  return best;
}

function budgetUpperBound(band: string | null) {
  if (!band) return null;
  const index = BUDGETS.indexOf(band);
  if (index === -1) return null;
  return budgetUpperBounds[index] ?? null;
}

function skillSubscore(corridor: MigrationCorridor, profile: ProfileSnapshot) {
  const text = profileText(profile);
  const matched = corridor.skillKeywords.filter((keyword) => text.includes(keyword));
  let score = (matched.length / corridor.skillKeywords.length) * 80;
  if (profile.industries.some((industry) => industry.toLowerCase() === corridor.category.toLowerCase())) {
    score += 20;
  }
  return { score: clamp(score), matched };
}

function languageSubscore(corridor: MigrationCorridor, profile: ProfileSnapshot) {
  const requiredIndex = languageLevelIndex(corridor.requirements.languageLevel);
  const names = corridor.requirements.languageNames.map((name) => name.toLowerCase());
  const best = bestUserLanguageLevel(profile, names);

  if (best >= requiredIndex) return { score: 100, met: true, hasAny: best >= 0, best };
  if (best >= 0) {
    const ratio = (best + 1) / (requiredIndex + 1);
    return { score: clamp(ratio * 75), met: false, hasAny: true, best };
  }
  return { score: 10, met: requiredIndex === 0, hasAny: false, best: -1 };
}

function experienceSubscore(corridor: MigrationCorridor, years: number) {
  const min = corridor.requirements.minExperienceYears;
  if (years >= min) return { score: 100, met: true };
  const gap = min - years;
  return { score: clamp(Math.max(10, 100 - gap * 30)), met: false, gap };
}

function budgetSubscore(corridor: MigrationCorridor, profile: ProfileSnapshot) {
  const upper = budgetUpperBound(profile.budgetBand);
  if (upper === null) return { score: 40, affordable: null };
  const cost = corridor.migrationCostApproxBDT;
  if (upper >= cost) return { score: 100, affordable: true };
  return { score: clamp(Math.max(5, (70 * upper) / cost)), affordable: false };
}

function prioritySubscore(corridor: MigrationCorridor, profile: ProfileSnapshot) {
  const regionPoints = profile.preferredRegions.includes(corridor.region) ? 65 : 15;

  let timelinePoints = 22;
  switch (profile.timeline) {
    case "Immediately":
      timelinePoints = corridor.timelineMonths <= 2 ? 35 : corridor.timelineMonths <= 6 ? 18 : 4;
      break;
    case "Within 3 months":
      timelinePoints = corridor.timelineMonths <= 3 ? 35 : corridor.timelineMonths <= 6 ? 20 : 8;
      break;
    case "Within 6-12 months":
      timelinePoints = corridor.timelineMonths <= 12 ? 32 : corridor.timelineMonths <= 6 ? 26 : 12;
      break;
    default:
      timelinePoints = 22;
  }

  return { score: clamp(regionPoints + timelinePoints), regionPreferred: regionPoints === 65 };
}

type Overrides = {
  certificationsMet?: boolean;
  languageMet?: boolean;
  experienceYears?: number;
};

function evaluate(
  corridor: MigrationCorridor,
  profile: ProfileSnapshot,
  weights: ScoreWeights,
  overrides: Overrides = {},
) {
  const norm = normalizeWeights(weights);

  const skill = skillSubscore(corridor, profile);
  const language = languageSubscore(corridor, profile);
  const effectiveYears = overrides.experienceYears ?? profile.experienceYears;
  const experience = experienceSubscore(corridor, effectiveYears);
  const budget = budgetSubscore(corridor, profile);
  const priority = prioritySubscore(corridor, profile);

  const subscores: MatchSubscores = {
    skill: skill.score,
    language: overrides.languageMet ? 100 : language.score,
    experience: experience.score,
    budget: budget.score,
    priority: priority.score,
  };

  const matchScore = clamp(
    subscores.skill * norm.skill +
      subscores.language * norm.language +
      subscores.experience * norm.experience +
      subscores.budget * norm.budget +
      subscores.priority * norm.priority,
  );

  return { skill, languageRaw: language, experience, budget, priority, subscores, matchScore };
}

function buildChecks(
  corridor: MigrationCorridor,
  profile: ProfileSnapshot,
  evaluated: ReturnType<typeof evaluate>,
  overrides: Overrides,
): EligibilityCheck[] {
  const checks: EligibilityCheck[] = [];
  const requirements = corridor.requirements;

  if (profile.age === null) {
    checks.push({
      key: "age",
      label: `Age ${requirements.minAge}-${requirements.maxAge}`,
      passed: true,
      closeable: false,
      detailBn: `আপনার জন্ম তারিখ প্রোফাইলে নেই — এই চাকরিতে বয়স ${requirements.minAge}-${requirements.maxAge} এর মধ্যে হতে হবে। প্রোফাইলে জন্ম তারিখ যোগ করলে যাচাই হবে।`,
    });
  } else if (profile.age >= requirements.minAge && profile.age <= requirements.maxAge) {
    checks.push({
      key: "age",
      label: `Age ${requirements.minAge}-${requirements.maxAge}`,
      passed: true,
      closeable: false,
      detailBn: `আপনার বয়স ${profile.age} — শর্ত (${requirements.minAge}-${requirements.maxAge}) পূরণ হয়েছে।`,
    });
  } else {
    checks.push({
      key: "age",
      label: `Age ${requirements.minAge}-${requirements.maxAge}`,
      passed: false,
      closeable: false,
      detailBn: `আপনার বয়স ${profile.age}, কিন্তু এই ভিসা ক্যাটাগরিতে ${requirements.minAge}-${requirements.maxAge} বয়সসীমা কঠোরভাবে প্রযোজ্য।`,
    });
  }

  if (requirements.minEducationLevel) {
    const requiredRank = educationRanks[requirements.minEducationLevel] ?? -1;
    const bestRank = profile.educationLevels.reduce(
      (max, level) => Math.max(max, educationRanks[level] ?? -1),
      -1,
    );
    if (bestRank >= requiredRank) {
      checks.push({
        key: "education",
        label: `Min education: ${requirements.minEducationLevel}`,
        passed: true,
        closeable: false,
        detailBn: `আপনার সর্বোচ্চ শিক্ষাগত যোগ্যতা ন্যূনতম ${requirements.minEducationLevel} শর্ত পূরণ করেছে।`,
      });
    } else {
      checks.push({
        key: "education",
        label: `Min education: ${requirements.minEducationLevel}`,
        passed: false,
        closeable: true,
        detailBn: `এই পদে ন্যূনতম ${requirements.minEducationLevel} পাস লাগবে — আপনার প্রোফাইলে সমমানের ডিগ্রি পাওয়া যায়নি।`,
      });
    }
  }

  const expGap = requirements.minExperienceYears - (overrides.experienceYears ?? profile.experienceYears);
  if (expGap <= 0) {
    checks.push({
      key: "experience",
      label: `${requirements.minExperienceYears}+ yrs experience`,
      passed: true,
      closeable: false,
      detailBn: `আপনার ${profile.experienceYears} বছরের অভিজ্ঞতা ন্যূনতম ${requirements.minExperienceYears} বছরের শর্ত পূরণ করেছে।`,
    });
  } else {
    checks.push({
      key: "experience",
      label: `${requirements.minExperienceYears}+ yrs experience`,
      passed: false,
      closeable: expGap <= 2,
      detailBn:
        expGap <= 2
          ? `আরও ${expGap} বছর কাজের অভিজ্ঞতা জমা দিলে এই শর্ত পূরণ হবে (ন্যূনতম ${requirements.minExperienceYears} বছর)।`
          : `ন্যূনতম ${requirements.minExperienceYears} বছরের অভিজ্ঞতা লাগবে — আপনার চেয়ে ${expGap} বছর বেশি, এটি দ্রুত পূরণ করা কঠিন।`,
    });
  }

  if (requirements.requiredCertifications.length > 0) {
    const text = profileText(profile);
    const missingCerts = requirements.requiredCertifications.filter((cert) => {
      if (overrides.certificationsMet) return false;
      const tokens = cert
        .toLowerCase()
        .replace(/[^a-z\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !GENERIC_CERT_WORDS.has(word));
      if (tokens.length === 0) return false;
      return !tokens.every((token) => text.includes(token));
    });

    if (missingCerts.length === 0) {
      checks.push({
        key: "certifications",
        label: requirements.requiredCertifications.join(", "),
        passed: true,
        closeable: false,
        detailBn: `প্রয়োজনীয় সার্টিফিকেট আপনার প্রোফাইলে পাওয়া গেছে।`,
      });
    } else {
      checks.push({
        key: "certifications",
        label: missingCerts.join(", "),
        passed: false,
        closeable: true,
        detailBn: `${missingCerts.join(", ")} লাগবে — সাধারণত ৩-৬ মাসের ট্রেড কোর্স দিয়ে অর্জন করা যায়।`,
      });
    }
  }

  if (requirements.languageLevel !== "None" || evaluated.languageRaw.best >= 0) {
    const requiredIndex = languageLevelIndex(requirements.languageLevel);
    const met = overrides.languageMet || evaluated.languageRaw.met;
    const namesLabel = requirements.languageNames.join(" অথবা ");
    const levelLabel = requirements.languageLevel;

    if (met) {
      checks.push({
        key: "language",
        label: `${namesLabel} (${levelLabel})`,
        passed: true,
        closeable: false,
        detailBn: `ভাষার শর্ত (${namesLabel} — ${levelLabel}) পূরণ হয়েছে।`,
      });
    } else {
      checks.push({
        key: "language",
        label: `${namesLabel} (${levelLabel})`,
        passed: false,
        closeable: requiredIndex <= languageLevelIndex("Fluent"),
        detailBn:
          evaluated.languageRaw.hasAny
            ? `${namesLabel}-এ আপনার দক্ষতা ${levelLabel} স্তরের চেয়ে কম — গোছানো কোর্স করলে ব্যবধান কমানো সম্ভব।`
            : `${namesLabel} ভাষার ${levelLabel} স্তর দক্ষতা লাগবে — শুরু থেকে প্রস্তুতি নিতে হবে।`,
      });
    }
  }

  return checks;
}

function buildExplanationBn(
  corridor: MigrationCorridor,
  profile: ProfileSnapshot,
  evaluated: ReturnType<typeof evaluate>,
  checks: EligibilityCheck[],
): string[] {
  const lines: string[] = [];

  const skillLine = evaluated.skill.matched.length
    ? `আপনার প্রোফাইলে "${evaluated.skill.matched.join("\", \"")}" — এই ধরনের দক্ষতা ওই চাকরির সঙ্গে মিলেছে।`
    : `এই চাকরির মূল দক্ষতার সঙ্গে আপনার প্রোফাইলের সরাসরি মিল পাওয়া যায়নি।`;
  lines.push(skillLine);

  const experienceCheck = checks.find((check) => check.key === "experience");
  if (experienceCheck) lines.push(experienceCheck.detailBn);

  const languageCheck = checks.find((check) => check.key === "language");
  if (languageCheck) lines.push(languageCheck.detailBn);

  const educationCheck = checks.find((check) => check.key === "education");
  if (educationCheck) lines.push(educationCheck.detailBn);

  if (evaluated.budget.affordable === true) {
    lines.push(`আপনার বাজেট ব্যান্ড এই করিডরের আনুমানিক খরচের মধ্যে ধরা হয়েছে।`);
  } else if (evaluated.budget.affordable === false) {
    lines.push(`সতর্কতা: আনুমানিক খরচ আপনার নির্বাচিত বাজেটের চেয়ে বেশি — ঋণ/পরিবারের সহায়তা ছাড়া ঝুঁকিপূর্ণ।`);
  }

  lines.push(
    evaluated.priority.regionPreferred
      ? `এই দেশটি আপনার পছন্দের অঞ্চলের তালিকায় আছে।`
      : `এই দেশটি আপনার পছন্দের অঞ্চলের বাইরে — তবু স্কোর অন্যান্য ফ্যাক্টরে দেখানো হয়েছে।`,
  );

  lines.push(`মেডিক্যাল: ${corridor.requirements.medicalRequirement} লাগবে।`);

  const confidenceLabel =
    corridor.confidence === "verified"
      ? "নথিভুক্ত/অফিসিয়াল সোর্স থেকে যাচাইকৃত"
      : "আনুমানিক (limited data) — সিদ্ধান্তের আগে BMET/দূতাবাসে যাচাই করুন";
  lines.push(`ডেটা সোর্স: ${corridor.source} • হালনাগাদ: ${corridor.lastVerifiedDate} • ${confidenceLabel}.`);

  return lines;
}

function buildWhatIf(
  corridor: MigrationCorridor,
  profile: ProfileSnapshot,
  weights: ScoreWeights,
  baseScore: number,
  checks: EligibilityCheck[],
): WhatIfScenario[] {
  const scenarios: WhatIfScenario[] = [];

  const certFailed = checks.find((check) => check.key === "certifications" && !check.passed);
  if (certFailed) {
    const projected = evaluate(corridor, profile, weights, { certificationsMet: true }).matchScore;
    if (projected > baseScore) {
      scenarios.push({ action: certFailed.label, projectedScore: projected });
    }
  }

  const languageFailed = checks.find((check) => check.key === "language" && !check.passed);
  if (languageFailed) {
    const projected = evaluate(corridor, profile, weights, { languageMet: true }).matchScore;
    if (projected > baseScore) {
      scenarios.push({ action: `${languageFailed.label} অর্জন`, projectedScore: projected });
    }
  }

  const experienceFailed = checks.find(
    (check) => check.key === "experience" && !check.passed && check.closeable,
  );
  if (experienceFailed) {
    const projected = evaluate(corridor, profile, weights, {
      experienceYears: corridor.requirements.minExperienceYears,
    }).matchScore;
    if (projected > baseScore) {
      scenarios.push({
        action: `${corridor.requirements.minExperienceYears} বছর অভিজ্ঞতা`,
        projectedScore: projected,
      });
    }
  }

  return scenarios.sort((a, b) => b.projectedScore - a.projectedScore).slice(0, 3);
}

export function computeMatchForCorridor(
  corridor: MigrationCorridor,
  profile: ProfileSnapshot,
  weights: ScoreWeights,
): MatchResult {
  const evaluated = evaluate(corridor, profile, weights);
  const checks = buildChecks(corridor, profile, evaluated, {});

  const hasHardFail = checks.some((check) => !check.passed && !check.closeable);
  const hasCloseableFail = checks.some((check) => !check.passed && check.closeable);

  const eligibility: EligibilityStatus = hasHardFail ? "not-yet" : hasCloseableFail ? "partial" : "eligible";

  const missingRequirements = checks.filter((check) => !check.passed).map((check) => check.label);

  return {
    corridorId: corridor.id,
    country: corridor.country,
    region: corridor.region,
    jobTitle: corridor.jobTitle,
    category: corridor.category,
    tier: eligibility === "eligible" ? "best-fit" : eligibility === "partial" ? "achievable-soon" : "stretch-option",
    matchScore: evaluated.matchScore,
    eligibility,
    subscores: evaluated.subscores,
    checks,
    missingRequirements,
    demandLevel: corridor.demandLevel,
    confidence: corridor.confidence,
    confidenceNote: corridor.confidenceNote,
    salaryLabel: corridor.monthlySalaryLabel,
    salaryApproxBDT: corridor.monthlySalaryApproxBDT,
    costLabel: corridor.migrationCostLabel,
    costApproxBDT: corridor.migrationCostApproxBDT,
    timelineMonths: corridor.timelineMonths,
    timelineLabel: corridor.timelineLabel,
    explanationBn: buildExplanationBn(corridor, profile, evaluated, checks),
    source: corridor.source,
    lastVerifiedDate: corridor.lastVerifiedDate,
    whatIf: hasHardFail ? [] : buildWhatIf(corridor, profile, weights, evaluated.matchScore, checks),
  };
}

export function computeMatches(profile: ProfileSnapshot, weights: ScoreWeights): MatchResult[] {
  return MIGRATION_CORRIDORS.map((corridor) => computeMatchForCorridor(corridor, profile, weights)).sort(
    (a, b) => b.matchScore - a.matchScore,
  );
}

export type TierGroups = {
  bestFit: MatchResult[];
  achievableSoon: MatchResult[];
  stretchOptions: MatchResult[];
};

export function groupByTier(results: MatchResult[]): TierGroups {
  return {
    bestFit: results.filter((result) => result.tier === "best-fit"),
    achievableSoon: results.filter((result) => result.tier === "achievable-soon"),
    stretchOptions: results.filter((result) => result.tier === "stretch-option"),
  };
}

export function findEssentialGaps(profile: ProfileSnapshot): string[] {
  const gaps: string[] = [];
  if (profile.skills.length === 0 && profile.softSkills.length === 0) {
    gaps.push("Add at least a few skills");
  }
  if (profile.educationLevels.length === 0) {
    gaps.push("Add at least one education entry");
  }
  if (profile.languages.length === 0) {
    gaps.push("Add your language proficiencies");
  }
  return gaps;
}
