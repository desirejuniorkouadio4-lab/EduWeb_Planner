"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUtilisateurCourant, type UtilisateurCourant } from "@/lib/auth/session";

export interface EtatForm {
  ok: boolean;
  message?: string;
}

const BASE = "/app/vie-scolaire/cahier-texte";

/**
 * Peut-on consigner le cahier de texte pour cette classe / discipline ?
 * admin · chef d'établissement du périmètre · enseignant affecté à la discipline dans la classe.
 */
async function peutSaisir(
  u: UtilisateurCourant,
  classeId: string,
  disciplineId: string,
): Promise<boolean> {
  if (u.apercuActif) return false;
  const classe = await prisma.classe.findUnique({ where: { id: classeId } });
  if (!classe) return false;
  if (u.roleReel === "admin") return true;
  if (
    u.roleReel === "chef_etablissement" &&
    classe.etablissementId === u.portee.etablissementId
  ) {
    return true;
  }
  if (u.roleReel === "enseignant") {
    const aff = await prisma.affectationEnseignant.findFirst({
      where: { enseignantId: u.id, classeId, disciplineId },
    });
    return Boolean(aff);
  }
  return false;
}

function normaliserDate(valeur: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur)) return null;
  const d = new Date(`${valeur}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function enregistrerEntree(_prev: EtatForm, formData: FormData): Promise<EtatForm> {
  const u = await getUtilisateurCourant();
  if (!u) return { ok: false, message: "Session expirée." };

  const classeId = String(formData.get("classeId") ?? "");
  const disciplineId = String(formData.get("disciplineId") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const contenu = String(formData.get("contenu") ?? "").trim();
  const travailAFaire = String(formData.get("travailAFaire") ?? "").trim() || null;
  const date = normaliserDate(dateStr);

  if (!classeId || !disciplineId || !date) {
    return { ok: false, message: "Classe, discipline ou date invalide." };
  }
  if (!contenu) return { ok: false, message: "Le contenu de la séance est obligatoire." };

  if (!(await peutSaisir(u, classeId, disciplineId))) {
    return { ok: false, message: "Action non autorisée (ou mode aperçu)." };
  }

  try {
    await prisma.cahierTexte.create({
      data: { classeId, disciplineId, date, contenu, travailAFaire, saisiParId: u.id },
    });
    revalidatePath(BASE);
  } catch (e) {
    console.error("[cahier-texte] enregistrement :", e);
    return { ok: false, message: "Erreur technique (base de données connectée ?)." };
  }
  return { ok: true, message: "Séance consignée dans le cahier de texte." };
}

export async function supprimerEntree(entreeId: string): Promise<EtatForm> {
  const u = await getUtilisateurCourant();
  if (!u) return { ok: false, message: "Session expirée." };
  if (u.apercuActif) return { ok: false, message: "Action non autorisée en mode aperçu." };

  const entree = await prisma.cahierTexte.findUnique({
    where: { id: entreeId },
    include: { classe: { select: { etablissementId: true } } },
  });
  if (!entree) return { ok: false, message: "Entrée introuvable." };

  const autorise =
    u.roleReel === "admin" ||
    (u.roleReel === "chef_etablissement" &&
      entree.classe.etablissementId === u.portee.etablissementId) ||
    (u.roleReel === "enseignant" && entree.saisiParId === u.id);
  if (!autorise) return { ok: false, message: "Suppression non autorisée." };

  try {
    await prisma.cahierTexte.delete({ where: { id: entreeId } });
    revalidatePath(BASE);
  } catch (e) {
    console.error("[cahier-texte] suppression :", e);
    return { ok: false, message: "Erreur technique." };
  }
  return { ok: true, message: "Entrée supprimée." };
}
