import Link from "next/link";
import { verifyCoachSession, getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { Wordmark } from "@/components/Wordmark";

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  await verifyCoachSession();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-5">
            <Link href="/coach">
              <Wordmark tagline="coach dashboard" />
            </Link>
            <Link href="/coach/articles" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Article library
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user?.name}</span>
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
