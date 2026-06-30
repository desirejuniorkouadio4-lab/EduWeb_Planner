import "server-only";
import { prisma } from "@/lib/prisma";
import { consommerJeton } from "./tokens";

export type ResultatVerification = "succes" | "invalide" | "erreur";

/**
 * Confirme l'e-mail : consomme le jeton et passe le compte au statut `actif` (cahier §6.2).
 * Le rôle reste `eleve` et la demande de rôle en attente : l'accès est débloqué après
 * approbation, pas après confirmation d'e-mail.
 */
export async function verifierEmail(token: string): Promise<ResultatVerification> {
  try {
    const resultat = await consommerJeton(token, "verification_email");
    if (!resultat) return "invalide";

    await prisma.utilisateur.update({
      where: { id: resultat.utilisateurId },
      data: { statutCompte: "actif", emailVerifieLe: new Date() },
    });
    return "succes";
  } catch (e) {
    console.error("[verification-email] erreur :", e);
    return "erreur";
  }
}
