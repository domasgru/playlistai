"use server";

import { signIn } from "@/auth";

export async function signInWithSpotify(redirectTo?: string) {
  await signIn("spotify", redirectTo ? { redirectTo } : undefined);
}
