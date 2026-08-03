import Link from "next/link";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";
import { Wordmark } from "@/components/Wordmark";

export default async function Home() {
  const session = await readSession();
  if (session?.userId) {
    redirect(session.role === "COACH" ? "/coach" : "/client");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
      <Wordmark tagline="find | launch | grow" size="lg" />
      <h1 className="text-2xl font-semibold text-slate-900">Career Coaching Portal</h1>
      <p className="text-slate-600">
        A shared workspace for coaches and clients to track goals, action items, and session
        notes.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          Create a coach account
        </Link>
      </div>
    </main>
  );
}
