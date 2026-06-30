import "server-only";
import { cookies } from "next/headers";
import {
  estRoleValide,
  peutUtiliserApercu,
  rolesConsultablesEnApercu,
  type RoleId,
} from "@/lib/rbac";

/**
 * Mode Aperçu de rôle (cahier §4.5, §4.6) — stockage de l'état dans un cookie.
 * L'aperçu est purement une surcouche d'AFFICHAGE : l'utilisateur réel reste l'administrateur,
 * et toute écriture est bloquée (lecture seule). Voir getUtilisateurCourant pour l'application.
 */
export const COOKIE_APERCU = "eduweb_apercu";

/**
 * Renvoie le rôle prévisualisé valide pour cet administrateur, ou null.
 * Vérifie que l'administrateur a le droit d'aperçu ET que le rôle ciblé est dans son périmètre.
 */
export async function lireApercu(roleReel: RoleId): Promise<RoleId | null> {
  if (!peutUtiliserApercu(roleReel)) return null;
  const store = await cookies();
  const valeur = store.get(COOKIE_APERCU)?.value;
  if (!valeur || !estRoleValide(valeur)) return null;
  if (!rolesConsultablesEnApercu(roleReel).includes(valeur)) return null;
  return valeur;
}
