import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const session = await readSession();
  if (!session) {
    return new Response(null, { status: 401 });
  }

  const isSelf = session.role === "CLIENT" && session.userId === clientId;
  const isOwningCoach =
    session.role === "COACH" &&
    (await prisma.user.findFirst({
      where: { id: clientId, coachId: session.userId, role: "CLIENT" },
      select: { id: true },
    })) !== null;

  if (!isSelf && !isOwningCoach) {
    return new Response(null, { status: 403 });
  }

  const profile = await prisma.profile.findUnique({ where: { clientId } });
  if (!profile?.resumeStoredName) {
    return new Response(null, { status: 404 });
  }

  const blobResponse = await fetch(profile.resumeStoredName);
  if (!blobResponse.ok || !blobResponse.body) {
    return new Response(null, { status: 404 });
  }

  return new Response(blobResponse.body, {
    headers: {
      "Content-Type": profile.resumeMimeType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${profile.resumeFileName ?? "resume"}"`,
    },
  });
}
