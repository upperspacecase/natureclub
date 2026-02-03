export default function middleware() {
  // Auth is disabled for now.
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|mock_images).*)"],
}
