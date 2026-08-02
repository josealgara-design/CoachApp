import { TRAITS, topTraits, type Trait, type TraitScores } from "@/lib/quiz";

export const EXPERIENCE_BANDS = ["early-career", "mid-career", "senior"] as const;

export type ExperienceBand = (typeof EXPERIENCE_BANDS)[number];

export const EXPERIENCE_BAND_LABELS: Record<ExperienceBand, string> = {
  "early-career": "Early-career (0-3 yrs)",
  "mid-career": "Mid-career (4-9 yrs)",
  senior: "Senior (10+ yrs)",
};

export function experienceBand(years: number | null | undefined): ExperienceBand | null {
  if (years == null) return null;
  if (years <= 3) return "early-career";
  if (years <= 9) return "mid-career";
  return "senior";
}

const TRAIT_SET = new Set<string>(TRAITS);
const BAND_SET = new Set<string>(EXPERIENCE_BANDS);

function isTraitOrBandTag(tag: string): boolean {
  return TRAIT_SET.has(tag) || BAND_SET.has(tag);
}

export function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((tag): tag is string => typeof tag === "string");
}

export type ArticleProfile = {
  quizScores: TraitScores | null;
  yearsExperience: number | null;
  careerGoal: string | null;
};

export function computeRelevance(tags: string[], profile: ArticleProfile): number {
  let score = 0;

  if (profile.quizScores) {
    const top = new Set<Trait>(topTraits(profile.quizScores));
    for (const tag of tags) {
      if (TRAIT_SET.has(tag) && top.has(tag as Trait)) {
        score += 3;
      }
    }
  }

  const band = experienceBand(profile.yearsExperience);
  if (band && tags.includes(band)) {
    score += 2;
  }

  if (profile.careerGoal) {
    const goalLower = profile.careerGoal.toLowerCase();
    for (const tag of tags) {
      if (isTraitOrBandTag(tag)) continue;
      if (goalLower.includes(tag.toLowerCase())) {
        score += 1;
      }
    }
  }

  return score;
}
