import type { Metadata } from "next";
import { Network, Stamp, ListChecks } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatCard } from "@/components/app/ui";

export const metadata: Metadata = { title: "Rapports d'antennes" };
export const dynamic = "force-dynamic";

export default async function RapportsAntennesInspectionPage() {
  const u = await requireRole(["admin", "drena", "chef_antenne", "conseiller_pedagogique", "apfc_admin"]);

  const where = u.roleReel === "drena" ? { etablissement: { regionId: u.portee.regionId ?? "__aucune__" } } : {};
  const visites = await prisma.visite.findMany({
    where,
    select: {
      statut: true,
      noteGlobale: true,
      etablissement: { select: { nom: true } },
      recommandations: { select: { statut: true } },
    },
  });

  const parEtab = new Map<string, { visites: number; realisees: number; recos: number; recosOuvertes: number; sommeNote: number; nNote: number }>();
  for (const v of visites) {
    const nom = v.etablissement.nom;
    const o = parEtab.get(nom) ?? { visites: 0, realisees: 0, recos: 0, recosOuvertes: 0, sommeNote: 0, nNote: 0 };
    o.visites += 1;
    if (v.statut === "realisee") o.realisees += 1;
    o.recos += v.recommandations.length;
    o.recosOuvertes += v.recommandations.filter((r) => r.statut !== "traitee").length;
    if (v.noteGlobale != null) {
      o.sommeNote += v.noteGlobale;
      o.nNote += 1;
    }
    parEtab.set(nom, o);
  }
  const lignes = [...parEtab.entries()]
    .map(([nom, o]) => ({ nom, ...o, moyenne: o.nNote > 0 ? Math.round((o.sommeNote / o.nNote) * 10) / 10 : null }))
    .sort((a, b) => b.visites - a.visites);

  const kpis = {
    etablissements: lignes.length,
    visites: visites.length,
    recosOuvertes: lignes.reduce((s, l) => s + l.recosOuvertes, 0),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader titre="Rapports d'antennes" description="Suivi de l'inspection par établissement." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard libelle="Établissements visités" valeur={kpis.etablissements} icone={<Network size={22} />} />
        <StatCard libelle="Visites" valeur={kpis.visites} icone={<Stamp size={22} />} ton="gold" />
        <StatCard libelle="Recommandations à suivre" valeur={kpis.recosOuvertes} icone={<ListChecks size={22} />} />
      </div>

      <Card>
        <h2 className="mb-3 font-display text-base font-bold text-forest-900">Par établissement</h2>
        {lignes.length === 0 ? (
          <p className="text-sm text-ink-700/60">Aucune visite enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-left text-xs text-ink-700/65">
                  <th className="py-2.5 pr-3 font-semibold">Établissement</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Visites</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Réalisées</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Reco. à suivre</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Moy. /20</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.nom} className="border-b border-cream-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-forest-900">{l.nom}</td>
                    <td className="px-2 py-2.5 text-right text-ink-700/80">{l.visites}</td>
                    <td className="px-2 py-2.5 text-right text-ink-700/70">{l.realisees}</td>
                    <td className="px-2 py-2.5 text-right text-gold-700">{l.recosOuvertes}</td>
                    <td className="px-2 py-2.5 text-right font-semibold text-forest-800">{l.moyenne ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
