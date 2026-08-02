import "server-only";
import { randomBytes } from "crypto";

export function generateTempPassword() {
  return randomBytes(6).toString("base64url");
}
