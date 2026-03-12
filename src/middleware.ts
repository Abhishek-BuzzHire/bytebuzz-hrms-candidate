import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple JWT decode (no verify; verification is done by API). Only read payload for role.
function getPayloadFromToken(
  token: string
): { id?: string; username?: string; role?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as { id?: string; username?: string; role?: string };
  } catch {
    return null;
  }
}

const PROTECTED_PATHS = ["/dashboard"];
const LOGIN_PATH = "/login";
const SIGN_UP_PATH = "/sign-up";
const DASHBOARD_HOME = "/dashboard";
const origin = "https://candidate.bytebuzz.in"; // update if different

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access")?.value;
  const payload = token ? getPayloadFromToken(token) : null;

  const isProtectedPath = PROTECTED_PATHS.some(
    (p) => pathname.startsWith(p) || pathname === p
  );

  const isAuthPath = pathname === LOGIN_PATH || pathname === SIGN_UP_PATH;

  // No valid token → redirect to login if accessing protected routes
  if (!token || !payload) {
    if (isProtectedPath) {
      const returnUrl = `${pathname}${request.nextUrl.search}`;
      const loginUrl = new URL(LOGIN_PATH, origin);
      loginUrl.searchParams.set("returnUrl", returnUrl);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Valid token → redirect away from auth pages to dashboard
  if (isAuthPath) {
    return NextResponse.redirect(new URL(DASHBOARD_HOME, origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/sign-up",
  ],
};