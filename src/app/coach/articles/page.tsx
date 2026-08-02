import { verifyCoachSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { TRAITS, TRAIT_LABELS } from "@/lib/quiz";
import { EXPERIENCE_BANDS, EXPERIENCE_BAND_LABELS, parseTags } from "@/lib/article-tags";
import { addArticle, deleteArticle } from "./actions";

export default async function CoachArticlesPage() {
  const session = await verifyCoachSession();

  const articles = await prisma.article.findMany({
    where: { coachId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Article library</h1>
        <p className="text-sm text-slate-500">
          Articles you add here can be recommended to clients based on their profile, or pinned
          directly from a client&apos;s page.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Add an article</h2>
        <form action={addArticle} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-xs font-medium text-slate-600">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="url" className="text-xs font-medium text-slate-600">
              URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              required
              placeholder="https://..."
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-xs font-medium text-slate-600">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Relevant work styles</span>
            <div className="flex flex-wrap gap-3">
              {TRAITS.map((trait) => (
                <label key={trait} className="flex items-center gap-1.5 text-sm text-slate-700">
                  <input type="checkbox" name={`trait_${trait}`} className="h-3.5 w-3.5" />
                  {TRAIT_LABELS[trait]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600">Experience level</span>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-1.5 text-sm text-slate-700">
                <input type="radio" name="experienceBand" value="" defaultChecked className="h-3.5 w-3.5" />
                Any
              </label>
              {EXPERIENCE_BANDS.map((band) => (
                <label key={band} className="flex items-center gap-1.5 text-sm text-slate-700">
                  <input type="radio" name="experienceBand" value={band} className="h-3.5 w-3.5" />
                  {EXPERIENCE_BAND_LABELS[band]}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="topicTags" className="text-xs font-medium text-slate-600">
              Topic tags (comma-separated)
            </label>
            <input
              id="topicTags"
              name="topicTags"
              placeholder="e.g. job-search, leadership, interviewing"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-400">
              Matched against words in a client&apos;s career goal to help surface relevant reads.
            </p>
          </div>

          <button
            type="submit"
            className="self-start rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Add article
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900">Your articles ({articles.length})</h2>
        {articles.length === 0 ? (
          <p className="text-sm text-slate-500">No articles yet. Add your first one above.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {articles.map((article) => {
              const tags = parseTags(article.tags);
              return (
                <li key={article.id} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-900 underline"
                      >
                        {article.title}
                      </a>
                      {article.description && (
                        <p className="mt-1 text-sm text-slate-500">{article.description}</p>
                      )}
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
                    <form action={deleteArticle.bind(null, article.id)}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
