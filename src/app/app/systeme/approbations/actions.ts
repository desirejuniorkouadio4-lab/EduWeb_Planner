"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUtilisateurCourant } from "@/lib/auth/session";
import { envoyerEmail } from "@/lib/email/send";
import { gabaritDecisionRole } from "@/lib/email/templates";

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** En V1, seul l'administrateur système traite les demandes (cahier §6.4). */
async function exigerAdmin() {
  const admin = await getUtilisateurCourant();
  if (!admin || admin.roleReel !== "admin") {
    throw new Error("Action réservée à l'administrateur système.");
  }
  if (admin.apercuActif) {
    throw new Error("Mode aperçu : action en lecture seule.");
  }
  return admin;
}

async function journaliser(
  acteurId: string,
  acteurEmail: string,
  action: string,
  cible: string,
  details: Prisma.InputJsonValue,
) {
  try {
    await prisma.journalActivite.create({
      data: { utilisateurId: acteurId, acteurEmail, action, cible, details },
    });
  } catch (e) {
    console.error("[journal] non écrit :", e);
  }
}

export async function approuverDemande(formData: FormData) {
  const admin = await exigerAdmin();
  const demandeId = String(formData.get("demandeId") ?? "");
  if (!demandeId) return;

  const demande = await prisma.demandeRole.findUnique({
    where: { id: demandeId },
    include: { roleDemande: true, utilisateur: true },
  });
  if (!demande || demande.statut !== "en_attente") return;

  await prisma.$transaction([
    prisma.demandeRole.update({
      where: { id: demande.id },
      data: { statut: "approuvee", traiteLe: new Date(), traiteParId: admin.id },
    }),
    // À l'approbation, le rôle actif passe au rôle approuvé (cahier §6.2).
    // Le rattachement au périmètre réel (établissement/structure) sera résolu en Phase 2,
    // quand ces entités seront gérées ; il reste null ici.
    prisma.utilisateur.update({
      where: { id: demande.utilisateurId },
      data: { roleActifId: demande.roleDemandeId },
    }),
  ]);

  await journaliser(admin.id, admin.email, "demande_role.approuvee", `DemandeRole:${demande.id}`, {
    utilisateur: demande.utilisateur.email,
    roleApprouve: demande.roleDemande.nomTechnique,
  });

  const { subject, html } = gabaritDecisionRole(
    true,
    demande.roleDemande.libelle,
    `${baseUrl()}/connexion`,
    demande.utilisateur.prenoms,
  );
  try {
    await envoyerEmail({ to: demande.utilisateur.email, subject, html });
  } catch (e) {
    console.error("[email decision] échec :", e);
  }

  revalidatePath("/app/systeme/approbations");
}

export async function refuserDemande(formData: FormData) {
  const admin = await exigerAdmin();
  const demandeId = String(formData.get("demandeId") ?? "");
  if (!demandeId) return;

  const demande = await prisma.demandeRole.findUnique({
    where: { id: demandeId },
    include: { roleDemande: true, utilisateur: true },
  });
  if (!demande || demande.statut !== "en_attente") return;

  // Le rôle actif reste `eleve` (cahier §6.2). On historise et on notifie.
  await prisma.demandeRole.update({
    where: { id: demande.id },
    data: { statut: "refusee", traiteLe: new Date(), traiteParId: admin.id },
  });

  await journaliser(admin.id, admin.email, "demande_role.refusee", `DemandeRole:${demande.id}`, {
    utilisateur: demande.utilisateur.email,
    roleRefuse: demande.roleDemande.nomTechnique,
  });

  const { subject, html } = gabaritDecisionRole(
    false,
    demande.roleDemande.libelle,
    `${baseUrl()}/connexion`,
    demande.utilisateur.prenoms,
  );
  try {
    await envoyerEmail({ to: demande.utilisateur.email, subject, html });
  } catch (e) {
    console.error("[email decision] échec :", e);
  }

  revalidatePath("/app/systeme/approbations");
}
