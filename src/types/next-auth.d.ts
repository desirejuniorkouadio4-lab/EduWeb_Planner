import type { DefaultSession } from "next-auth";

/**
 * Augmentation des types Auth.js : on ajoute l'identifiant à la session.
 * Les données riches (rôle actif, périmètre, statut, demande en attente) ne sont
 * volontairement PAS stockées dans le JWT : elles sont relues en base à chaque requête
 * (voir getUtilisateurCourant) afin de ne jamais servir un rôle périmé après une approbation.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}
