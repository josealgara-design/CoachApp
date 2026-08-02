import Link from "next/link";
import { verifyClientSession, getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await verifyClientSession();
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4">
            <Link href="/client" className="font-semibold text-slate-900">
              My coaching
            </Link>
            <Link href="/client/profile" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              My profile
            </Link>
            <Link href="/client/articles" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Articles
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
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
