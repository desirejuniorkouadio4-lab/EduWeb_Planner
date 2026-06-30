"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUtilisateurCourant } from "@/lib/auth/session";
import { hacherMotDePasse } from "@/lib/auth/password";

export interface EtatForm {
  ok: boolean;
  message?: string;
}

async function peutGerer(etablissementId: string) {
  const u = await getUtilisateurCourant();
  if (!u || u.apercuActif) return null;
  if (u.roleReel === "admin") return u;
  if (u.roleReel === "etablissements_admin" && u.portee.etablissementId === etablissementId) {
    return u;
  }
  return null;
}

/** Crée le compte enseignant s'il n'existe pas, sinon le rattache à l'établissement comme enseignant. */
async function creerOuRattacherEnseignant(
  email: string,
  prenoms: string,
  nom: string,
  etablissementId: string,
  roleEnseignantId: string,
): Promise<"cree" | "rattache" | "existant"> {
  const existant = await prisma.utilisateur.findUnique({ where: { email } });
  if (existant) {
    if (existant.roleActifId === roleEnseignantId && existant.etablissementId === etablissementId) {
      return "existant";
    }
    await prisma.utilisateur.update({
      where: { id: existant.id },
      data: { roleActifId: roleEnseignantId, etablissementId },
    });
    return "rattache";
  }
  const hash = await hacherMotDePasse(randomBytes(12).toString("base64url"));
  await prisma.utilisateur.create({
    data: {
      email,
      motDePasseHash: hash,
      prenoms,
      nom,
      statutCompte: "actif",
      emailVerifieLe: new Date(),
      roleActifId: roleEnseignantId,
      etablissementId,
    },
  });
  return "cree";
}

const schemaAjout = z.object({
  etablissementId: z.string().min(1),
  prenoms: z.string().trim().min(1, "Prénoms requis.").max(80),
  nom: z.string().trim().min(1, "Nom requis.").max(80),
  email: z.string().trim().toLowerCase().email("E-mail invalide."),
});

export async function ajouterEnseignant(_prev: EtatForm, formData: FormData): Promise<EtatForm> {
  const parsed = schemaAjout.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const u = await peutGerer(parsed.data.etablissementId);
  if (!u) return { ok: false, message: "Action non autorisée (ou mode aperçu)." };

  try {
    const role = await prisma.role.findUnique({ where: { nomTechnique: "enseignant" } });
    if (!role) return { ok: false, message: "Rôle enseignant introuvable (seed manquant ?)." };
    const r = await creerOuRattacherEnseignant(
      parsed.data.email,
      parsed.data.prenoms,
      parsed.data.nom,
      parsed.data.etablissementId,
      role.id,
    );
    revalidatePath(`/app/systeme/etablissements/${parsed.data.etablissementId}/enseignants`);
    const msg =
      r === "cree"
        ? "Enseignant créé (il définira son mot de passe via « mot de passe oublié »)."
        : r === "rattache"
          ? "Compte existant rattaché comme enseignant."
          : "Cet enseignant est déjà rattaché.";
    return { ok: true, message: msg };
  } catch (e) {
    console.error("[enseignant] erreur :", e);
    return { ok: false, message: "Erreur technique (base de données connectée ?)." };
  }
}

function parserCSV(texte: string): { prenoms: string; nom: string; email: string }[] {
  const lignes = texte.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lignes.length === 0) return [];
  const delim = lignes[0].includes(";") ? ";" : ",";
  const entete = lignes[0].toLowerCase();
  const aEntete = entete.includes("email") || entete.includes("nom");
  const corps = aEntete ? lignes.slice(1) : lignes;
  const out: { prenoms: string; nom: string; email: string }[] = [];
  for (const l of corps) {
    const cols = l.split(delim).map((c) => c.trim().replace(/^"|"$/g, ""));
    const [prenoms = "", nom = "", email = ""] = cols;
    if (email) out.push({ prenoms, nom, email: email.toLowerCase() });
  }
  return out;
}

export async function importerEnseignantsCSV(
  _prev: EtatForm,
  formData: FormData,
): Promise<EtatForm> {
  const etablissementId = String(formData.get("etablissementId") ?? "");
  const u = await peutGerer(etablissementId);
  if (!u) return { ok: false, message: "Action non autorisée (ou mode aperçu)." };

  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) {
    return { ok: false, message: "Aucun fichier CSV sélectionné." };
  }
  try {
    const texte = await fichier.text();
    const lignes = parserCSV(texte);
    if (lignes.length === 0) return { ok: false, message: "CSV vide ou illisible (colonnes : prénoms ; nom ; email)." };

    const role = await prisma.role.findUnique({ where: { nomTechnique: "enseignant" } });
    if (!role) return { ok: false, message: "Rôle enseignant introuvable (seed manquant ?)." };

    let crees = 0;
    let rattaches = 0;
    let ignores = 0;
    for (const l of lignes) {
      const emailOk = /.+@.+\..+/.test(l.email);
      if (!emailOk) {
        ignores++;
        continue;
      }
      const r = await creerOuRattacherEnseignant(l.email, l.prenoms, l.nom, etablissementId, role.id);
      if (r === "cree") crees++;
      else if (r === "rattache") rattaches++;
      else ignores++;
    }
    revalidatePath(`/app/systeme/etablissements/${etablissementId}/enseignants`);
    return {
      ok: true,
      message: `Import terminé : ${crees} créé(s), ${rattaches} rattaché(s), ${ignores} ignoré(s).`,
    };
  } catch (e) {
    console.error("[import csv] erreur :", e);
    return { ok: false, message: "Erreur lors de l'import." };
  }
}

export async function enregistrerCompetences(formData: FormData) {
  const etablissementId = String(formData.get("etablissementId") ?? "");
  const enseignantId = String(formData.get("enseignantId") ?? "");
  if (!etablissementId || !enseignantId) return;
  const u = await peutGerer(etablissementId);
  if (!u) return;

  const disciplineIds: string[] = [];
  for (const [cle, val] of formData.entries()) {
    if (cle.startsWith("disc_") && val === "on") disciplineIds.push(cle.slice("disc_".length));
  }

  try {
    await prisma.competenceEnseignant.deleteMany({ where: { enseignantId, etablissementId } });
    if (disciplineIds.length > 0) {
      await prisma.competenceEnseignant.createMany({
        data: disciplineIds.map((disciplineId) => ({ enseignantId, disciplineId, etablissementId })),
        skipDuplicates: true,
      });
    }
    revalidatePath(`/app/systeme/etablissements/${etablissementId}/enseignants`);
  } catch (e) {
    console.error("[competences] erreur :", e);
  }
}
