import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Set up your coaching practice</h1>
      <p className="mb-6 text-sm text-slate-500">
        Create a coach account. You&apos;ll be able to add clients from your dashboard.
      </p>
      <SignupForm />
    </main>
  );
}
