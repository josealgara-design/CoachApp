"use client";

import { useActionState } from "react";
import { uploadResume } from "@/app/client/actions";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResumeUpload({
  clientId,
  resumeFileName,
  resumeSize,
  resumeUploadedAt,
}: {
  clientId: string;
  resumeFileName: string | null;
  resumeSize: number | null;
  resumeUploadedAt: Date | null;
}) {
  const [state, action, pending] = useActionState(uploadResume, undefined);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">Resume</h2>

      {resumeFileName && (
        <p className="mb-3 text-sm text-slate-600">
          Current file:{" "}
          <a
            href={`/api/resume/${clientId}`}
            className="font-medium text-slate-900 underline"
          >
            {resumeFileName}
          </a>
          {resumeSize != null && <span className="text-slate-400"> &middot; {formatBytes(resumeSize)}</span>}
          {resumeUploadedAt && (
            <span className="text-slate-400">
              {" "}
              &middot; uploaded{" "}
              {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(resumeUploadedAt)}
            </span>
          )}
        </p>
      )}

      <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Uploading..." : resumeFileName ? "Replace" : "Upload"}
        </button>
      </form>
      <p className="mt-1 text-xs text-slate-400">PDF or Word document, up to 5MB.</p>
      {state?.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
