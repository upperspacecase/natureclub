import { NextResponse } from "next/server";

export default function middleware(req) {
  // Rewrite /@username → /profile/username
  if (req.nextUrl.pathname.startsWith("/@")) {
    const username = req.nextUrl.pathname.slice(2); // strip /@
    const url = req.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.rewrite(url);
  }

  // Protect facilitator routes — redirect to signin if no session
  const isProtected =
    req.nextUrl.pathname.startsWith("/events") ||
    req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtected) {
    const token = req.cookies.get("nc_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
