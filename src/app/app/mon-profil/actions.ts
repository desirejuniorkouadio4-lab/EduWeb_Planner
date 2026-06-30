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

const schema = z.object({
  prenoms: z.string().trim().min(1, "Prénoms requis.").max(80),
  nom: z.string().trim().min(1, "Nom requis.").max(80),
  telephone: z.string().trim().max(30).optional().or(z.literal("")),
  langue: z.enum(["fr", "en"]),
});

export async function mettreAJourProfil(
  _prev: EtatForm,
  formData: FormData,
): Promise<EtatForm> {
  const u = await getUtilisateurCourant();
  if (!u) return { ok: false, message: "Votre session a expiré. Reconnectez-vous." };
  if (u.apercuActif) {
    return { ok: false, message: "Mode aperçu : modification désactivée (lecture seule)." };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Veuillez corriger les champs signalés.",
      erreurs: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.utilisateur.update({
      where: { id: u.id },
      data: {
        prenoms: parsed.data.prenoms,
        nom: parsed.data.nom,
        telephone: parsed.data.telephone || null,
        langue: parsed.data.langue,
      },
    });
    revalidatePath("/app/mon-profil");
    revalidatePath("/app/mon-identification");
  } catch (e) {
    console.error("[profil] erreur :", e);
    return { ok: false, message: "Une erreur technique est survenue." };
  }

  return { ok: true, message: "Profil mis à jour avec succès." };
}
