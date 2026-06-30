"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUtilisateurCourant } from "@/lib/auth/session";

export interface NotificationItem {
  id: string;
  type: "info" | "succes" | "alerte" | "role";
  titre: string;
  message: string;
  lien: string | null;
  lu: boolean;
  creeLe: string; // ISO
}

export interface ChargementNotifications {
  notifications: NotificationItem[];
  nombreNonLues: number;
}

/** Charge les notifications récentes de l'utilisateur courant + le nombre de non lues. */
export async function chargerNotifications(limite = 12): Promise<ChargementNotifications> {
  const u = await getUtilisateurCourant();
  if (!u) return { notifications: [], nombreNonLues: 0 };

  try {
    const [brutes, nombreNonLues] = await Promise.all([
      prisma.notification.findMany({
        where: { destinataireId: u.id },
        orderBy: { creeLe: "desc" },
        take: limite,
      }),
      prisma.notification.count({ where: { destinataireId: u.id, lu: false } }),
    ]);
    return {
      notifications: brutes.map((n) => ({
        id: n.id,
        type: n.type,
        titre: n.titre,
        message: n.message,
        lien: n.lien,
        lu: n.lu,
        creeLe: n.creeLe.toISOString(),
      })),
      nombreNonLues,
    };
  } catch (e) {
    console.error("[notifications] chargement échoué :", e);
    return { notifications: [], nombreNonLues: 0 };
  }
}

/** Marque une notification comme lue (uniquement si elle appartient à l'utilisateur). */
export async function marquerLue(id: string): Promise<void> {
  const u = await getUtilisateurCourant();
  if (!u) return;
  try {
    await prisma.notification.updateMany({
      where: { id, destinataireId: u.id, lu: false },
      data: { lu: true, luLe: new Date() },
    });
    revalidatePath("/app", "layout");
  } catch (e) {
    console.error("[notifications] marquage échoué :", e);
  }
}

/** Marque toutes les notifications de l'utilisateur comme lues. */
export async function marquerToutesLues(): Promise<void> {
  const u = await getUtilisateurCourant();
  if (!u) return;
  try {
    await prisma.notification.updateMany({
      where: { destinataireId: u.id, lu: false },
      data: { lu: true, luLe: new Date() },
    });
    revalidatePath("/app", "layout");
  } catch (e) {
    console.error("[notifications] marquage global échoué :", e);
  }
}
