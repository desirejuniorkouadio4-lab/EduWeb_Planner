import type { Metadata } from "next";
import { Network, Users, BookMarked } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatCard } from "@/components/app/ui";

export const metadata: Metadata = { title: "Rapports d'antennes pédagogiques" };
export const dynamic = "force-dynamic";

export default async function RapportsAntennesPage() {
  const u = await requireRole(["admin", "drena", "chef_antenne", "apfc_admin"]);

  const where = u.roleReel === "apfc_admin" ? { id: u.portee.apfcId ?? "__aucune__" } : {};
  const apfcs = await prisma.apfc.findMany({
    where,
    orderBy: { nom: "asc" },
    select: {
      nom: true,
      region: { select: { nom: true } },
      cohortes: { select: { _count: { select: { apprenants: true } } } },
    },
  });

  const lignes = apfcs.map((a) => ({
    nom: a.nom,
    region: a.region?.nom ?? "—",
    sessions: a.cohortes.length,
    participants: a.cohortes.reduce((s, c) => s + c._count.apprenants, 0),
  }));
  const kpis = {
    antennes: lignes.length,
    sessions: lignes.reduce((s, l) => s + l.sessions, 0),
    participants: lignes.reduce((s, l) => s + l.participants, 0),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader titre="Rapports d'antennes pédagogiques" description="Activité de formation continue (APFC)." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard libelle="Antennes (APFC)" valeur={kpis.antennes} icone={<Network size={22} />} />
        <StatCard libelle="Sessions" valeur={kpis.sessions} icone={<BookMarked size={22} />} ton="gold" />
        <StatCard libelle="Participants" valeur={kpis.participants} icone={<Users size={22} />} />
      </div>

      <Card>
        <h2 className="mb-3 font-display text-base font-bold text-forest-900">Détail par antenne</h2>
        {lignes.length === 0 ? (
          <p className="text-sm text-ink-700/60">Aucune APFC enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-cream-200 text-left text-xs text-ink-700/65">
                  <th className="py-2.5 pr-3 font-semibold">Antenne</th>
                  <th className="px-2 py-2.5 font-semibold">Région</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Sessions</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Participants</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={l.nom} className="border-b border-cream-100 last:border-0">
                    <td className="py-2.5 pr-3 font-medium text-forest-900">{l.nom}</td>
                    <td className="px-2 py-2.5 text-ink-700/70">{l.region}</td>
                    <td className="px-2 py-2.5 text-right text-ink-700/80">{l.sessions}</td>
                    <td className="px-2 py-2.5 text-right font-semibold text-forest-800">{l.participants}</td>
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
