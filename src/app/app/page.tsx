import Link from "next/link";
import * as Icons from "lucide-react";
import { requireAccesComplet } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatCard } from "@/components/app/ui";
import { navigationPourRole, ROLES } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const libellePortee: Record<string, string> = {
  global: "Périmètre national (global)",
  etablissement: "Périmètre établissement",
  cafop: "Périmètre CAFOP",
  apfc: "Périmètre APFC",
  antenne: "Périmètre antenne pédagogique",
  region: "Périmètre régional",
  personnel: "Périmètre personnel",
};

async function statsAdmin() {
  try {
    const [utilisateurs, demandesEnAttente, etablissements] = await Promise.all([
      prisma.utilisateur.count(),
      prisma.demandeRole.count({ where: { statut: "en_attente" } }),
      prisma.etablissement.count(),
    ]);
    return { utilisateurs, demandesEnAttente, etablissements };
  } catch {
    return null;
  }
}

export default async function TableauDeBordPage() {
  const u = await requireAccesComplet();
  const def = ROLES[u.roleActif];

  const raccourcis = navigationPourRole(u.roleActif)
    .flatMap((s) => s.items)
    .filter((i) => i.statut === "disponible" && i.segment !== "")
    .slice(0, 6);

  const stats = u.roleActif === "admin" ? await statsAdmin() : null;

  return (
    <div>
      <PageHeader
        titre={`Bonjour, ${u.prenoms ?? u.nomComplet}`}
        description={`${u.libelleRoleActif} · ${libellePortee[def.portee]}`}
      />

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            libelle="Comptes utilisateurs"
            valeur={stats.utilisateurs}
            icone={<Icons.Users size={22} />}
          />
          <StatCard
            libelle="Demandes de rôle en attente"
            valeur={stats.demandesEnAttente}
            ton="gold"
            icone={<Icons.ClipboardCheck size={22} />}
          />
          <StatCard
            libelle="Établissements"
            valeur={stats.etablissements}
            icone={<Icons.School size={22} />}
          />
        </div>
      )}

      <Card className="mb-8 border-forest-200 bg-gradient-to-br from-forest-800 to-forest-950 text-cream-50">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-300">
            <Icons.Sparkles size={22} />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold">Bienvenue sur EduWeb Planner</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-cream-200/80">
              Votre interface s'adapte à votre rôle. Les modules ci-dessous sont accessibles
              dès aujourd'hui ; les autres apparaîtront au fil des phases de développement.
            </p>
          </div>
        </div>
      </Card>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-ink-700/60">
        Accès rapides
      </h2>
      {raccourcis.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {raccourcis.map((item) => {
            const Icone =
              (Icons as unknown as Record<string, Icons.LucideIcon>)[item.icone] ??
              Icons.Circle;
            return (
              <Link
                key={item.id}
                href={item.segment ? `/app/${item.segment}` : "/app"}
                className="group flex items-start gap-4 rounded-2xl border border-cream-200 bg-white p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-[var(--shadow-gold)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-800 text-gold-300">
                  <Icone size={20} />
                </span>
                <div>
                  <p className="font-semibold text-forest-900">{item.libelle}</p>
                  {item.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-700/65">
                      {item.description}
                    </p>
                  )}
                </div>
                <Icons.ArrowUpRight
                  size={16}
                  className="ml-auto text-ink-700/30 transition-colors group-hover:text-gold-600"
                />
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-ink-700/70">
            Aucun module n'est encore disponible pour votre rôle. Revenez bientôt.
          </p>
        </Card>
      )}
    </div>
  );
}
