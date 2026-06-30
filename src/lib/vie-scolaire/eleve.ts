import "server-only";
import { prisma } from "@/lib/prisma";

export interface ClasseEleve {
  id: string;
  nom: string;
  niveauNom: string;
  etablissementNom: string;
}

export interface ResumeAbsences {
  absents: number;
  retards: number;
  excuses: number;
  recents: { date: Date; statut: string; disciplineNom: string | null }[];
}

export interface NoteEleve {
  id: string;
  disciplineNom: string;
  libelle: string;
  valeur: number;
  sur: number;
  periode: number;
  date: Date;
}

/** Classe actuelle d'un élève (inscription la plus récente). */
export async function classeActuelleEleve(eleveId: string): Promise<ClasseEleve | null> {
  const insc = await prisma.inscription.findFirst({
    where: { eleveId },
    orderBy: { creeLe: "desc" },
    include: {
      classe: {
        select: {
          id: true,
          nom: true,
          niveau: { select: { nom: true } },
          etablissement: { select: { nom: true } },
        },
      },
    },
  });
  if (!insc) return null;
  return {
    id: insc.classe.id,
    nom: insc.classe.nom,
    niveauNom: insc.classe.niveau.nom,
    etablissementNom: insc.classe.etablissement.nom,
  };
}

/** Synthèse des absences/retards d'un élève + les plus récents. */
export async function resumeAbsencesEleve(eleveId: string, limite = 6): Promise<ResumeAbsences> {
  const [groupes, recents] = await Promise.all([
    prisma.presence.groupBy({
      by: ["statut"],
      where: { eleveId, statut: { in: ["absent", "retard", "excuse"] } },
      _count: { _all: true },
    }),
    prisma.presence.findMany({
      where: { eleveId, statut: { in: ["absent", "retard", "excuse"] } },
      orderBy: { appel: { date: "desc" } },
      take: limite,
      include: { appel: { select: { date: true, discipline: { select: { nom: true } } } } },
    }),
  ]);
  const compte = (s: string) => groupes.find((g) => g.statut === s)?._count._all ?? 0;
  return {
    absents: compte("absent"),
    retards: compte("retard"),
    excuses: compte("excuse"),
    recents: recents.map((p) => ({
      date: p.appel.date,
      statut: p.statut,
      disciplineNom: p.appel.discipline?.nom ?? null,
    })),
  };
}

/** Dernières notes d'un élève (toutes disciplines confondues). */
export async function dernieresNotesEleve(eleveId: string, limite = 8): Promise<NoteEleve[]> {
  const notes = await prisma.note.findMany({
    where: { eleveId },
    orderBy: { creeLe: "desc" },
    take: limite,
    include: { discipline: { select: { nom: true } } },
  });
  return notes.map((n) => ({
    id: n.id,
    disciplineNom: n.discipline.nom,
    libelle: n.libelle,
    valeur: n.valeur,
    sur: n.sur,
    periode: n.periode,
    date: n.creeLe,
  }));
}

/** Dernières entrées du cahier de texte d'une classe. */
export async function cahierRecentClasse(classeId: string, limite = 6) {
  const entrees = await prisma.cahierTexte.findMany({
    where: { classeId },
    orderBy: [{ date: "desc" }, { creeLe: "desc" }],
    take: limite,
    include: { discipline: { select: { nom: true, couleur: true } } },
  });
  return entrees.map((e) => ({
    id: e.id,
    date: e.date,
    contenu: e.contenu,
    travailAFaire: e.travailAFaire,
    disciplineNom: e.discipline.nom,
    disciplineCouleur: e.discipline.couleur,
  }));
}
