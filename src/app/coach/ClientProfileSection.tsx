import { QuizResults } from "@/components/QuizResults";
import type { TraitScores } from "@/lib/quiz";

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function ClientProfileSection({
  clientId,
  yearsExperience,
  careerGoal,
  careerGoalTargetDate,
  resumeFileName,
  quizScores,
  quizCompletedAt,
}: {
  clientId: string;
  yearsExperience: number | null;
  careerGoal: string | null;
  careerGoalTargetDate: Date | null;
  resumeFileName: string | null;
  quizScores: TraitScores | null;
  quizCompletedAt: Date | null;
}) {
  const hasAnyInfo = yearsExperience != null || careerGoal || resumeFileName || quizScores;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-900">Profile</h2>

      {!hasAnyInfo ? (
        <p className="text-sm text-slate-500">This client hasn&apos;t filled in their profile yet.</p>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-500">Years of experience</dt>
              <dd className="text-slate-800">{yearsExperience ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Target date</dt>
              <dd className="text-slate-800">{formatDate(careerGoalTargetDate) ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500">Career goal</dt>
              <dd className="text-slate-800">{careerGoal ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-slate-500">Resume</dt>
              <dd className="text-slate-800">
                {resumeFileName ? (
                  <a
                    href={`/api/resume/${clientId}`}
                    className="font-medium text-slate-900 underline"
                  >
                    {resumeFileName}
                  </a>
                ) : (
                  "Not uploaded yet"
                )}
              </dd>
            </div>
          </dl>

          {quizScores && (
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-medium text-slate-500">Work-style assessment</p>
              <QuizResults scores={quizScores} completedAt={quizCompletedAt} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
