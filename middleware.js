import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/events(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Rewrite /@username → /profile/username
  if (req.nextUrl.pathname.startsWith("/@")) {
    const username = req.nextUrl.pathname.slice(2); // strip /@
    const url = req.nextUrl.clone();
    url.pathname = `/profile/${username}`;
    return NextResponse.rewrite(url);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

