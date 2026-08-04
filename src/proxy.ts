import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = secretKey ? new TextEncoder().encode(secretKey) : null;

async function readRole(request: NextRequest): Promise<"COACH" | "CLIENT" | null> {
  const cookie = request.cookies.get("session")?.value;
  if (!cookie || !encodedKey) return null;
  try {
    const { payload } = await jwtVerify(cookie, encodedKey, { algorithms: ["HS256"] });
    return (payload as { role?: "COACH" | "CLIENT" }).role ?? null;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = await readRole(request);

  // Note: match "/client" exactly or "/client/..." -- NOT startsWith("/client"),
  // which would also swallow the unrelated public "/client-signup" route.
  const isClientRoute = pathname === "/client" || pathname.startsWith("/client/");
  const isCoachRoute = pathname === "/coach" || pathname.startsWith("/coach/");
  const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname === "/client-signup";

  if (!role && (isCoachRoute || isClientRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role && isAuthPage) {
    return NextResponse.redirect(new URL(role === "COACH" ? "/coach" : "/client", request.url));
  }

  if (role === "CLIENT" && isCoachRoute) {
    return NextResponse.redirect(new URL("/client", request.url));
  }

  if (role === "COACH" && isClientRoute) {
    return NextResponse.redirect(new URL("/coach", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/coach/:path*", "/client/:path*", "/login", "/signup", "/client-signup"],
};
