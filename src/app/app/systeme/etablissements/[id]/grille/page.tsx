import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Table2 } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/app/ui";
import { GrilleNiveauEditor, type DisciplineLigne } from "./grille-editor";

export const metadata: Metadata = { title: "Grille horaire" };
export const dynamic = "force-dynamic";

export default async function GrillePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ niveau?: string }>;
}) {
  const { id } = await params;
  const { niveau: niveauParam } = await searchParams;
  const u = await requireRole(["admin", "etablissements_admin"]);
  if (u.roleReel === "etablissements_admin" && u.portee.etablissementId !== id) {
    redirect("/app/systeme/etablissements");
  }

  let etab: { nom: string } | null = null;
  let niveaux: { id: string; nom: string }[] = [];
  let disciplines: { id: string; nom: string; couleur: string | null }[] = [];
  let erreur = false;
  try {
    [etab, niveaux, disciplines] = await Promise.all([
      prisma.etablissement.findUnique({ where: { id }, select: { nom: true } }),
      prisma.niveau.findMany({ orderBy: { ordre: "asc" }, select: { id: true, nom: true } }),
      prisma.discipline.findMany({ orderBy: { nom: "asc" }, select: { id: true, nom: true, couleur: true } }),
    ]);
  } catch (e) {
    console.error("[grille] DB indisponible :", e);
    erreur = true;
  }
  if (!erreur && !etab) redirect("/app/systeme/etablissements");

  const niveauSel = niveaux.find((n) => n.id === niveauParam) ?? niveaux[0] ?? null;

  // Lignes pré-remplies pour le niveau sélectionné.
  let lignes: DisciplineLigne[] = [];
  if (!erreur && niveauSel) {
    try {
      const grilles = await prisma.grilleHoraire.findMany({
        where: {
          niveauId: niveauSel.id,
          OR: [{ etablissementId: id }, { etablissementId: null }],
        },
      });
      const etabMap = new Map<string, { seances: number[]; coef: number }>();
      const natMap = new Map<string, { heures: number; coef: number }>();
      for (const g of grilles) {
        if (g.etablissementId === id) etabMap.set(g.disciplineId, { seances: g.seancesMinutes, coef: g.coefficient });
        else natMap.set(g.disciplineId, { heures: g.heuresHebdo, coef: g.coefficient });
      }
      lignes = disciplines.map((d) => {
        const o = etabMap.get(d.id);
        const nat = natMap.get(d.id);
        let seances: number[];
        let coef: number;
        if (o && o.seances.length > 0) {
          seances = o.seances;
          coef = o.coef;
        } else if (nat && nat.heures > 0) {
          const nb = Math.max(1, Math.round(nat.heures));
          seances = Array.from({ length: nb }, () => 60);
          coef = nat.coef;
        } else {
          seances = [];
          coef = o?.coef ?? nat?.coef ?? 1;
        }
        return { disciplineId: d.id, nom: d.nom, couleur: d.couleur, coef, seances };
      });
    } catch (e) {
      console.error("[grille] chargement :", e);
      erreur = true;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href={`/app/systeme/etablissements/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900"
      >
        <ArrowLeft size={16} /> Configuration de l'établissement
      </Link>

      <PageHeader
        titre={`Grille horaire — ${etab?.nom ?? ""}`}
        description="Définissez, pour chaque niveau et discipline, le coefficient et les séances (durée × nombre/semaine). Le volume hebdomadaire est calculé automatiquement."
      />

      {u.apercuActif && (
        <Card className="border-gold-300/70 bg-gold-50">
          <p className="text-sm text-gold-900">Mode aperçu : édition désactivée (lecture seule).</p>
        </Card>
      )}

      {erreur ? (
        <Card>
          <p className="text-sm text-ink-700/70">Impossible de charger la grille.</p>
        </Card>
      ) : niveaux.length === 0 || disciplines.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-700/60">Référentiels non initialisés (npm run db:seed).</p>
        </Card>
      ) : (
        <>
          {/* Onglets niveaux */}
          <div className="flex flex-wrap gap-1.5">
            {niveaux.map((n) => {
              const actif = n.id === niveauSel?.id;
              return (
                <Link
                  key={n.id}
                  href={`/app/systeme/etablissements/${id}/grille?niveau=${n.id}`}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    actif ? "bg-forest-800 text-cream-50" : "border border-cream-300 bg-white text-forest-800 hover:bg-forest-50"
                  }`}
                >
                  {n.nom}
                </Link>
              );
            })}
          </div>

          {niveauSel && (
            <Card className="overflow-x-auto">
              <div className="mb-2 flex items-center gap-2">
                <Table2 size={18} className="text-forest-700" />
                <h2 className="font-display text-lg font-bold text-forest-900">{niveauSel.nom}</h2>
              </div>
              <p className="mb-4 text-xs text-ink-700/55">
                Valeurs pré-remplies depuis le modèle national. Toute modification crée une surcharge
                propre à l'établissement.
              </p>
              <GrilleNiveauEditor
                etablissementId={id}
                niveauId={niveauSel.id}
                niveauNom={niveauSel.nom}
                disciplines={lignes}
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
