import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-500">Sign in to your coaching workspace.</p>
      <LoginForm />
    </main>
  );
}
