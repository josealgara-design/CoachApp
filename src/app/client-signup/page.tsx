import { ClientSignupForm } from "./ClientSignupForm";
import { Wordmark } from "@/components/Wordmark";

export default function ClientSignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-8 flex justify-center">
        <Wordmark tagline="find | launch | grow" size="lg" />
      </div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">Create your account</h1>
      <p className="mb-6 text-sm text-slate-500">
        Set up your client account to work with your coach.
      </p>
      <ClientSignupForm />
    </main>
  );
}
