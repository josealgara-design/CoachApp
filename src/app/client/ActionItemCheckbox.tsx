"use client";

import { toggleMyActionItem } from "./actions";

export function ActionItemCheckbox({
  itemId,
  done,
  title,
}: {
  itemId: string;
  done: boolean;
  title: string;
}) {
  return (
    <form action={toggleMyActionItem.bind(null, itemId, !done)}>
      <button type="submit" className="flex w-full items-center gap-2 text-left text-sm">
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            done ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
          }`}
        >
          {done && "✓"}
        </span>
        <span className={done ? "text-slate-400 line-through" : "text-slate-800"}>{title}</span>
      </button>
    </form>
  );
}
