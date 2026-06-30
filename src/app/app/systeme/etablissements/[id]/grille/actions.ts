"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUtilisateurCourant } from "@/lib/auth/session";

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

interface LignePayload {
  coef: number;
  seances: number[];
}

/**
 * Enregistre la grille (séances + coefficient) d'un NIVEAU pour un établissement (Étape 3).
 * Le volume hebdomadaire est dérivé de la somme des durées de séances.
 */
export async function enregistrerSeances(_prev: EtatForm, formData: FormData): Promise<EtatForm> {
  const etablissementId = String(formData.get("etablissementId") ?? "");
  const niveauId = String(formData.get("niveauId") ?? "");
  const brut = String(formData.get("payload") ?? "");
  if (!etablissementId || !niveauId) return { ok: false, message: "Données invalides." };

  const u = await peutGerer(etablissementId);
  if (!u) return { ok: false, message: "Action non autorisée (ou mode aperçu)." };

  let payload: Record<string, LignePayload>;
  try {
    payload = JSON.parse(brut);
  } catch {
    return { ok: false, message: "Données du formulaire illisibles." };
  }

  try {
    const operations = Object.entries(payload).map(([disciplineId, ligne]) => {
      const seances = (ligne.seances ?? [])
        .map((m) => Math.max(0, Math.round(Number(m) || 0)))
        .filter((m) => m > 0);
      const coef = Math.max(0, Number(ligne.coef) || 0);
      const heuresHebdo = seances.reduce((a, b) => a + b, 0) / 60;
      return prisma.grilleHoraire.upsert({
        where: {
          niveauId_disciplineId_etablissementId: { niveauId, disciplineId, etablissementId },
        },
        update: { seancesMinutes: seances, coefficient: coef, heuresHebdo, nbSeances: seances.length },
        create: {
          niveauId,
          disciplineId,
          etablissementId,
          seancesMinutes: seances,
          coefficient: coef,
          heuresHebdo,
          nbSeances: seances.length,
        },
      });
    });
    await Promise.all(operations);
    revalidatePath(`/app/systeme/etablissements/${etablissementId}/grille`);
  } catch (e) {
    console.error("[seances] erreur :", e);
    return { ok: false, message: "Erreur technique (base de données connectée ?)." };
  }
  return { ok: true, message: "Grille enregistrée." };
}
