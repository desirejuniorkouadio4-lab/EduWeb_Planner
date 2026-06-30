"use server";

import { signOut } from "@/lib/auth";

export async function seDeconnecter() {
  await signOut({ redirectTo: "/connexion" });
}
