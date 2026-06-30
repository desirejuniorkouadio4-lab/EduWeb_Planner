import type { Metadata } from "next";
import Link from "next/link";
import { School, ArrowUpRight, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { filtreEtablissements } from "@/lib/rbac";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { EtablissementForm } from "./etablissement-form";

export const metadata: Metadata = { title: "Établissements" };
export const dynamic = "force-dynamic";

const libelleType: Record<string, string> = {
  prescolaire: "Préscolaire",
  primaire: "Primaire",
  college: "Collège",
  lycee: "Lycée",
  groupe_scolaire: "Groupe scolaire",
  autre: "Autre",
};

async function charger(u: Awaited<ReturnType<typeof requireRole>>) {
  try {
    const [etablissements, regions] = await Promise.all([
      prisma.etablissement.findMany({
        where: filtreEtablissements(u.portee),
        orderBy: { creeLe: "desc" },
        include: { region: true, _count: { select: { classes: true, salles: true } } },
        take: 100,
      }),
      prisma.region.findMany({ orderBy: { nom: "asc" } }),
    ]);
    return { etablissements, regions, ok: true as const };
  } catch (e) {
    console.error("[etablissements] DB indisponible :", e);
    return { ok: false as const };
  }
}

export default async function EtablissementsPage() {
  const u = await requireRole(["admin", "etablissements_admin"]);
  const data = await charger(u);
  const estAdmin = u.roleReel === "admin";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        titre="Établissements"
        description="Création, rattachement régional et configuration des établissements scolaires."
      />

      {!data.ok ? (
        <Card>
          <p className="text-sm text-ink-700/70">
            Impossible de charger les établissements. Vérifiez la connexion à la base de données.
          </p>
        </Card>
      ) : (
        <>
          {estAdmin && (
            <Card>
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-forest-900">
                <Plus size={18} /> Nouvel établissement
              </h2>
              <EtablissementForm regions={data.regions} />
            </Card>
          )}

          {data.etablissements.length === 0 ? (
            <Card className="flex flex-col items-center py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-500">
                <School size={26} />
              </span>
              <p className="mt-4 text-sm text-ink-700/65">
                Aucun établissement pour le moment.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.etablissements.map((e) => (
                <Link
                  key={e.id}
                  href={`/app/systeme/etablissements/${e.id}`}
                  className="group rounded-2xl border border-cream-200 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-[var(--shadow-gold)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-gold-300">
                      <School size={20} />
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-ink-700/30 transition-colors group-hover:text-gold-600"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-forest-900">{e.nom}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge>{libelleType[e.type] ?? e.type}</Badge>
                    {e.region && <Badge ton="neutre">{e.region.nom}</Badge>}
                  </div>
                  <p className="mt-3 text-xs text-ink-700/60">
                    {e._count.classes} classe(s) · {e._count.salles} salle(s)
                    {e.ville ? ` · ${e.ville}` : ""}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
