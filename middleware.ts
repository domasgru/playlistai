import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const isLoggedIn = req.auth;

  const session = await auth();
  console.log("middleware req.auth", req.auth);
  console.log("middleware session--->", session);

  // console.log("req.auth------>", req.auth);

  // if (!isLoggedIn) {
  //   // Redirect to the signin page with callbackUrl
  //   return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  // }

  return NextResponse.next();
});

// Optionally configure middleware to match specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
