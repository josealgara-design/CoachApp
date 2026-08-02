"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyClientSession } from "@/lib/dal";
import { saveResume, deleteResume, ResumeValidationError } from "@/lib/resume-storage";
import { computeScores, QUESTIONS } from "@/lib/quiz";
import { parseDateInput } from "@/lib/date";

export async function toggleMyActionItem(itemId: string, done: boolean) {
  const session = await verifyClientSession();

  await prisma.actionItem.update({
    where: { id: itemId, clientId: session.userId },
    data: { done },
  });

  revalidatePath("/client");
}

export async function updateProfileInfo(formData: FormData) {
  const session = await verifyClientSession();

  const yearsExperienceRaw = String(formData.get("yearsExperience") ?? "").trim();
  const careerGoal = String(formData.get("careerGoal") ?? "").trim();
  const targetDateRaw = String(formData.get("careerGoalTargetDate") ?? "");

  const yearsExperience = yearsExperienceRaw ? Number(yearsExperienceRaw) : null;

  await prisma.profile.upsert({
    where: { clientId: session.userId },
    update: {
      yearsExperience,
      careerGoal: careerGoal || null,
      careerGoalTargetDate: targetDateRaw ? parseDateInput(targetDateRaw) : null,
    },
    create: {
      clientId: session.userId,
      yearsExperience,
      careerGoal: careerGoal || null,
      careerGoalTargetDate: targetDateRaw ? parseDateInput(targetDateRaw) : null,
    },
  });

  revalidatePath("/client/profile");
}

export type UploadResumeState = { error: string } | undefined;

export async function uploadResume(
  _state: UploadResumeState,
  formData: FormData
): Promise<UploadResumeState> {
  const session = await verifyClientSession();

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to upload." };
  }

  let saved;
  try {
    saved = await saveResume(session.userId, file);
  } catch (err) {
    if (err instanceof ResumeValidationError) {
      return { error: err.message };
    }
    throw err;
  }

  const existing = await prisma.profile.findUnique({ where: { clientId: session.userId } });
  if (existing?.resumeStoredName) {
    await deleteResume(existing.resumeStoredName);
  }

  await prisma.profile.upsert({
    where: { clientId: session.userId },
    update: {
      resumeFileName: saved.fileName,
      resumeStoredName: saved.storedUrl,
      resumeMimeType: saved.mimeType,
      resumeSize: saved.size,
      resumeUploadedAt: new Date(),
    },
    create: {
      clientId: session.userId,
      resumeFileName: saved.fileName,
      resumeStoredName: saved.storedUrl,
      resumeMimeType: saved.mimeType,
      resumeSize: saved.size,
      resumeUploadedAt: new Date(),
    },
  });

  revalidatePath("/client/profile");
  revalidatePath("/coach");
}

export async function submitQuiz(formData: FormData) {
  const session = await verifyClientSession();

  const answers: Record<string, number> = {};
  for (const question of QUESTIONS) {
    const raw = formData.get(question.id);
    if (raw) answers[question.id] = Number(raw);
  }

  const scores = computeScores(answers);

  await prisma.profile.upsert({
    where: { clientId: session.userId },
    update: { quizScores: scores, quizCompletedAt: new Date() },
    create: { clientId: session.userId, quizScores: scores, quizCompletedAt: new Date() },
  });

  revalidatePath("/client/profile");
}
