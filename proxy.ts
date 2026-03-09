import { NextResponse, type NextRequest } from "next/server";

// Decode JWT payload
function getJwtPayload(token: string): { role?: string; profileCompleted?: boolean } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const decoded = atob(padded);

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get("access_token")?.value ||
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("token")?.value;

  const payload = token ? getJwtPayload(token) : null;
  console.log(`[Proxy] Incoming request: ${pathname} | Token Payload:`, payload);

  const role = payload?.role ?? null;
  const profileCompleted = payload?.profileCompleted ;
  console.log(`[Proxy] ${pathname} | Role: ${role} | Profile Completed: ${profileCompleted}`);

  // ─── NOT logged in ───
  if (!role) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/company") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/student-details") ||
      pathname.startsWith("/company-details")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ─── Block login/register if already logged in ───
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  // ─── PROFILE LOGIC ───

  // COMPANY
  if (role === "company") {
    // If profile incomplete, redirect to /company-details and block /company
    if (!profileCompleted && pathname.startsWith("/company") && !pathname.startsWith("/company-details")) {
      return NextResponse.redirect(new URL("/company-details", request.url));
    }

    // If profile complete, redirect /company-details to /company
    if (profileCompleted && pathname.startsWith("/company-details")) {
      return NextResponse.redirect(new URL("/company", request.url));
    }
  }

  // STUDENT
  if (role === "student") {
    // If profile incomplete, redirect to /student-details and block /student
    if (!profileCompleted && pathname.startsWith("/student") && !pathname.startsWith("/student-details")) {
      return NextResponse.redirect(new URL("/student-details", request.url));
    }

    // If profile complete, redirect /student-details to /student
    if (profileCompleted && pathname.startsWith("/student-details")) {
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  // ─── ROLE-BASED ROUTE PROTECTION ───
  const forbidden: Record<string, string[]> = {
    student: ["/admin", "/company"],
    company: ["/admin", "/student"],
    admin: ["/company", "/student"],
  };

  const blocked = forbidden[role] ?? [];
  const isBlocked = blocked.some((prefix) => pathname.startsWith(prefix));

  if (isBlocked) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/company/:path*",
    "/company-details",
    "/student/:path*",
    "/student-details",
    "/login",
    "/register",
  ],
};