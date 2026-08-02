import { TRAITS, TRAIT_LABELS, topTraits, type TraitScores } from "@/lib/quiz";

export function QuizResults({ scores, completedAt }: { scores: TraitScores; completedAt: Date | null }) {
  const top = topTraits(scores);

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600">
        Primary style:{" "}
        <span className="font-medium text-slate-900">
          {top.map((trait) => TRAIT_LABELS[trait]).join(" & ")}
        </span>
        {completedAt && (
          <span className="text-slate-400">
            {" "}
            &middot; taken {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(completedAt)}
          </span>
        )}
      </p>
      <div className="flex flex-col gap-2">
        {TRAITS.map((trait) => (
          <div key={trait} className="flex items-center gap-3">
            <span className="w-56 shrink-0 text-sm text-slate-700">{TRAIT_LABELS[trait]}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900"
                style={{ width: `${scores[trait]}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-slate-500">{scores[trait]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
