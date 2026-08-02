import Link from "next/link";
import { verifyCoachSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { AddClientForm } from "./AddClientForm";

export default async function CoachPage() {
  const session = await verifyCoachSession();

  const clients = await prisma.user.findMany({
    where: { coachId: session.userId, role: "CLIENT" },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { goals: true, actionItems: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <AddClientForm />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Your clients ({clients.length})
        </h2>
        {clients.length === 0 ? (
          <p className="text-sm text-slate-500">
            No clients yet. Add your first client above to get started.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {clients.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/coach/clients/${client.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-slate-300"
                >
                  <div>
                    <p className="font-medium text-slate-900">{client.name}</p>
                    <p className="text-sm text-slate-500">{client.email}</p>
                  </div>
                  <div className="text-sm text-slate-500">
                    {client._count.goals} goals &middot; {client._count.actionItems} action items
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
