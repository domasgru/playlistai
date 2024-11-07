import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const isOnHomePage = req.nextUrl.pathname === "/";

  const session = await auth();
  console.log("middleware session", session);

  // if (isLoggedIn && isOnHomePage) {
  //   return NextResponse.redirect(new URL("/playlists", req.url));
  // }

  return NextResponse.next();
});

// Optionally configure middleware to match specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
