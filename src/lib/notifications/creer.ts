import "server-only";
import { prisma } from "@/lib/prisma";

export type TypeNotif = "info" | "succes" | "alerte" | "role";

/**
 * Socle commun des notifications in-app (CLAUDE.md §3 : logique centralisée, jamais dupliquée).
 * Tout module appelle ce helper pour notifier un utilisateur. Les échecs sont silencieux :
 * une notification ne doit jamais faire échouer l'action métier qui la déclenche.
 */
export async function creerNotification(params: {
  destinataireId: string;
  titre: string;
  message: string;
  type?: TypeNotif;
  lien?: string | null;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        destinataireId: params.destinataireId,
        titre: params.titre.slice(0, 200),
        message: params.message.slice(0, 1000),
        type: params.type ?? "info",
        lien: params.lien ?? null,
      },
    });
  } catch (e) {
    console.error("[notifications] création échouée :", e);
  }
}

/** Notifie en lot plusieurs destinataires avec le même contenu. */
export async function creerNotifications(
  destinataireIds: string[],
  contenu: { titre: string; message: string; type?: TypeNotif; lien?: string | null },
): Promise<void> {
  if (destinataireIds.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: destinataireIds.map((destinataireId) => ({
        destinataireId,
        titre: contenu.titre.slice(0, 200),
        message: contenu.message.slice(0, 1000),
        type: contenu.type ?? "info",
        lien: contenu.lien ?? null,
      })),
    });
  } catch (e) {
    console.error("[notifications] création en lot échouée :", e);
  }
}
