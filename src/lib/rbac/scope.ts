import type { Prisma } from "@prisma/client";
import { ROLES, type RoleId, type TypePortee } from "./roles";

/**
 * Logique de PÉRIMÈTRE (scope) — cahier des charges §4.3.
 *
 * Deux utilisateurs de même rôle mais de périmètres différents ne voient JAMAIS les
 * mêmes données. Cette couche produit des filtres Prisma (`where`) à appliquer côté
 * serveur AVANT tout renvoi au client. Elle est centralisée ici et ne doit pas être
 * réécrite module par module (CLAUDE.md §3, §9).
 */

/** Représentation minimale du périmètre d'un utilisateur, dérivée de sa session. */
export interface PorteeUtilisateur {
  utilisateurId: string;
  roleId: RoleId;
  etablissementId: string | null;
  cafopId: string | null;
  apfcId: string | null;
  regionId: string | null;
}

/** Filtre qui ne correspond à AUCUNE ligne (périmètre incompatible avec l'entité demandée). */
const AUCUN_RESULTAT = { id: { in: [] as string[] } } as const;

export function estGlobal(roleId: RoleId): boolean {
  return ROLES[roleId].portee === "global";
}

export function typePortee(roleId: RoleId): TypePortee {
  return ROLES[roleId].portee;
}

/**
 * Filtre des ÉTABLISSEMENTS visibles selon le périmètre.
 * - admin (global) : tous.
 * - région (drena, inspecteur) : ceux de la région.
 * - établissement (chef_etablissement, enseignant, educateur, etablissements_admin) : le sien.
 * - autres périmètres (cafop, apfc, antenne, personnel) : aucun établissement par défaut.
 */
export function filtreEtablissements(p: PorteeUtilisateur): Prisma.EtablissementWhereInput {
  switch (typePortee(p.roleId)) {
    case "global":
      return {};
    case "region":
      return p.regionId ? { regionId: p.regionId } : AUCUN_RESULTAT;
    case "etablissement":
      return p.etablissementId ? { id: p.etablissementId } : AUCUN_RESULTAT;
    default:
      return AUCUN_RESULTAT;
  }
}

/** Filtre des CAFOP visibles selon le périmètre. */
export function filtreCafops(p: PorteeUtilisateur): Prisma.CafopWhereInput {
  switch (typePortee(p.roleId)) {
    case "global":
      return {};
    case "region":
      return p.regionId ? { regionId: p.regionId } : AUCUN_RESULTAT;
    case "cafop":
      return p.cafopId ? { id: p.cafopId } : AUCUN_RESULTAT;
    default:
      return AUCUN_RESULTAT;
  }
}

/** Filtre des APFC visibles selon le périmètre. */
export function filtreApfcs(p: PorteeUtilisateur): Prisma.ApfcWhereInput {
  switch (typePortee(p.roleId)) {
    case "global":
      return {};
    case "region":
      return p.regionId ? { regionId: p.regionId } : AUCUN_RESULTAT;
    case "apfc":
      return p.apfcId ? { id: p.apfcId } : AUCUN_RESULTAT;
    default:
      return AUCUN_RESULTAT;
  }
}

/** Filtre des RÉGIONS visibles selon le périmètre. */
export function filtreRegions(p: PorteeUtilisateur): Prisma.RegionWhereInput {
  if (estGlobal(p.roleId)) return {};
  if (p.regionId) return { id: p.regionId };
  // Un rôle rattaché à un établissement/structure ne voit que la région de celui-ci :
  // ce raffinement (jointure) sera ajouté en Phase 2 quand les rattachements seront densifiés.
  return AUCUN_RESULTAT;
}

/**
 * Vérifie qu'un identifiant d'établissement donné est DANS le périmètre.
 * Utilisé pour autoriser/refuser une action ciblée (et non une simple liste).
 * Le contrôle régional réel (établissement appartenant à la région) nécessite une
 * vérification en base ; ici on traite les cas déterminables sans requête.
 */
export function etablissementDansPortee(
  p: PorteeUtilisateur,
  etablissementId: string,
): boolean | "verifier_en_base" {
  switch (typePortee(p.roleId)) {
    case "global":
      return true;
    case "etablissement":
      return p.etablissementId === etablissementId;
    case "region":
      return "verifier_en_base"; // dépend de la région de l'établissement
    default:
      return false;
  }
}
