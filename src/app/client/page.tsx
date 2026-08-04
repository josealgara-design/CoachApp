import Link from "next/link";
import { verifyClientSession, getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { ActionItemCheckbox } from "./ActionItemCheckbox";

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function ClientPage() {
  const session = await verifyClientSession();
  const me = await getCurrentUser();

  const [goals, actionItems, sessions, coach, profile] = await Promise.all([
    prisma.goal.findMany({
      where: { clientId: session.userId, status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.actionItem.findMany({
      where: { clientId: session.userId },
      orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    }),
    prisma.session.findMany({
      where: { clientId: session.userId },
      orderBy: { date: "desc" },
    }),
    me?.coachId
      ? prisma.user.findUnique({ where: { id: me.coachId }, select: { name: true } })
      : null,
    prisma.profile.findUnique({ where: { clientId: session.userId } }),
  ]);

  const profileIncomplete =
    !profile?.resumeFileName || !profile?.careerGoal || profile?.quizScores == null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Welcome, {me?.name}</h1>
        {coach && <p className="text-sm text-slate-500">Coached by {coach.name}</p>}
      </div>

      {profileIncomplete && (
        <Link
          href="/client/profile"
          className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 hover:border-slate-400"
        >
          <span className="font-medium text-slate-900">Complete your profile</span> — add your
          resume, career goal, and take the quick work-style assessment so your coach has more
          context.
        </Link>
      )}

      <a
        href="https://v3tta.com/assessment.html"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 hover:border-slate-300"
      >
        <span className="font-medium text-slate-900">Take the Career Assessment</span> — V3TTA&apos;s
        20-question assessment across strengths, execution, resilience, connection, and vision.
        Opens in a new tab.
      </a>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">My goals</h2>
        <ul className="flex flex-col gap-2">
          {goals.map((goal) => (
            <li key={goal.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-slate-900">{goal.title}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {goal.status}
                </span>
              </div>
              {goal.description && <p className="mt-1 text-sm text-slate-500">{goal.description}</p>}
              {goal.targetDate && (
                <p className="mt-1 text-xs text-slate-400">Target: {formatDate(goal.targetDate)}</p>
              )}
            </li>
          ))}
          {goals.length === 0 && (
            <p className="text-sm text-slate-500">No active goals yet — check back after your next session.</p>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">My action items</h2>
        <ul className="flex flex-col gap-2">
          {actionItems.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <ActionItemCheckbox itemId={item.id} done={item.done} title={item.title} />
              {item.dueDate && (
                <p className="mt-1 pl-6 text-xs text-slate-400">Due: {formatDate(item.dueDate)}</p>
              )}
            </li>
          ))}
          {actionItems.length === 0 && (
            <p className="text-sm text-slate-500">No action items yet.</p>
          )}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Session history</h2>
        <ul className="flex flex-col gap-2">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-400">{formatDate(s.date)}</p>
              {s.summary && <p className="mt-1 font-medium text-slate-900">{s.summary}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{s.notes}</p>
            </li>
          ))}
          {sessions.length === 0 && (
            <p className="text-sm text-slate-500">No sessions logged yet.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
