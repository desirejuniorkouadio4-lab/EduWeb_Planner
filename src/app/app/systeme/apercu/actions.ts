"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUtilisateurCourant } from "@/lib/auth/session";
import { COOKIE_APERCU } from "@/lib/auth/apercu";
import { estRoleValide, peutUtiliserApercu, rolesConsultablesEnApercu } from "@/lib/rbac";

export async function activerApercu(formData: FormData) {
  const u = await getUtilisateurCourant();
  if (!u) return;
  // Autorisation fondée sur le rôle RÉEL (en aperçu, roleReel reste celui de l'admin).
  if (!peutUtiliserApercu(u.roleReel)) return;

  const role = String(formData.get("role") ?? "");
  if (!estRoleValide(role)) return;
  if (!rolesConsultablesEnApercu(u.roleReel).includes(role)) return;

  const store = await cookies();
  store.set(COOKIE_APERCU, role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/app");
}

export async function quitterApercu() {
  const store = await cookies();
  store.delete(COOKIE_APERCU);
  redirect("/app");
}
