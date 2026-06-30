import type { Metadata } from "next";
import { NotebookPen, BookText } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { resoudreEtablissement } from "@/lib/vie-scolaire/contexte";
import { PageHeader, Card } from "@/components/app/ui";
import { SelecteurEtablissement } from "@/components/app/selecteur-etablissement";
import { CahierForm, SupprimerEntreeButton } from "./form";

export const metadata: Metadata = { title: "Cahier de texte" };
export const dynamic = "force-dynamic";

const BASE = "/app/vie-scolaire/cahier-texte";
const ROLES_EDITEURS = ["admin", "chef_etablissement", "enseignant"] as const;

function nomComplet(p: { prenoms: string | null; nom: string | null; email: string }) {
  return [p.prenoms, p.nom].filter(Boolean).join(" ") || p.email;
}
function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}
function dateFr(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full" }).format(d);
}

/** Déduplique une liste {id, nom} par id, triée par nom (classes ou disciplines). */
function dedupParId(liste: { id: string; nom: string }[]) {
  const vues = new Map<string, { id: string; nom: string }>();
  for (const d of liste) if (!vues.has(d.id)) vues.set(d.id, d);
  return [...vues.values()].sort((a, b) => a.nom.localeCompare(b.nom));
}

export default async function CahierTextePage({
  searchParams,
}: {
  searchParams: Promise<{ etab?: string; classe?: string; date?: string; discipline?: string }>;
}) {
  const u = await requireRole([
    "admin",
    "chef_etablissement",
    "enseignant",
    "parent",
    "eleve",
  ]);
  const sp = await searchParams;

  const estEditeur = (ROLES_EDITEURS as readonly string[]).includes(u.roleReel);
  const canEdit = estEditeur && !u.apercuActif;

  let classes: { id: string; nom: string }[] = [];
  let etablissements: { id: string; nom: string }[] = [];
  let etabId: string | null = null;
  let adminSansEtab = false;
  let erreur = false;

  try {
    if (u.roleReel === "enseignant") {
      classes = await prisma.classe.findMany({
        where: { affectations: { some: { enseignantId: u.id } } },
        orderBy: { nom: "asc" },
        select: { id: true, nom: true },
      });
    } else if (u.roleReel === "chef_etablissement") {
      etabId = u.portee.etablissementId;
      if (etabId) {
        classes = await prisma.classe.findMany({
          where: { etablissementId: etabId },
          orderBy: { nom: "asc" },
          select: { id: true, nom: true },
        });
      }
    } else if (u.roleReel === "eleve") {
      const insc = await prisma.inscription.findMany({
        where: { eleveId: u.id },
        orderBy: { creeLe: "desc" },
        include: { classe: { select: { id: true, nom: true } } },
      });
      classes = dedupParId(insc.map((i) => i.classe));
    } else if (u.roleReel === "parent") {
      const liens = await prisma.lienParentEleve.findMany({
        where: { parentId: u.id },
        select: { eleveId: true },
      });
      const eleveIds = liens.map((l) => l.eleveId);
      const insc =
        eleveIds.length > 0
          ? await prisma.inscription.findMany({
              where: { eleveId: { in: eleveIds } },
              include: { classe: { select: { id: true, nom: true } } },
            })
          : [];
      classes = dedupParId(insc.map((i) => i.classe));
    } else {
      // admin
      const ctx = await resoudreEtablissement(u, sp.etab);
      etablissements = ctx.etablissements;
      etabId = ctx.etabId;
      if (!etabId) adminSansEtab = true;
      else {
        classes = await prisma.classe.findMany({
          where: { etablissementId: etabId },
          orderBy: { nom: "asc" },
          select: { id: true, nom: true },
        });
      }
    }
  } catch (e) {
    console.error("[cahier-texte] DB indisponible :", e);
    erreur = true;
  }

  if (adminSansEtab) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          titre="Cahier de texte"
          description="Choisissez un établissement pour consulter ou consigner les séances."
        />
        <SelecteurEtablissement basePath={BASE} etablissements={etablissements} etabId={null} />
      </div>
    );
  }

  // Sélection de classe : paramètre, sinon première classe disponible (élève = sa classe).
  const classeSel = classes.find((c) => c.id === sp.classe) ?? classes[0] ?? null;
  const dateSel = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : aujourdhui();
  const disciplineParDefaut = sp.discipline?.trim() || null;

  // Disciplines proposées dans le formulaire (éditeurs uniquement).
  let disciplinesForm: { id: string; nom: string }[] = [];
  // Journal des entrées de la classe sélectionnée.
  let entrees: {
    id: string;
    date: Date;
    contenu: string;
    travailAFaire: string | null;
    disciplineNom: string;
    disciplineCouleur: string | null;
    auteur: string;
    auteurId: string;
  }[] = [];

  if (!erreur && classeSel) {
    try {
      if (canEdit) {
        if (u.roleReel === "enseignant") {
          const affs = await prisma.affectationEnseignant.findMany({
            where: { enseignantId: u.id, classeId: classeSel.id },
            include: { discipline: { select: { id: true, nom: true } } },
          });
          disciplinesForm = dedupParId(affs.map((a) => a.discipline));
        } else {
          const affs = await prisma.affectationEnseignant.findMany({
            where: { classeId: classeSel.id },
            include: { discipline: { select: { id: true, nom: true } } },
          });
          disciplinesForm = dedupParId(affs.map((a) => a.discipline));
          if (disciplinesForm.length === 0) {
            disciplinesForm = await prisma.discipline.findMany({
              orderBy: { nom: "asc" },
              select: { id: true, nom: true },
            });
          }
        }
      }

      const brutes = await prisma.cahierTexte.findMany({
        where: { classeId: classeSel.id },
        orderBy: [{ date: "desc" }, { creeLe: "desc" }],
        take: 40,
        include: {
          discipline: { select: { nom: true, couleur: true } },
          saisiPar: { select: { id: true, prenoms: true, nom: true, email: true } },
        },
      });
      entrees = brutes.map((e) => ({
        id: e.id,
        date: e.date,
        contenu: e.contenu,
        travailAFaire: e.travailAFaire,
        disciplineNom: e.discipline.nom,
        disciplineCouleur: e.discipline.couleur,
        auteur: nomComplet(e.saisiPar),
        auteurId: e.saisiPar.id,
      }));
    } catch (e) {
      console.error("[cahier-texte] chargement :", e);
      erreur = true;
    }
  }

  // Regroupe le journal par date pour un affichage en chronologie.
  const groupes = new Map<number, typeof entrees>();
  for (const e of entrees) {
    const cle = e.date.getTime();
    if (!groupes.has(cle)) groupes.set(cle, []);
    groupes.get(cle)!.push(e);
  }

  function peutSupprimer(auteurId: string) {
    if (!canEdit) return false;
    if (u.roleReel === "admin" || u.roleReel === "chef_etablissement") return true;
    return u.roleReel === "enseignant" && auteurId === u.id;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        titre="Cahier de texte"
        description={
          canEdit
            ? "Consignez le contenu des séances et le travail à faire, classe par classe."
            : "Consultez le contenu des séances et le travail à faire."
        }
      />

      {u.roleReel === "admin" && etabId && (
        <SelecteurEtablissement basePath={BASE} etablissements={etablissements} etabId={etabId} />
      )}

      {erreur ? (
        <Card>
          <p className="text-sm text-ink-700/70">
            Impossible de charger les données. Vérifiez la connexion à la base de données.
          </p>
        </Card>
      ) : classes.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-700/70">
            {u.roleReel === "enseignant"
              ? "Vous n'êtes affecté à aucune classe pour le moment."
              : u.roleReel === "eleve"
                ? "Vous n'êtes inscrit dans aucune classe pour le moment."
                : u.roleReel === "parent"
                  ? "Aucune classe à afficher : vos enfants ne sont rattachés à aucune classe."
                  : "Aucune classe disponible. Créez des classes dans Système → Établissements."}
          </p>
        </Card>
      ) : (
        <>
          {/* Barre de filtre : choix de la classe (+ date pour les éditeurs). */}
          {(classes.length > 1 || canEdit) && (
            <Card>
              <form method="get" action={BASE} className="flex flex-wrap items-end gap-3">
                {etabId && <input type="hidden" name="etab" value={etabId} />}
                <div className="min-w-[12rem] flex-1">
                  <label className="mb-1.5 block text-sm font-medium text-forest-900">Classe</label>
                  <select
                    name="classe"
                    defaultValue={classeSel?.id ?? ""}
                    className="h-11 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
                {canEdit && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-forest-900">
                      Date de séance
                    </label>
                    <input
                      type="date"
                      name="date"
                      defaultValue={dateSel}
                      className="h-11 rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  className="h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-cream-50 hover:bg-forest-700"
                >
                  Charger
                </button>
              </form>
            </Card>
          )}

          {/* Formulaire de saisie (éditeurs). */}
          {canEdit && classeSel && (
            <Card>
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-forest-900">
                <NotebookPen size={18} /> Nouvelle séance — {classeSel.nom}
              </h2>
              <CahierForm
                classeId={classeSel.id}
                date={dateSel}
                disciplines={disciplinesForm}
                disciplineParDefaut={disciplineParDefaut}
              />
            </Card>
          )}

          {/* Journal des séances. */}
          {classeSel && (
            <Card>
              <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-forest-900">
                <BookText size={18} /> Journal — {classeSel.nom}
              </h2>
              {entrees.length === 0 ? (
                <p className="text-sm text-ink-700/65">
                  Aucune séance consignée pour cette classe.
                  {canEdit && " Utilisez le formulaire ci-dessus pour la première entrée."}
                </p>
              ) : (
                <div className="space-y-6">
                  {[...groupes.entries()].map(([cle, liste]) => (
                    <div key={cle}>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-700/50">
                        {dateFr(new Date(cle))}
                      </p>
                      <ul className="space-y-3">
                        {liste.map((e) => (
                          <li
                            key={e.id}
                            className="rounded-xl border border-cream-200 bg-cream-50/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-block h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: e.disciplineCouleur ?? "#999" }}
                                />
                                <span className="font-semibold text-forest-900">
                                  {e.disciplineNom}
                                </span>
                              </div>
                              {peutSupprimer(e.auteurId) && (
                                <SupprimerEntreeButton entreeId={e.id} />
                              )}
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-900">
                              {e.contenu}
                            </p>
                            {e.travailAFaire && (
                              <div className="mt-3 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2">
                                <p className="text-xs font-semibold text-gold-800">Travail à faire</p>
                                <p className="mt-0.5 whitespace-pre-wrap text-sm text-ink-900">
                                  {e.travailAFaire}
                                </p>
                              </div>
                            )}
                            <p className="mt-2 text-xs text-ink-700/50">
                              Consigné par {e.auteur}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {entrees.length >= 40 && (
                    <p className="pt-1 text-center text-xs text-ink-700/50">
                      Seules les 40 séances les plus récentes sont affichées.
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
