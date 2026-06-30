"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUtilisateurCourant } from "@/lib/auth/session";

export interface EtatForm {
  ok: boolean;
  message?: string;
  erreurs?: Record<string, string[] | undefined>;
}

const TYPES = ["prescolaire", "primaire", "college", "lycee", "groupe_scolaire", "autre"] as const;
const STATUTS = ["public", "prive", "confessionnel", "autre"] as const;
const TYPES_SALLE = ["ordinaire", "laboratoire", "salle_informatique", "atelier", "salle_eps", "autre"] as const;
const VACATIONS = ["simple", "double"] as const;

/** Création d'établissement : administrateur système uniquement, hors aperçu. */
async function exigerAdmin() {
  const u = await getUtilisateurCourant();
  if (!u || u.roleReel !== "admin" || u.apercuActif) return null;
  return u;
}

/** Gestion d'un établissement donné : admin, ou admin d'établissement de ce périmètre. */
async function peutGerer(etablissementId: string) {
  const u = await getUtilisateurCourant();
  if (!u || u.apercuActif) return null;
  if (u.roleReel === "admin") return u;
  if (u.roleReel === "etablissements_admin" && u.portee.etablissementId === etablissementId) {
    return u;
  }
  return null;
}

const schemaEtablissement = z.object({
  nom: z.string().trim().min(2, "Nom requis.").max(120),
  type: z.enum(TYPES),
  statut: z.enum(STATUTS),
  regionId: z.string().trim().optional().or(z.literal("")),
  ville: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function creerEtablissement(_prev: EtatForm, formData: FormData): Promise<EtatForm> {
  const admin = await exigerAdmin();
  if (!admin) return { ok: false, message: "Action réservée à l'administrateur (hors aperçu)." };

  const parsed = schemaEtablissement.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger les champs.",
      erreurs: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;
  try {
    await prisma.etablissement.create({
      data: {
        nom: d.nom,
        type: d.type,
        statut: d.statut,
        ville: d.ville || null,
        regionId: d.regionId || null,
      },
    });
    revalidatePath("/app/systeme/etablissements");
  } catch (e) {
    console.error("[etablissement] erreur :", e);
    return { ok: false, message: "Erreur technique (base de données connectée ?)." };
  }
  return { ok: true, message: "Établissement créé." };
}

const schemaSalle = z.object({
  etablissementId: z.string().min(1),
  nom: z.string().trim().min(1, "Nom requis.").max(80),
  capacite: z.coerce.number().int().min(0).max(2000),
  type: z.enum(TYPES_SALLE),
});

export async function creerSalle(_prev: EtatForm, formData: FormData): Promise<EtatForm> {
  const parsed = schemaSalle.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Veuillez corriger les champs.", erreurs: parsed.error.flatten().fieldErrors };
  }
  const u = await peutGerer(parsed.data.etablissementId);
  if (!u) return { ok: false, message: "Action non autorisée (ou mode aperçu)." };

  try {
    await prisma.salle.create({
      data: {
        nom: parsed.data.nom,
        capacite: parsed.data.capacite,
        type: parsed.data.type,
        etablissementId: parsed.data.etablissementId,
      },
    });
    revalidatePath(`/app/systeme/etablissements/${parsed.data.etablissementId}`);
  } catch (e) {
    console.error("[salle] erreur :", e);
    return { ok: false, message: "Erreur technique." };
  }
  return { ok: true, message: "Salle ajoutée." };
}

const schemaClasse = z.object({
  etablissementId: z.string().min(1),
  nom: z.string().trim().min(1, "Nom requis.").max(80),
  niveauId: z.string().min(1, "Niveau requis."),
  effectif: z.coerce.number().int().min(0).max(2000),
  regimeVacation: z.enum(VACATIONS),
});

export async function creerClasse(_prev: EtatForm, formData: FormData): Promise<EtatForm> {
  const parsed = schemaClasse.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Veuillez corriger les champs.", erreurs: parsed.error.flatten().fieldErrors };
  }
  const u = await peutGerer(parsed.data.etablissementId);
  if (!u) return { ok: false, message: "Action non autorisée (ou mode aperçu)." };

  try {
    const anneeActive = await prisma.anneeScolaire.findFirst({ where: { active: true } });
    await prisma.classe.create({
      data: {
        nom: parsed.data.nom,
        niveauId: parsed.data.niveauId,
        effectif: parsed.data.effectif,
        regimeVacation: parsed.data.regimeVacation,
        etablissementId: parsed.data.etablissementId,
        anneeScolaireId: anneeActive?.id ?? null,
      },
    });
    revalidatePath(`/app/systeme/etablissements/${parsed.data.etablissementId}`);
  } catch (e) {
    console.error("[classe] erreur :", e);
    return { ok: false, message: "Erreur technique." };
  }
  return { ok: true, message: "Classe ajoutée." };
}
