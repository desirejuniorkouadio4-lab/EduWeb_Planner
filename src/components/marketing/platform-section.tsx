import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ROLES_ORDONNES } from "@/lib/rbac";
import { Layers, Lock, UserCog } from "lucide-react";

const piliers = [
  {
    icone: Layers,
    titre: "Une interface unique",
    texte:
      "Pas une application par profil, mais une seule plateforme dont chaque page, menu et donnée s'adapte au rôle connecté.",
  },
  {
    icone: Lock,
    titre: "Sécurité par périmètre",
    texte:
      "Chaque rôle a un périmètre (établissement, région, structure…). Deux utilisateurs du même rôle ne voient jamais les mêmes données.",
  },
  {
    icone: UserCog,
    titre: "Mode Aperçu de rôle",
    texte:
      "Les administrateurs visualisent l'interface telle qu'elle apparaît pour un autre rôle, en lecture seule, pour tester et diagnostiquer.",
  },
];

const groupes: Record<string, string> = {
  pilotage: "Pilotage",
  formation: "Formation",
  etablissement: "Établissement",
  famille: "Famille",
};

const couleurGroupe: Record<string, string> = {
  pilotage: "border-forest-200 bg-forest-50 text-forest-800",
  formation: "border-gold-200 bg-gold-50 text-gold-800",
  etablissement: "border-forest-200 bg-cream-100 text-forest-800",
  famille: "border-cream-300 bg-cream-50 text-ink-700",
};

export function PlatformSection() {
  return (
    <section id="plateforme" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Le principe directeur"
          title="Une seule interface, pilotée par le rôle"
          subtitle="EduWeb Planner repose sur un contrôle d'accès basé sur les rôles (RBAC) à périmètre. C'est le cœur du système : tout module s'appuie sur cette couche unique et centralisée."
        />

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {piliers.map((p, i) => (
            <Reveal key={p.titre} delayIndex={i} as="article">
              <div className="h-full rounded-2xl border border-cream-200 bg-white/70 p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-[var(--shadow-gold)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-800 text-gold-300">
                  <p.icone size={22} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-forest-900">
                  {p.titre}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-700/80">{p.texte}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delayIndex={1}>
          <div className="mt-16 rounded-3xl border border-cream-200 bg-cream-50 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600">
              Les 13 rôles de la plateforme
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {ROLES_ORDONNES.map((role) => (
                <span
                  key={role.id}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium ${couleurGroupe[role.groupe]}`}
                  title={role.description}
                >
                  {role.libelle}
                  <span className="text-[0.65rem] uppercase tracking-wider opacity-60">
                    {groupes[role.groupe]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
