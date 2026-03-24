import { NextResponse, type NextRequest } from "next/server";

// Decode JWT payload
function getJwtPayload(token: string): { role?: string; isApproved?: boolean; profileCompleted?: boolean } | null {
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
  const isApproved = payload?.isApproved;
  const profileCompleted = payload?.profileCompleted ;
  console.log(`[Proxy] ${pathname} | Role: ${role} | Approved: ${isApproved} | Profile Completed: ${profileCompleted}`);

  // ─── NOT logged in ───
  if (!role) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/company") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/company-details") ||
      pathname.startsWith("/messages") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/resume") ||
      pathname.startsWith("/applicants") ||
      pathname.startsWith('/pending')
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Non-admin users must wait on /pending until approved
  if (role !== 'admin' && isApproved === false) {
    if (!pathname.startsWith('/pending')) {
      return NextResponse.redirect(new URL('/pending', request.url));
    }
    return NextResponse.next();
  }

  // Approved users should not stay on pending page
  if (pathname.startsWith('/pending')) {
    return NextResponse.redirect(new URL(`/${role}`, request.url));
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
    "/messages/:path*",
    "/profile/:path*",
    "/resume/:path*",
    "/applicants/:path*",
    "/pending",
    "/login",
    "/register",
  ],
};