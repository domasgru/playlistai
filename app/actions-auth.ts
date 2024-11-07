"use server";

import { signIn } from "@/auth";

export async function signInWithSpotify() {
  await signIn("spotify");
}
