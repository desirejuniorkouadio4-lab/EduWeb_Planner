import type { Metadata } from "next";
import { Inbox, Clock4 } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { RowActions } from "./row-actions";

export const metadata: Metadata = { title: "Approbations" };
export const dynamic = "force-dynamic";

async function chargerDemandes() {
  try {
    return await prisma.demandeRole.findMany({
      where: { statut: "en_attente" },
      orderBy: { creeLe: "asc" },
      include: { roleDemande: true, utilisateur: true },
    });
  } catch (e) {
    console.error("[approbations] DB indisponible :", e);
    return null;
  }
}

function dateFr(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
}

export default async function ApprobationsPage() {
  await requireRole(["admin"]);
  const demandes = await chargerDemandes();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        titre="Approbations des demandes de rôle"
        description="Validez ou refusez les demandes de rôle (inscriptions et changements). En version 1, ces décisions relèvent de l'administrateur système."
      />

      {demandes === null ? (
        <Card>
          <p className="text-sm text-ink-700/70">
            Impossible de charger les demandes. Vérifiez la connexion à la base de données
            (DATABASE_URL).
          </p>
        </Card>
      ) : demandes.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-500">
            <Inbox size={26} />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-forest-900">
            Aucune demande en attente
          </h2>
          <p className="mt-1 text-sm text-ink-700/65">
            Les nouvelles demandes de rôle apparaîtront ici.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {demandes.map((d) => (
            <Card key={d.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-forest-900">
                    {[d.utilisateur.prenoms, d.utilisateur.nom].filter(Boolean).join(" ") ||
                      d.utilisateur.email}
                  </p>
                  <Badge ton="attente">{d.roleDemande.libelle}</Badge>
                </div>
                <p className="mt-1 truncate text-sm text-ink-700/65">{d.utilisateur.email}</p>
                {d.structureDeclaree && (
                  <p className="mt-1 text-sm text-ink-700/65">
                    Structure déclarée : <span className="font-medium">{d.structureDeclaree}</span>
                  </p>
                )}
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-700/50">
                  <Clock4 size={13} /> Demande du {dateFr(d.creeLe)}
                </p>
              </div>
              <RowActions demandeId={d.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
