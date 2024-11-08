"use server";

import { signIn } from "@/auth";

export async function signInWithSpotify(redirectTo = "/?test=true") {
  await signIn("spotify", { redirectTo });
}
