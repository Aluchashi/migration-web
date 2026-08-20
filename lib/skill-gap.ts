export type SkillPriority = "high" | "medium" | "low";

export type MissingSkill = {
  skill: string;
  priority: SkillPriority;
  reason: string;
};

export type SkillGapResult = {
  missingSkills: MissingSkill[];
};

const priorityOrder: Record<SkillPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result && result.length <= maxLength ? result : null;
}

export function parseSkillGap(value: unknown): SkillGapResult | null {
  if (!isRecord(value) || !Array.isArray(value.missingSkills) || value.missingSkills.length > 20) {
    return null;
  }

  const seen = new Set<string>();
  const missingSkills: MissingSkill[] = [];

  for (const item of value.missingSkills) {
    if (!isRecord(item)) return null;
    const skill = cleanString(item.skill, 160);
    const reason = cleanString(item.reason, 1_000);
    const priority = typeof item.priority === "string"
      ? item.priority.toLowerCase()
      : "";

    if (!skill || !reason || !["high", "medium", "low"].includes(priority)) {
      return null;
    }

    const key = skill.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    missingSkills.push({ skill, reason, priority: priority as SkillPriority });
  }

  missingSkills.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return { missingSkills };
}
