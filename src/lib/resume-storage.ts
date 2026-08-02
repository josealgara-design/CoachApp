import "server-only";
import { put, del } from "@vercel/blob";
import { randomBytes } from "crypto";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export class ResumeValidationError extends Error {}

export async function saveResume(clientId: string, file: File) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new ResumeValidationError("Please upload a PDF or Word document (.pdf, .doc, .docx).");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new ResumeValidationError("File must be 5MB or smaller.");
  }

  const key = `resumes/${clientId}-${randomBytes(8).toString("hex")}-${file.name}`;
  const blob = await put(key, file, {
    access: "public",
    contentType: file.type,
  });

  return {
    // The blob URL is unguessable and never exposed to the client directly —
    // /api/resume/[clientId] is the only public-facing entry point, and it
    // fetches this URL server-side after checking the session.
    storedUrl: blob.url,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

export async function deleteResume(storedUrl: string) {
  try {
    await del(storedUrl);
  } catch {
    // already gone, nothing to do
  }
}
