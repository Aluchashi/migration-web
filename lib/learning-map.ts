export type LearningMapPriority = "high" | "medium" | "low";

export type LearningMapResult = {
  target: { country: string; job: string; position: string };
  readinessScore: number;
  existingSkills: Array<{ name: string; level: "strong" | "developing"; reason: string }>;
  skillGaps: Array<{ name: string; priority: LearningMapPriority; reason: string }>;
  roadmap: Array<{
    step: number;
    title: string;
    description: string;
    priority: LearningMapPriority;
    estimatedEffort?: string;
  }>;
  jobReadiness: { strengths: string[]; improvements: string[]; recommendations: string[] };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim() && value.trim().length <= maxLength ? value.trim() : null;
}

function priority(value: unknown): LearningMapPriority | null {
  const result = typeof value === "string" ? value.toLowerCase() : "";
  return result === "high" || result === "medium" || result === "low" ? result : null;
}

function stringList(value: unknown, maximum: number, itemLength = 300): string[] | null {
  if (!Array.isArray(value) || value.length > maximum) return null;
  const values = value.map((item) => text(item, itemLength));
  return values.every(Boolean) ? values as string[] : null;
}

export function parseLearningMap(value: unknown): LearningMapResult | null {
  if (!isRecord(value) || !isRecord(value.target) || !isRecord(value.jobReadiness)) return null;
  const country = text(value.target.country, 100);
  const job = text(value.target.job, 100);
  const position = text(value.target.position, 100);
  const readinessScore = value.readinessScore;
  if (!country || !job || !position || typeof readinessScore !== "number" || !Number.isInteger(readinessScore) || readinessScore < 0 || readinessScore > 100) return null;
  if (!Array.isArray(value.existingSkills) || value.existingSkills.length > 12 || !Array.isArray(value.skillGaps) || value.skillGaps.length > 12 || !Array.isArray(value.roadmap) || value.roadmap.length < 1 || value.roadmap.length > 8) return null;

  const existingSkills = value.existingSkills.map((item) => {
    if (!isRecord(item)) return null;
    const name = text(item.name, 120); const reason = text(item.reason, 500);
    const level = typeof item.level === "string" ? item.level.toLowerCase() : "";
    return name && reason && (level === "strong" || level === "developing") ? { name, reason, level } : null;
  });
  const skillGaps = value.skillGaps.map((item) => {
    if (!isRecord(item)) return null;
    const name = text(item.name, 120); const reason = text(item.reason, 500); const itemPriority = priority(item.priority);
    return name && reason && itemPriority ? { name, reason, priority: itemPriority } : null;
  });
  const roadmap = value.roadmap.map((item, index) => {
    if (!isRecord(item)) return null;
    const title = text(item.title, 120); const description = text(item.description, 600); const itemPriority = priority(item.priority);
    const estimatedEffort = item.estimatedEffort == null ? undefined : text(item.estimatedEffort, 100);
    const effortOk = item.estimatedEffort == null || estimatedEffort !== null;
    return typeof item.step === "number" && item.step === index + 1 && title && description && itemPriority && effortOk
      ? { step: item.step, title, description, priority: itemPriority, ...(estimatedEffort ? { estimatedEffort } : {}) }
      : null;
  });
  const strengths = stringList(value.jobReadiness.strengths, 8);
  const improvements = stringList(value.jobReadiness.improvements, 8);
  const recommendations = stringList(value.jobReadiness.recommendations, 8);
  if (existingSkills.some((item) => !item) || skillGaps.some((item) => !item) || roadmap.some((item) => !item) || !strengths || !improvements || !recommendations) return null;
  return { target: { country, job, position }, readinessScore, existingSkills: existingSkills as LearningMapResult["existingSkills"], skillGaps: skillGaps as LearningMapResult["skillGaps"], roadmap: roadmap as LearningMapResult["roadmap"], jobReadiness: { strengths, improvements, recommendations } };
}