import { verifyClientSession, getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { parseTags, computeRelevance } from "@/lib/article-tags";
import type { TraitScores } from "@/lib/quiz";

function ArticleCard({
  title,
  url,
  description,
  tags,
  note,
}: {
  title: string;
  url: string;
  description: string | null;
  tags: string[];
  note?: string | null;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-slate-900 underline"
      >
        {title}
      </a>
      {note && (
        <p className="mt-1 text-sm text-slate-600">
          <span className="font-medium">From your coach:</span> {note}
        </p>
      )}
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {tag}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}

export default async function ClientArticlesPage() {
  const session = await verifyClientSession();
  const me = await getCurrentUser();

  if (!me?.coachId) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Articles</h1>
        <p className="mt-2 text-sm text-slate-500">No articles available yet.</p>
      </div>
    );
  }

  const [articles, pins, profile] = await Promise.all([
    prisma.article.findMany({ where: { coachId: me.coachId }, orderBy: { createdAt: "desc" } }),
    prisma.articlePin.findMany({ where: { clientId: session.userId }, include: { article: true } }),
    prisma.profile.findUnique({ where: { clientId: session.userId } }),
  ]);

  const pinnedArticleIds = new Set(pins.map((pin) => pin.articleId));
  const unpinnedArticles = articles.filter((article) => !pinnedArticleIds.has(article.id));

  const articleProfile = {
    quizScores: (profile?.quizScores as TraitScores | null) ?? null,
    yearsExperience: profile?.yearsExperience ?? null,
    careerGoal: profile?.careerGoal ?? null,
  };

  const scored = unpinnedArticles
    .map((article) => ({
      article,
      score: computeRelevance(parseTags(article.tags), articleProfile),
    }))
    .sort((a, b) => b.score - a.score);

  const recommended = scored.filter((entry) => entry.score > 0);
  const rest = scored.filter((entry) => entry.score === 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Articles</h1>
        <p className="text-sm text-slate-500">Reading picked and recommended for your situation.</p>
      </div>

      {pins.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Picked for you by your coach</h2>
          <ul className="flex flex-col gap-2">
            {pins.map((pin) => (
              <ArticleCard
                key={pin.id}
                title={pin.article.title}
                url={pin.article.url}
                description={pin.article.description}
                tags={parseTags(pin.article.tags)}
                note={pin.note}
              />
            ))}
          </ul>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Recommended for you</h2>
          <ul className="flex flex-col gap-2">
            {recommended.map(({ article }) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                url={article.url}
                description={article.description}
                tags={parseTags(article.tags)}
              />
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          {recommended.length > 0 || pins.length > 0 ? "More articles" : "All articles"}
        </h2>
        {articles.length === 0 ? (
          <p className="text-sm text-slate-500">
            Your coach hasn&apos;t added any articles yet — check back soon.
          </p>
        ) : rest.length === 0 ? (
          <p className="text-sm text-slate-500">You&apos;re all caught up on the rest of the library.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rest.map(({ article }) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                url={article.url}
                description={article.description}
                tags={parseTags(article.tags)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
