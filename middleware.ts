import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const isLoggedIn = req.auth;

  const session = await auth();

  return NextResponse.next();
});

// Optionally configure middleware to match specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
