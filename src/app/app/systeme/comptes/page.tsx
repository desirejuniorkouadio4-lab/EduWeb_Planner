import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/app/ui";

export const metadata: Metadata = { title: "Comptes utilisateurs" };
export const dynamic = "force-dynamic";

const libelleStatut: Record<string, string> = {
  en_attente_verification: "E-mail non confirmé",
  actif: "Actif",
  suspendu: "Suspendu",
};

async function chargerComptes(where: Prisma.UtilisateurWhereInput) {
  try {
    return await prisma.utilisateur.findMany({
      where,
      orderBy: { creeLe: "desc" },
      take: 100,
      include: {
        roleActif: true,
        demandes: { where: { statut: "en_attente" }, take: 1, include: { roleDemande: true } },
      },
    });
  } catch (e) {
    console.error("[comptes] DB indisponible :", e);
    return null;
  }
}

export default async function ComptesPage() {
  const u = await requireRole(["admin", "etablissements_admin", "cafop_admin", "apfc_admin"]);

  // Filtrage par périmètre de l'administrateur connecté.
  let where: Prisma.UtilisateurWhereInput = {};
  if (u.roleActif === "etablissements_admin") where = { etablissementId: u.portee.etablissementId };
  else if (u.roleActif === "cafop_admin") where = { cafopId: u.portee.cafopId };
  else if (u.roleActif === "apfc_admin") where = { apfcId: u.portee.apfcId };

  const comptes = await chargerComptes(where);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        titre="Comptes utilisateurs"
        description="Liste des comptes de votre périmètre. La création et la modification fine arriveront dans une prochaine itération."
      />

      {comptes === null ? (
        <Card>
          <p className="text-sm text-ink-700/70">
            Impossible de charger les comptes. Vérifiez la connexion à la base de données
            (DATABASE_URL).
          </p>
        </Card>
      ) : comptes.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-700/70">Aucun compte à afficher pour le moment.</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-cream-200 bg-cream-50 text-left">
                <th className="px-5 py-3 font-semibold text-ink-700/70">Utilisateur</th>
                <th className="px-5 py-3 font-semibold text-ink-700/70">Rôle actif</th>
                <th className="px-5 py-3 font-semibold text-ink-700/70">Statut compte</th>
                <th className="px-5 py-3 font-semibold text-ink-700/70">Demande</th>
              </tr>
            </thead>
            <tbody>
              {comptes.map((c) => (
                <tr key={c.id} className="border-b border-cream-100 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-forest-900">
                      {[c.prenoms, c.nom].filter(Boolean).join(" ") || "—"}
                    </p>
                    <p className="text-xs text-ink-700/55">{c.email}</p>
                  </td>
                  <td className="px-5 py-3 text-forest-800">{c.roleActif.libelle}</td>
                  <td className="px-5 py-3">
                    <Badge ton={c.statutCompte === "actif" ? "succes" : "attente"}>
                      {libelleStatut[c.statutCompte] ?? c.statutCompte}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {c.demandes[0] ? (
                      <Badge ton="attente">{c.demandes[0].roleDemande.libelle}</Badge>
                    ) : (
                      <span className="text-xs text-ink-700/40">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
