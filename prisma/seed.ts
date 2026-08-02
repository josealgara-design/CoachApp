import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const coach = await prisma.user.upsert({
    where: { email: "coach@example.com" },
    update: {},
    create: {
      email: "coach@example.com",
      name: "Jordan Coach",
      passwordHash,
      role: "COACH",
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: {},
    create: {
      email: "maria@example.com",
      name: "Maria Chen",
      passwordHash,
      role: "CLIENT",
      coachId: coach.id,
    },
  });

  const sam = await prisma.user.upsert({
    where: { email: "sam@example.com" },
    update: {},
    create: {
      email: "sam@example.com",
      name: "Sam Okafor",
      passwordHash,
      role: "CLIENT",
      coachId: coach.id,
    },
  });

  for (const client of [maria, sam]) {
    const existingGoals = await prisma.goal.count({ where: { clientId: client.id } });
    if (existingGoals > 0) continue;

    const goal = await prisma.goal.create({
      data: {
        clientId: client.id,
        title:
          client.id === maria.id
            ? "Land a senior product manager role"
            : "Get promoted to engineering lead",
        description:
          client.id === maria.id
            ? "Target mid-to-large tech companies, focus on B2B SaaS."
            : "Build track record leading cross-team technical initiatives.",
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.actionItem.createMany({
      data: [
        {
          clientId: client.id,
          goalId: goal.id,
          title: client.id === maria.id ? "Update resume and LinkedIn" : "Draft promotion case doc",
          done: true,
        },
        {
          clientId: client.id,
          goalId: goal.id,
          title:
            client.id === maria.id
              ? "Apply to 5 target companies"
              : "Schedule 1:1 with manager about goals",
          done: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    await prisma.session.create({
      data: {
        coachId: coach.id,
        clientId: client.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        summary: "Kickoff session",
        notes:
          client.id === maria.id
            ? "Discussed career goals and target companies. Maria wants to move from IC to PM within 6 months."
            : "Reviewed current responsibilities and gaps toward lead role. Sam will start documenting technical leadership examples.",
      },
    });
  }

  console.log("Seed complete.");
  console.log("Coach login: coach@example.com / password123");
  console.log("Client logins: maria@example.com / sam@example.com (password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
