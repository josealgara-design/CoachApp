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

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!role && (pathname.startsWith("/coach") || pathname.startsWith("/client"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (role && isAuthPage) {
    return NextResponse.redirect(new URL(role === "COACH" ? "/coach" : "/client", request.url));
  }

  if (role === "CLIENT" && pathname.startsWith("/coach")) {
    return NextResponse.redirect(new URL("/client", request.url));
  }

  if (role === "COACH" && pathname.startsWith("/client")) {
    return NextResponse.redirect(new URL("/coach", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/coach/:path*", "/client/:path*", "/login", "/signup"],
};
