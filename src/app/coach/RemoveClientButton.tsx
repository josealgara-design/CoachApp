"use client";

import { deleteClient } from "./actions";

export function RemoveClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  return (
    <form
      action={deleteClient.bind(null, clientId)}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          `Remove ${clientName}? This permanently deletes their goals, action items, session notes, and profile. This can't be undone.`
        );
        if (!confirmed) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-xs font-medium text-red-600 hover:text-red-800"
      >
        Remove client
      </button>
    </form>
  );
}
