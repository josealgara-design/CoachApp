"use client";

import { useTransition } from "react";
import { updateGoalStatus } from "./actions";

const STATUSES = ["ACTIVE", "DONE", "ARCHIVED"] as const;

export function GoalStatusSelect({
  goalId,
  clientId,
  status,
}: {
  goalId: string;
  clientId: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          updateGoalStatus(goalId, clientId, next);
        });
      }}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
