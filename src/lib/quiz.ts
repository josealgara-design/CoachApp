export const TRAITS = ["analytical", "creative", "collaborative", "structured"] as const;

export type Trait = (typeof TRAITS)[number];

export const TRAIT_LABELS: Record<Trait, string> = {
  analytical: "Data-Driven / Analytical",
  creative: "Creative / Innovative",
  collaborative: "Collaborative / People-Oriented",
  structured: "Structured / Process-Oriented",
};

export type Question = {
  id: string;
  trait: Trait;
  text: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    trait: "analytical",
    text: "I like to back up decisions with data and evidence rather than gut feeling.",
  },
  {
    id: "q2",
    trait: "analytical",
    text: "I enjoy digging into numbers, reports, or metrics to find patterns.",
  },
  {
    id: "q3",
    trait: "analytical",
    text: "Before taking action, I usually want to understand the underlying data or reasoning.",
  },
  {
    id: "q4",
    trait: "creative",
    text: "I enjoy coming up with new ideas or unconventional solutions.",
  },
  {
    id: "q5",
    trait: "creative",
    text: "I get energized by brainstorming and exploring possibilities, even without a clear plan.",
  },
  {
    id: "q6",
    trait: "creative",
    text: "I often think of multiple different ways to approach the same problem.",
  },
  {
    id: "q7",
    trait: "collaborative",
    text: "I do my best work when I'm collaborating closely with others.",
  },
  {
    id: "q8",
    trait: "collaborative",
    text: "I actively seek input and feedback from teammates before finalizing decisions.",
  },
  {
    id: "q9",
    trait: "structured",
    text: "I prefer having clear processes and plans before starting a task.",
  },
  {
    id: "q10",
    trait: "structured",
    text: "I like organizing my work into checklists, schedules, or well-defined steps.",
  },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly agree" },
];

export type TraitScores = Record<Trait, number>;

export function computeScores(answers: Record<string, number>): TraitScores {
  const totals: Record<Trait, { sum: number; count: number }> = {
    analytical: { sum: 0, count: 0 },
    creative: { sum: 0, count: 0 },
    collaborative: { sum: 0, count: 0 },
    structured: { sum: 0, count: 0 },
  };

  for (const question of QUESTIONS) {
    const value = answers[question.id];
    if (!value) continue;
    totals[question.trait].sum += value;
    totals[question.trait].count += 1;
  }

  const scores = {} as TraitScores;
  for (const trait of TRAITS) {
    const { sum, count } = totals[trait];
    const average = count > 0 ? sum / count : 0;
    scores[trait] = Math.round(((average - 1) / 4) * 100);
  }
  return scores;
}

export function topTraits(scores: TraitScores, count = 2): Trait[] {
  return [...TRAITS].sort((a, b) => scores[b] - scores[a]).slice(0, count);
}
