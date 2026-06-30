import type { Metadata } from "next";
import { BookOpen, ClipboardList, NotebookPen, MessageSquare, Megaphone, Stamp, GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatCard } from "@/components/app/ui";

export const metadata: Metadata = { title: "Rapports d'activité" };
export const dynamic = "force-dynamic";

const LIBELLE_ACTION: Record<string, string> = {
  "demande_role.approuvee": "Demande de rôle approuvée",
  "demande_role.refusee": "Demande de rôle refusée",
};

export default async function RapportsActivitePage() {
  const u = await requireRole(["admin", "drena", "inspecteur", "chef_etablissement", "cafop_admin", "apfc_admin"]);
  const estAdmin = u.roleReel === "admin";
  const depuis = new Date();
  depuis.setDate(depuis.getDate() - 30);

  const [notes, appels, cahiers, messages, sms, visites, inscriptions] = await Promise.all([
    prisma.note.count({ where: { creeLe: { gte: depuis } } }),
    prisma.appel.count({ where: { creeLe: { gte: depuis } } }),
    prisma.cahierTexte.count({ where: { creeLe: { gte: depuis } } }),
    prisma.message.count({ where: { creeLe: { gte: depuis } } }),
    prisma.alerteSMS.count({ where: { creeLe: { gte: depuis } } }),
    prisma.visite.count({ where: { creeLe: { gte: depuis } } }),
    prisma.inscription.count({ where: { creeLe: { gte: depuis } } }),
  ]);

  const journal = estAdmin
    ? await prisma.journalActivite.findMany({ orderBy: { creeLe: "desc" }, take: 15, select: { id: true, acteurEmail: true, action: true, creeLe: true } })
    : [];

  const cartes = [
    { libelle: "Notes saisies", valeur: notes, icone: <BookOpen size={22} /> },
    { libelle: "Appels", valeur: appels, icone: <ClipboardList size={22} /> },
    { libelle: "Cahier de texte", valeur: cahiers, icone: <NotebookPen size={22} /> },
    { libelle: "Messages", valeur: messages, icone: <MessageSquare size={22} /> },
    { libelle: "Alertes SMS", valeur: sms, icone: <Megaphone size={22} /> },
    { libelle: "Visites d'inspection", valeur: visites, icone: <Stamp size={22} /> },
    { libelle: "Inscriptions", valeur: inscriptions, icone: <GraduationCap size={22} /> },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader titre="Rapports d'activité" description="Volumétrie des actions sur les 30 derniers jours." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartes.map((c, i) => (
          <StatCard key={c.libelle} libelle={c.libelle} valeur={c.valeur} icone={c.icone} ton={i % 2 ? "gold" : "forest"} />
        ))}
      </div>

      {estAdmin && (
        <Card>
          <h2 className="mb-3 font-display text-base font-bold text-forest-900">Activité récente (audit)</h2>
          {journal.length === 0 ? (
            <p className="text-sm text-ink-700/60">Aucune action enregistrée.</p>
          ) : (
            <ul className="divide-y divide-cream-100">
              {journal.map((j) => (
                <li key={j.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="text-forest-900">{LIBELLE_ACTION[j.action] ?? j.action}</span>
                  <span className="text-xs text-ink-700/55">
                    {j.acteurEmail ?? "—"} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(j.creeLe)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
