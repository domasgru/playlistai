export { auth as middleware } from "@/auth";

// Optionally configure middleware to match specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
