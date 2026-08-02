"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyCoachSession } from "@/lib/dal";
import { hashPassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/temp-password";
import { parseDateInput } from "@/lib/date";

async function assertOwnsClient(coachId: string, clientId: string) {
  const client = await prisma.user.findFirst({
    where: { id: clientId, coachId, role: "CLIENT" },
    select: { id: true },
  });
  if (!client) {
    throw new Error("Client not found");
  }
}

async function assertOwnsArticle(coachId: string, articleId: string) {
  const article = await prisma.article.findFirst({
    where: { id: articleId, coachId },
    select: { id: true },
  });
  if (!article) {
    throw new Error("Article not found");
  }
}

export type AddClientState = { error: string; tempPassword?: string } | undefined;

export async function addClient(
  _state: AddClientState,
  formData: FormData
): Promise<AddClientState> {
  const session = await verifyCoachSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (name.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CLIENT",
      coachId: session.userId,
    },
  });

  revalidatePath("/coach");
  return { error: "", tempPassword };
}

export async function addGoal(formData: FormData) {
  const session = await verifyCoachSession();
  const clientId = String(formData.get("clientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "");

  if (!title) return;
  await assertOwnsClient(session.userId, clientId);

  await prisma.goal.create({
    data: {
      clientId,
      title,
      description: description || null,
      targetDate: targetDate ? parseDateInput(targetDate) : null,
    },
  });

  revalidatePath(`/coach/clients/${clientId}`);
}

export async function updateGoalStatus(goalId: string, clientId: string, status: string) {
  const session = await verifyCoachSession();
  await assertOwnsClient(session.userId, clientId);

  await prisma.goal.update({
    where: { id: goalId, clientId },
    data: { status: status as "ACTIVE" | "DONE" | "ARCHIVED" },
  });

  revalidatePath(`/coach/clients/${clientId}`);
}

export async function addActionItem(formData: FormData) {
  const session = await verifyCoachSession();
  const clientId = String(formData.get("clientId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const goalId = String(formData.get("goalId") ?? "") || null;
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!title) return;
  await assertOwnsClient(session.userId, clientId);

  await prisma.actionItem.create({
    data: {
      clientId,
      title,
      goalId,
      dueDate: dueDate ? parseDateInput(dueDate) : null,
    },
  });

  revalidatePath(`/coach/clients/${clientId}`);
}

export async function toggleActionItem(itemId: string, clientId: string, done: boolean) {
  const session = await verifyCoachSession();
  await assertOwnsClient(session.userId, clientId);

  await prisma.actionItem.update({
    where: { id: itemId, clientId },
    data: { done },
  });

  revalidatePath(`/coach/clients/${clientId}`);
}

export async function pinArticle(formData: FormData) {
  const session = await verifyCoachSession();
  const clientId = String(formData.get("clientId") ?? "");
  const articleId = String(formData.get("articleId") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!articleId) return;
  await assertOwnsClient(session.userId, clientId);
  await assertOwnsArticle(session.userId, articleId);

  await prisma.articlePin.upsert({
    where: { articleId_clientId: { articleId, clientId } },
    update: { note: note || null },
    create: { articleId, clientId, note: note || null },
  });

  revalidatePath(`/coach/clients/${clientId}`);
}

export async function unpinArticle(pinId: string, clientId: string) {
  const session = await verifyCoachSession();
  await assertOwnsClient(session.userId, clientId);

  await prisma.articlePin.deleteMany({
    where: { id: pinId, clientId },
  });

  revalidatePath(`/coach/clients/${clientId}`);
}

export async function addSessionNote(formData: FormData) {
  const session = await verifyCoachSession();
  const clientId = String(formData.get("clientId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!notes) return;
  await assertOwnsClient(session.userId, clientId);

  await prisma.session.create({
    data: {
      coachId: session.userId,
      clientId,
      notes,
      summary: summary || null,
    },
  });

  revalidatePath(`/coach/clients/${clientId}`);
}
