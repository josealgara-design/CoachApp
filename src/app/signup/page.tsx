import { SignupForm } from "./SignupForm";
import { Wordmark } from "@/components/Wordmark";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-8 flex justify-center">
        <Wordmark tagline="find | launch | grow" size="lg" />
      </div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Set up your coaching practice</h1>
      <p className="mb-6 text-sm text-slate-500">
        Create a coach account. You&apos;ll be able to add clients from your dashboard.
      </p>
      <SignupForm />
    </main>
  );
}
