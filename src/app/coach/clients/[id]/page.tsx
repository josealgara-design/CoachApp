import { notFound } from "next/navigation";
import { verifyCoachSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { addGoal, addActionItem, addSessionNote, pinArticle, unpinArticle } from "@/app/coach/actions";
import { ActionItemToggle } from "@/app/coach/ActionItemToggle";
import { GoalStatusSelect } from "@/app/coach/GoalStatusSelect";
import { ClientProfileSection } from "@/app/coach/ClientProfileSection";
import { RemoveClientButton } from "@/app/coach/RemoveClientButton";
import type { TraitScores } from "@/lib/quiz";
import { parseTags } from "@/lib/article-tags";

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clientId } = await params;
  const session = await verifyCoachSession();

  const client = await prisma.user.findFirst({
    where: { id: clientId, coachId: session.userId, role: "CLIENT" },
  });
  if (!client) notFound();

  const [goals, actionItems, sessions, profile, articles, pins] = await Promise.all([
    prisma.goal.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } }),
    prisma.actionItem.findMany({ where: { clientId }, orderBy: { createdAt: "desc" } }),
    prisma.session.findMany({ where: { clientId }, orderBy: { date: "desc" } }),
    prisma.profile.findUnique({ where: { clientId } }),
    prisma.article.findMany({ where: { coachId: session.userId }, orderBy: { createdAt: "desc" } }),
    prisma.articlePin.findMany({ where: { clientId }, include: { article: true } }),
  ]);

  const pinnedArticleIds = new Set(pins.map((pin) => pin.articleId));
  const unpinnedArticles = articles.filter((article) => !pinnedArticleIds.has(article.id));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{client.name}</h1>
          <p className="text-sm text-slate-500">{client.email}</p>
        </div>
        <RemoveClientButton clientId={clientId} clientName={client.name} />
      </div>

      <ClientProfileSection
        clientId={clientId}
        yearsExperience={profile?.yearsExperience ?? null}
        careerGoal={profile?.careerGoal ?? null}
        careerGoalTargetDate={profile?.careerGoalTargetDate ?? null}
        resumeFileName={profile?.resumeFileName ?? null}
        quizScores={(profile?.quizScores as TraitScores | null) ?? null}
        quizCompletedAt={profile?.quizCompletedAt ?? null}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Goals</h2>
        <ul className="flex flex-col gap-2">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{goal.title}</p>
                  {goal.description && (
                    <p className="text-sm text-slate-500">{goal.description}</p>
                  )}
                  {goal.targetDate && (
                    <p className="mt-1 text-xs text-slate-400">
                      Target: {formatDate(goal.targetDate)}
                    </p>
                  )}
                </div>
                <GoalStatusSelect goalId={goal.id} clientId={clientId} status={goal.status} />
              </div>
            </li>
          ))}
          {goals.length === 0 && <p className="text-sm text-slate-500">No goals yet.</p>}
        </ul>

        <form
          action={addGoal}
          className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 p-3"
        >
          <input type="hidden" name="clientId" value={clientId} />
          <div className="flex gap-2">
            <input
              name="title"
              placeholder="Goal title"
              required
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="targetDate"
              type="date"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            name="description"
            placeholder="Description (optional)"
            rows={2}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="self-start rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add goal
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Action items</h2>
        <ul className="flex flex-col gap-2">
          {actionItems.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <ActionItemToggle
                itemId={item.id}
                clientId={clientId}
                done={item.done}
                title={item.title}
              />
              {item.dueDate && (
                <p className="mt-1 pl-6 text-xs text-slate-400">
                  Due: {formatDate(item.dueDate)}
                </p>
              )}
            </li>
          ))}
          {actionItems.length === 0 && (
            <p className="text-sm text-slate-500">No action items yet.</p>
          )}
        </ul>

        <form
          action={addActionItem}
          className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 p-3 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="clientId" value={clientId} />
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Task</label>
            <input
              name="title"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Related goal</label>
            <select
              name="goalId"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">None</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Due date</label>
            <input
              name="dueDate"
              type="date"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Session notes</h2>
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

        <form
          action={addSessionNote}
          className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 p-3"
        >
          <input type="hidden" name="clientId" value={clientId} />
          <input
            name="summary"
            placeholder="Short summary (optional)"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            name="notes"
            placeholder="Session notes"
            required
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="self-start rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Log session
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Articles</h2>
        <ul className="flex flex-col gap-2">
          {pins.map((pin) => {
            const tags = parseTags(pin.article.tags);
            return (
              <li key={pin.id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <a
                      href={pin.article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-900 underline"
                    >
                      {pin.article.title}
                    </a>
                    {pin.note && <p className="mt-1 text-sm text-slate-500">Note: {pin.note}</p>}
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <form action={unpinArticle.bind(null, pin.id, clientId)}>
                    <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-800">
                      Unpin
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
          {pins.length === 0 && (
            <p className="text-sm text-slate-500">No articles pinned for this client yet.</p>
          )}
        </ul>

        {unpinnedArticles.length > 0 && (
          <form
            action={pinArticle}
            className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 p-3 sm:flex-row sm:items-end"
          >
            <input type="hidden" name="clientId" value={clientId} />
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Pin an article</label>
              <select
                name="articleId"
                required
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {unpinnedArticles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-slate-600">Note (optional)</label>
              <input
                name="note"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Pin
            </button>
          </form>
        )}
        {articles.length === 0 && (
          <p className="text-sm text-slate-500">
            Your article library is empty — add some in{" "}
            <a href="/coach/articles" className="underline">
              Article library
            </a>
            .
          </p>
        )}
      </section>
    </div>
  );
}
