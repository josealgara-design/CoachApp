import Link from "next/link";
import { verifyClientSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ProfileInfoForm } from "./ProfileInfoForm";
import { ResumeUpload } from "./ResumeUpload";
import { QuizForm } from "./QuizForm";
import { QuizResults } from "@/components/QuizResults";
import type { TraitScores } from "@/lib/quiz";

export default async function ClientProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ retake?: string }>;
}) {
  const session = await verifyClientSession();
  const { retake } = await searchParams;

  const profile = await prisma.profile.findUnique({ where: { clientId: session.userId } });

  const hasScores = profile?.quizScores != null;
  const showQuizForm = !hasScores || retake === "1";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My profile</h1>
        <p className="text-sm text-slate-500">
          Share context with your coach: your background, career goal, and how you like to work.
        </p>
      </div>

      <ProfileInfoForm
        yearsExperience={profile?.yearsExperience ?? null}
        careerGoal={profile?.careerGoal ?? null}
        careerGoalTargetDate={profile?.careerGoalTargetDate ?? null}
      />

      <ResumeUpload
        clientId={session.userId}
        resumeFileName={profile?.resumeFileName ?? null}
        resumeSize={profile?.resumeSize ?? null}
        resumeUploadedAt={profile?.resumeUploadedAt ?? null}
      />

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {showQuizForm ? (
          <QuizForm retake={hasScores} />
        ) : (
          <>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Work-style assessment</h2>
            <QuizResults
              scores={profile!.quizScores as TraitScores}
              completedAt={profile!.quizCompletedAt}
            />
            <Link
              href="/client/profile?retake=1"
              className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
            >
              Retake assessment
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
