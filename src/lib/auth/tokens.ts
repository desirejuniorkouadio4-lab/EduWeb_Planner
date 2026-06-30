import "server-only";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

type TypeJeton = "verification_email" | "reinitialisation_mot_de_passe";

export const DUREE_VERIFICATION_MS = 24 * 60 * 60 * 1000; // 24 h
export const DUREE_REINITIALISATION_MS = 60 * 60 * 1000; // 1 h

function genererToken(): string {
  return randomBytes(32).toString("hex");
}

/** Crée un jeton à usage unique et renvoie sa valeur (à insérer dans le lien e-mail). */
export async function creerJeton(
  utilisateurId: string,
  type: TypeJeton,
  dureeMs: number,
): Promise<string> {
  const token = genererToken();
  await prisma.jeton.create({
    data: {
      token,
      type,
      utilisateurId,
      expireLe: new Date(Date.now() + dureeMs),
    },
  });
  return token;
}

/**
 * Valide et CONSOMME un jeton (le marque utilisé). Renvoie l'identifiant utilisateur
 * si le jeton est valide, non expiré et du bon type ; sinon null.
 */
export async function consommerJeton(
  token: string,
  type: TypeJeton,
): Promise<{ utilisateurId: string } | null> {
  const jeton = await prisma.jeton.findUnique({ where: { token } });
  if (!jeton) return null;
  if (jeton.type !== type) return null;
  if (jeton.utiliseLe) return null;
  if (jeton.expireLe.getTime() < Date.now()) return null;

  await prisma.jeton.update({
    where: { id: jeton.id },
    data: { utiliseLe: new Date() },
  });
  return { utilisateurId: jeton.utilisateurId };
}
