export type LearningPhaseStatus = "analysis" | "learning";

export function toJobId(country: string, job: string, position: string): string {
  return `${country}::${job}::${position}`;
}
