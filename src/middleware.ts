import { NextRequest, NextResponse } from "next/server";

// ─── ROUTE CONFIG ──────────────────────────────────────────────────────────────

const AUTH_PATHS = [
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
  "/reset-password",
];

const ROLE_PROTECTED: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/staff": ["ADMIN", "STAFF"],
  "/student": ["ADMIN", "STAFF", "STUDENT"],
};

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  STAFF: "/staff",
  STUDENT: "/student",
};

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Next internals, static files — skip
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value ?? null;
  const role = req.cookies.get("role")?.value ?? null;

  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // ── ১. Auth pages — logged in থাকলে dashboard এ পাঠাও ──────────────────────
  if (isAuthPath) {
    if (token && role) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url));
    }
    return NextResponse.next();
  }

  // ── ২. Protected route — token নেই তাহলে login এ পাঠাও ─────────────────────
  const matchedPrefix = Object.keys(ROLE_PROTECTED).find(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (matchedPrefix) {
    // token নেই
    if (!token || !role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // role match করে না
    const allowed = ROLE_PROTECTED[matchedPrefix];
    if (!allowed.includes(role)) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
