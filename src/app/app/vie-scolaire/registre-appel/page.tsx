import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { resoudreEtablissement } from "@/lib/vie-scolaire/contexte";
import { PageHeader, Card, Badge } from "@/components/app/ui";
import { SelecteurEtablissement } from "@/components/app/selecteur-etablissement";
import { AppelForm } from "./form";

export const metadata: Metadata = { title: "Registre d'appel" };
export const dynamic = "force-dynamic";

const BASE = "/app/vie-scolaire/registre-appel";

function nomComplet(p: { prenoms: string | null; nom: string | null; email: string }) {
  return [p.prenoms, p.nom].filter(Boolean).join(" ") || p.email;
}
function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}
function dateFr(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(d);
}

export default async function RegistreAppelPage({
  searchParams,
}: {
  searchParams: Promise<{ etab?: string; classe?: string; date?: string; discipline?: string }>;
}) {
  const u = await requireRole(["admin", "chef_etablissement", "educateur", "enseignant"]);
  const sp = await searchParams;

  // Résolution des classes accessibles selon le rôle.
  let classes: { id: string; nom: string }[] = [];
  let etablissements: { id: string; nom: string }[] = [];
  let etabId: string | null = null;
  let adminSansEtab = false;
  let erreur = false;

  try {
    if (u.roleReel === "enseignant") {
      classes = await prisma.classe.findMany({
        where: { affectations: { some: { enseignantId: u.id } } },
        orderBy: { nom: "asc" },
        select: { id: true, nom: true },
      });
    } else if (u.roleReel === "chef_etablissement" || u.roleReel === "educateur") {
      etabId = u.portee.etablissementId;
      if (etabId) {
        classes = await prisma.classe.findMany({
          where: { etablissementId: etabId },
          orderBy: { nom: "asc" },
          select: { id: true, nom: true },
        });
      }
    } else {
      const ctx = await resoudreEtablissement(u, sp.etab);
      etablissements = ctx.etablissements;
      etabId = ctx.etabId;
      if (!etabId) adminSansEtab = true;
      else {
        classes = await prisma.classe.findMany({
          where: { etablissementId: etabId },
          orderBy: { nom: "asc" },
          select: { id: true, nom: true },
        });
      }
    }
  } catch (e) {
    console.error("[registre] DB indisponible :", e);
    erreur = true;
  }

  if (adminSansEtab) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          titre="Registre d'appel"
          description="Choisissez un établissement pour saisir les présences."
        />
        <SelecteurEtablissement basePath={BASE} etablissements={etablissements} etabId={null} />
      </div>
    );
  }

  const classeSel = classes.find((c) => c.id === sp.classe) ?? null;
  const dateSel = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : aujourdhui();
  const disciplineSel = sp.discipline?.trim() || null;

  // Données de saisie + historique pour la classe sélectionnée.
  let eleves: { eleveId: string; nom: string; statut: "present" | "absent" | "retard" | "excuse" }[] = [];
  let disciplines: { id: string; nom: string }[] = [];
  let historique: { id: string; date: Date; total: number; absents: number }[] = [];

  if (!erreur) {
    try {
      disciplines = await prisma.discipline.findMany({
        orderBy: { nom: "asc" },
        select: { id: true, nom: true },
      });

      if (classeSel) {
        const dateObj = new Date(`${dateSel}T00:00:00.000Z`);
        const [inscriptions, appel, appelsRecents] = await Promise.all([
          prisma.inscription.findMany({
            where: { classeId: classeSel.id },
            include: { eleve: { select: { id: true, prenoms: true, nom: true, email: true } } },
          }),
          prisma.appel.findFirst({
            where: { classeId: classeSel.id, date: dateObj, disciplineId: disciplineSel },
            include: { presences: true },
          }),
          prisma.appel.findMany({
            where: { classeId: classeSel.id },
            orderBy: { date: "desc" },
            take: 8,
            include: { presences: { select: { statut: true } } },
          }),
        ]);

        const statutParEleve = new Map(appel?.presences.map((p) => [p.eleveId, p.statut]) ?? []);
        eleves = inscriptions
          .map((i) => ({
            eleveId: i.eleve.id,
            nom: nomComplet(i.eleve),
            statut: (statutParEleve.get(i.eleve.id) ?? "present") as
              | "present"
              | "absent"
              | "retard"
              | "excuse",
          }))
          .sort((a, b) => a.nom.localeCompare(b.nom));

        historique = appelsRecents.map((a) => ({
          id: a.id,
          date: a.date,
          total: a.presences.length,
          absents: a.presences.filter((p) => p.statut === "absent").length,
        }));
      }
    } catch (e) {
      console.error("[registre] chargement saisie :", e);
      erreur = true;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        titre="Registre d'appel"
        description="Saisissez les présences, absences et retards, classe par classe."
      />

      {u.roleReel === "admin" && etabId && (
        <SelecteurEtablissement basePath={BASE} etablissements={etablissements} etabId={etabId} />
      )}

      {erreur ? (
        <Card>
          <p className="text-sm text-ink-700/70">
            Impossible de charger les données. Vérifiez la connexion à la base de données.
          </p>
        </Card>
      ) : classes.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-700/70">
            {u.roleReel === "enseignant"
              ? "Vous n'êtes affecté à aucune classe pour le moment."
              : "Aucune classe disponible. Créez des classes dans Système → Établissements."}
          </p>
        </Card>
      ) : (
        <>
          <Card>
            <form method="get" action={BASE} className="flex flex-wrap items-end gap-3">
              {etabId && <input type="hidden" name="etab" value={etabId} />}
              <div className="min-w-[10rem] flex-1">
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Classe</label>
                <select
                  name="classe"
                  defaultValue={classeSel?.id ?? ""}
                  className="h-11 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
                >
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-forest-900">Date</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={dateSel}
                  className="h-11 rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
                />
              </div>
              <div className="min-w-[9rem]">
                <label className="mb-1.5 block text-sm font-medium text-forest-900">
                  Discipline (option.)
                </label>
                <select
                  name="discipline"
                  defaultValue={disciplineSel ?? ""}
                  className="h-11 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
                >
                  <option value="">—</option>
                  {disciplines.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.nom}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="h-11 rounded-full bg-forest-800 px-6 text-sm font-semibold text-cream-50 hover:bg-forest-700"
              >
                Charger
              </button>
            </form>
          </Card>

          {classeSel && (
            <Card>
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-forest-900">
                <ClipboardList size={18} /> {classeSel.nom} — {dateFr(new Date(`${dateSel}T00:00:00.000Z`))}
              </h2>
              <AppelForm
                classeId={classeSel.id}
                date={dateSel}
                disciplineId={disciplineSel}
                eleves={eleves}
              />
            </Card>
          )}

          {classeSel && historique.length > 0 && (
            <Card>
              <h2 className="mb-4 font-display text-base font-bold text-forest-900">
                Derniers appels — {classeSel.nom}
              </h2>
              <ul className="divide-y divide-cream-100">
                {historique.map((h) => (
                  <li key={h.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-forest-900">{dateFr(h.date)}</span>
                    <span className="flex items-center gap-2 text-ink-700/70">
                      {h.total} élève(s)
                      <Badge ton={h.absents > 0 ? "refus" : "succes"}>
                        {h.absents} absent(s)
                      </Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
