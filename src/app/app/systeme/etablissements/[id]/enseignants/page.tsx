import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserPlus, Upload, Download, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/app/ui";
import { AjoutEnseignantForm, ImportCSVForm } from "./forms";
import { enregistrerCompetences } from "./actions";

export const metadata: Metadata = { title: "Enseignants & compétences" };
export const dynamic = "force-dynamic";

function nomComplet(p: { prenoms: string | null; nom: string | null; email: string }) {
  return [p.prenoms, p.nom].filter(Boolean).join(" ") || p.email;
}

export default async function EnseignantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await requireRole(["admin", "etablissements_admin"]);
  if (u.roleReel === "etablissements_admin" && u.portee.etablissementId !== id) {
    redirect("/app/systeme/etablissements");
  }

  let etab: { nom: string } | null = null;
  let enseignants: {
    id: string;
    prenoms: string | null;
    nom: string | null;
    email: string;
    competences: { disciplineId: string }[];
  }[] = [];
  let disciplines: { id: string; nom: string }[] = [];
  let erreur = false;
  try {
    [etab, enseignants, disciplines] = await Promise.all([
      prisma.etablissement.findUnique({ where: { id }, select: { nom: true } }),
      prisma.utilisateur.findMany({
        where: { etablissementId: id, roleActif: { nomTechnique: "enseignant" } },
        orderBy: { nom: "asc" },
        select: {
          id: true,
          prenoms: true,
          nom: true,
          email: true,
          competences: { select: { disciplineId: true } },
        },
      }),
      prisma.discipline.findMany({ orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
    ]);
  } catch (e) {
    console.error("[enseignants] DB indisponible :", e);
    erreur = true;
  }
  if (!erreur && !etab) redirect("/app/systeme/etablissements");

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <Link
        href={`/app/systeme/etablissements/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900"
      >
        <ArrowLeft size={16} /> Configuration de l'établissement
      </Link>

      <PageHeader
        titre={`Enseignants — ${etab?.nom ?? ""}`}
        description="Ajoutez les enseignants (un par un ou par import CSV) et déclarez les disciplines que chacun est habilité à enseigner."
      />

      {erreur ? (
        <Card>
          <p className="text-sm text-ink-700/70">Impossible de charger les données.</p>
        </Card>
      ) : (
        <>
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-forest-900">
              <UserPlus size={18} /> Ajouter un enseignant
            </h2>
            <AjoutEnseignantForm etablissementId={id} />
          </Card>

          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-900">
                <Upload size={18} /> Importer une cohorte (CSV)
              </h2>
              <Link
                href={`/app/systeme/etablissements/${id}/enseignants/modele`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-700 hover:underline"
              >
                <Download size={15} /> Télécharger le modèle
              </Link>
            </div>
            <p className="mb-3 text-xs text-ink-700/60">Colonnes attendues : prénoms ; nom ; email.</p>
            <ImportCSVForm etablissementId={id} />
          </Card>

          <Card>
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-forest-900">
              <Users size={18} /> Synthèse des compétences ({enseignants.length})
            </h2>
            <p className="mb-4 text-sm text-ink-700/65">
              Cochez les disciplines de chaque enseignant — intrant clé du solveur d'emplois du temps.
            </p>
            {enseignants.length === 0 ? (
              <p className="text-sm text-ink-700/60">Aucun enseignant rattaché pour le moment.</p>
            ) : (
              <ul className="space-y-4">
                {enseignants.map((ens) => {
                  const acquis = new Set(ens.competences.map((c) => c.disciplineId));
                  return (
                    <li key={ens.id} className="rounded-2xl border border-cream-200 bg-cream-50 p-4">
                      <form action={enregistrerCompetences}>
                        <input type="hidden" name="etablissementId" value={id} />
                        <input type="hidden" name="enseignantId" value={ens.id} />
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-forest-900">{nomComplet(ens)}</p>
                            <p className="text-xs text-ink-700/55">{ens.email}</p>
                          </div>
                          <button
                            type="submit"
                            className="inline-flex h-9 items-center rounded-full bg-forest-700 px-4 text-xs font-semibold text-cream-50 hover:bg-forest-600"
                          >
                            Enregistrer
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {disciplines.map((d) => (
                            <label
                              key={d.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white px-2.5 py-1 text-xs text-forest-800"
                            >
                              <input
                                type="checkbox"
                                name={`disc_${d.id}`}
                                defaultChecked={acquis.has(d.id)}
                                className="h-3.5 w-3.5"
                              />
                              {d.nom}
                            </label>
                          ))}
                        </div>
                      </form>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
