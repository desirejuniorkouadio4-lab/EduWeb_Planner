import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Landmark, GraduationCap, School, Home } from "lucide-react";

const publics = [
  {
    icone: Landmark,
    titre: "Pilotage national & régional",
    acteurs: "Administrateur Système · DRENA / DRENAET · Inspecteurs",
  },
  {
    icone: GraduationCap,
    titre: "Structures de formation",
    acteurs: "Admin CAFOP · Admin APFC · Chefs d'antenne · Conseillers pédagogiques",
  },
  {
    icone: School,
    titre: "Établissement",
    acteurs: "Chef d'établissement · Enseignants · Éducateurs",
  },
  {
    icone: Home,
    titre: "Famille",
    acteurs: "Parents d'élèves · Élèves",
  },
];

export function AudienceSection() {
  return (
    <section id="public" className="scroll-mt-24 bg-cream-100 py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Public cible"
          title="Tout l'écosystème éducatif, au même endroit"
          subtitle="De la famille à l'administration nationale, chaque acteur dispose exactement des outils et des données qui le concernent."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {publics.map((p, i) => (
            <Reveal key={p.titre} delayIndex={i} as="article">
              <div className="h-full rounded-2xl border border-cream-300 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-forest-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-forest-700 to-forest-900 text-gold-300">
                  <p.icone size={22} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-forest-900">
                  {p.titre}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700/75">{p.acteurs}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
