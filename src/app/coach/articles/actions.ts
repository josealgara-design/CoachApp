"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyCoachSession } from "@/lib/dal";
import { TRAITS } from "@/lib/quiz";
import { EXPERIENCE_BANDS } from "@/lib/article-tags";

export async function addArticle(formData: FormData) {
  const session = await verifyCoachSession();

  const title = String(formData.get("title") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const topicTagsRaw = String(formData.get("topicTags") ?? "");

  if (!title || !/^https?:\/\//i.test(url)) return;

  const traitTags = TRAITS.filter((trait) => formData.get(`trait_${trait}`) === "on");
  const bandTag = String(formData.get("experienceBand") ?? "");
  const experienceTags = EXPERIENCE_BANDS.includes(bandTag as (typeof EXPERIENCE_BANDS)[number])
    ? [bandTag]
    : [];
  const topicTags = topicTagsRaw
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  await prisma.article.create({
    data: {
      coachId: session.userId,
      title,
      url,
      description: description || null,
      tags: [...traitTags, ...experienceTags, ...topicTags],
    },
  });

  revalidatePath("/coach/articles");
}

export async function deleteArticle(articleId: string) {
  const session = await verifyCoachSession();

  await prisma.article.deleteMany({
    where: { id: articleId, coachId: session.userId },
  });

  revalidatePath("/coach/articles");
}
