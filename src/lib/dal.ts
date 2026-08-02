import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export const verifySession = cache(async () => {
  const session = await readSession();
  if (!session?.userId) {
    redirect("/login");
  }
  return session;
});

export const verifyCoachSession = cache(async () => {
  const session = await verifySession();
  if (session.role !== "COACH") {
    redirect("/client");
  }
  return session;
});

export const verifyClientSession = cache(async () => {
  const session = await verifySession();
  if (session.role !== "CLIENT") {
    redirect("/coach");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session?.userId) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, coachId: true },
  });
});
