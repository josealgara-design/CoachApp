"use client";

import { useActionState } from "react";
import { addClient } from "./actions";

export function AddClientForm() {
  const [state, action, pending] = useActionState(addClient, undefined);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Add a client</h2>
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="name" className="text-xs font-medium text-slate-600">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="email" className="text-xs font-medium text-slate-600">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add client"}
        </button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state?.tempPassword && (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Client created. Share this temporary password with them — it won&apos;t be shown again:{" "}
          <code className="font-mono font-semibold">{state.tempPassword}</code>
        </p>
      )}
    </div>
  );
}
