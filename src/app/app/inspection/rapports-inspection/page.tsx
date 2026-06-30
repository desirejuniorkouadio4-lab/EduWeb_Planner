import type { Metadata } from "next";
import { Stamp, CheckCircle2, ListChecks } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatCard, Badge } from "@/components/app/ui";

export const metadata: Metadata = { title: "Rapports d'inspection" };
export const dynamic = "force-dynamic";

const STATUT: Record<string, { texte: string; ton: "succes" | "attente" | "refus" }> = {
  planifiee: { texte: "Planifiée", ton: "attente" },
  realisee: { texte: "Réalisée", ton: "succes" },
  annulee: { texte: "Annulée", ton: "refus" },
};

export default async function RapportsInspectionPage() {
  const u = await requireRole(["admin", "inspecteur", "drena"]);

  const where =
    u.roleReel === "inspecteur"
      ? { inspecteurId: u.id }
      : u.roleReel === "drena"
        ? { etablissement: { regionId: u.portee.regionId ?? "__aucune__" } }
        : {};

  const visites = await prisma.visite.findMany({
    where,
    orderBy: { date: "desc" },
    take: 30,
    include: { etablissement: { select: { nom: true } }, recommandations: { select: { statut: true } } },
  });

  const realisees = visites.filter((v) => v.statut === "realisee").length;
  const recosTotal = visites.reduce((s, v) => s + v.recommandations.length, 0);
  const recosOuvertes = visites.reduce((s, v) => s + v.recommandations.filter((r) => r.statut !== "traitee").length, 0);
  const notes = visites.filter((v) => v.noteGlobale != null).map((v) => v.noteGlobale as number);
  const moyenne = notes.length > 0 ? Math.round((notes.reduce((s, n) => s + n, 0) / notes.length) * 10) / 10 : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader titre="Rapports d'inspection" description="Synthèse des visites et de leurs recommandations." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard libelle="Visites" valeur={visites.length} icone={<Stamp size={22} />} />
        <StatCard libelle="Réalisées" valeur={realisees} icone={<CheckCircle2 size={22} />} ton="gold" />
        <StatCard libelle="Recommandations" valeur={recosTotal} icone={<ListChecks size={22} />} />
        <StatCard libelle="À suivre" valeur={recosOuvertes} icone={<ListChecks size={22} />} ton="gold" />
      </div>

      <Card>
        <h2 className="mb-3 font-display text-base font-bold text-forest-900">
          Visites récentes{moyenne != null && ` · appréciation moyenne ${moyenne}/20`}
        </h2>
        {visites.length === 0 ? (
          <p className="text-sm text-ink-700/60">Aucune visite enregistrée.</p>
        ) : (
          <ul className="divide-y divide-cream-100">
            {visites.map((v) => {
              const st = STATUT[v.statut] ?? STATUT.planifiee;
              return (
                <li key={v.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-forest-900">{v.etablissement.nom}</p>
                    <p className="text-xs text-ink-700/60">
                      {v.objet} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(v.date)} ·{" "}
                      {v.recommandations.length} recommandation(s)
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {v.noteGlobale != null && (
                      <span className="rounded-full bg-forest-800 px-2 py-0.5 text-xs font-semibold text-gold-300">{v.noteGlobale}/20</span>
                    )}
                    <Badge ton={st.ton}>{st.texte}</Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
