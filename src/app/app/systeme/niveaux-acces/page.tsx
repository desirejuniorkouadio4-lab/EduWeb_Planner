import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { PageHeader, Card } from "@/components/app/ui";
import { ROLES_ORDONNES, MATRICE_SECTIONS, type NiveauAcces, type RoleId } from "@/lib/rbac";

export const metadata: Metadata = { title: "Niveaux d'accès" };
export const dynamic = "force-dynamic";

const libellePortee: Record<string, string> = {
  global: "National (global)",
  etablissement: "Établissement",
  cafop: "CAFOP",
  apfc: "APFC",
  antenne: "Antenne",
  region: "Région / zone",
  personnel: "Personnel",
};

// Colonnes condensées de la matrice (cahier §4.4).
const colonnes: { libelle: string; role: RoleId }[] = [
  { libelle: "Admin", role: "admin" },
  { libelle: "DRENA / Insp.", role: "drena" },
  { libelle: "Chef étab.", role: "chef_etablissement" },
  { libelle: "Enseignant", role: "enseignant" },
  { libelle: "Parent / Élève", role: "eleve" },
];

function symbole(n: NiveauAcces | undefined) {
  if (n === "complet") return <span className="text-forest-600">●</span>;
  if (n === "partiel") return <span className="text-gold-600">◐</span>;
  return <span className="text-ink-700/25">—</span>;
}

export default async function NiveauxAccesPage() {
  await requireRole(["admin", "etablissements_admin", "cafop_admin", "apfc_admin"]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        titre="Niveaux d'accès"
        description="Définition statique des 13 rôles de la plateforme et de leur périmètre, ainsi que la matrice d'accès aux grandes sections."
      />

      <Card className="mb-8 overflow-x-auto">
        <h2 className="mb-4 font-display text-lg font-bold text-forest-900">
          Matrice d'accès aux sections
        </h2>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-left">
              <th className="py-2.5 pr-4 font-semibold text-ink-700/70">Section</th>
              {colonnes.map((c) => (
                <th key={c.role} className="px-3 py-2.5 text-center font-semibold text-ink-700/70">
                  {c.libelle}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRICE_SECTIONS.map((ligne) => (
              <tr key={ligne.section} className="border-b border-cream-100 last:border-0">
                <td className="py-2.5 pr-4 font-medium text-forest-900">{ligne.section}</td>
                {colonnes.map((c) => (
                  <td key={c.role} className="px-3 py-2.5 text-center text-base">
                    {symbole(ligne.niveaux[c.role])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-ink-700/55">
          Légende : <span className="text-forest-600">●</span> accès complet ·{" "}
          <span className="text-gold-600">◐</span> accès partiel ou limité au périmètre ·{" "}
          <span className="text-ink-700/40">—</span> pas d'accès. La granularité fine (créer,
          modifier, supprimer, consulter) est définie module par module.
        </p>
      </Card>

      <h2 className="mb-4 font-display text-lg font-bold text-forest-900">Les 13 rôles</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {ROLES_ORDONNES.map((role) => (
          <Card key={role.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-forest-900">{role.libelle}</h3>
              <code className="rounded bg-cream-100 px-2 py-0.5 text-xs text-forest-700">
                {role.id}
              </code>
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-gold-700">
              {libellePortee[role.portee]}
            </p>
            <p className="text-sm leading-relaxed text-ink-700/75">{role.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
