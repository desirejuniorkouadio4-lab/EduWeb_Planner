"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUtilisateurCourant, type UtilisateurCourant } from "@/lib/auth/session";

export interface EtatForm {
  ok: boolean;
  message?: string;
}

const STATUTS = ["present", "absent", "retard", "excuse"] as const;
type Statut = (typeof STATUTS)[number];

/** Peut-on saisir l'appel pour cette classe ? (admin, chef/éducateur du périmètre, ou enseignant affecté) */
async function peutSaisir(u: UtilisateurCourant, classeId: string): Promise<boolean> {
  if (u.apercuActif) return false;
  const classe = await prisma.classe.findUnique({ where: { id: classeId } });
  if (!classe) return false;
  if (u.roleReel === "admin") return true;
  if (
    (u.roleReel === "chef_etablissement" || u.roleReel === "educateur") &&
    classe.etablissementId === u.portee.etablissementId
  ) {
    return true;
  }
  if (u.roleReel === "enseignant") {
    const aff = await prisma.affectationEnseignant.findFirst({
      where: { enseignantId: u.id, classeId },
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

export async function enregistrerAppel(_prev: EtatForm, formData: FormData): Promise<EtatForm> {
  const u = await getUtilisateurCourant();
  if (!u) return { ok: false, message: "Session expirée." };

  const classeId = String(formData.get("classeId") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const disciplineId = String(formData.get("disciplineId") ?? "").trim() || null;
  const date = normaliserDate(dateStr);
  if (!classeId || !date) return { ok: false, message: "Classe ou date invalide." };

  if (!(await peutSaisir(u, classeId))) {
    return { ok: false, message: "Action non autorisée (ou mode aperçu)." };
  }

  // Statuts saisis : champs `statut_<eleveId>`.
  const statuts: { eleveId: string; statut: Statut }[] = [];
  for (const [cle, val] of formData.entries()) {
    if (!cle.startsWith("statut_")) continue;
    const eleveId = cle.slice("statut_".length);
    const statut = String(val) as Statut;
    if (STATUTS.includes(statut)) statuts.push({ eleveId, statut });
  }
  if (statuts.length === 0) return { ok: false, message: "Aucun élève à enregistrer." };

  try {
    // Réutilise l'appel existant de cette classe / date / discipline, sinon en crée un.
    let appel = await prisma.appel.findFirst({ where: { classeId, date, disciplineId } });
    if (!appel) {
      appel = await prisma.appel.create({
        data: { classeId, date, disciplineId, saisiParId: u.id },
      });
    }
    await Promise.all(
      statuts.map((s) =>
        prisma.presence.upsert({
          where: { appelId_eleveId: { appelId: appel!.id, eleveId: s.eleveId } },
          update: { statut: s.statut },
          create: { appelId: appel!.id, eleveId: s.eleveId, statut: s.statut },
        }),
      ),
    );
    revalidatePath("/app/vie-scolaire/registre-appel");
  } catch (e) {
    console.error("[appel] erreur :", e);
    return { ok: false, message: "Erreur technique (base de données connectée ?)." };
  }
  return { ok: true, message: "Appel enregistré." };
}
