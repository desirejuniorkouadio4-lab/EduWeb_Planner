import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { CheckCircle2, AlertTriangle, MoveHorizontal, Cpu } from "lucide-react";

const contraintesDures = [
  "Unicité enseignant · classe · salle sur un même créneau",
  "Volume horaire hebdomadaire par matière et niveau",
  "Disponibilités déclarées des enseignants",
  "Capacité de salle ≥ effectif de la classe",
  "Compatibilité salle / matière (labo, salle informatique…)",
  "Double vacation : créneaux disjoints, pression sur les salles",
];

const etapes = [
  {
    icone: Cpu,
    titre: "Solveur à backtracking",
    texte:
      "Pas un algorithme glouton : le moteur revient en arrière sur ses choix et explore des alternatives, avec des heuristiques qui placent d'abord les créneaux les plus contraints.",
  },
  {
    icone: AlertTriangle,
    titre: "Aucun planning incomplet silencieux",
    texte:
      "En cas de sur-contrainte, le système n'invente rien : il identifie et affiche explicitement le point de blocage pour que vous sachiez quoi ajuster.",
  },
  {
    icone: MoveHorizontal,
    titre: "Ajustement par glisser-déposer",
    texte:
      "Après génération, chaque déplacement manuel re-vérifie les contraintes dures en temps réel — impossible de valider un conflit.",
  },
];

export function SolverSection() {
  return (
    <section id="solveur" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.24em] text-gold-600">
                Zoom sur un module
              </span>
            </Reveal>
            <Reveal delayIndex={1}>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance text-forest-900 sm:text-4xl">
                Des emplois du temps qui tiennent face au terrain réel
              </h2>
            </Reveal>
            <Reveal delayIndex={2}>
              <p className="mt-4 text-lg leading-relaxed text-ink-700/80">
                Effectifs élevés, pénurie de salles spécialisées, double vacation : les
                situations qui bloquent un algorithme naïf. EduWeb Planner les résout par un
                vrai solveur de contraintes.
              </p>
            </Reveal>

            <div className="mt-9 space-y-5">
              {etapes.map((e, i) => (
                <Reveal key={e.titre} delayIndex={i} as="div">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-800 text-gold-300">
                      <e.icone size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-forest-900">{e.titre}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-700/75">
                        {e.texte}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delayIndex={1}>
            <div className="rounded-3xl border border-cream-200 bg-cream-50 p-7 shadow-soft sm:p-9">
              <h3 className="font-display text-lg font-bold text-forest-900">
                Contraintes dures — jamais violées
              </h3>
              <ul className="mt-5 space-y-3">
                {contraintesDures.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-sm text-ink-800">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-forest-600" />
                    {c}
                  </li>
                ))}
              </ul>

              <div className="mt-7 rounded-2xl border border-gold-300/60 bg-gold-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-gold-800">
                  <AlertTriangle size={16} />
                  Exemple de blocage signalé
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gold-900/80">
                  « Impossible de satisfaire le volume horaire de SVT pour la 4ᵉ B : 1 seul
                  laboratoire disponible pour 6 classes sur le créneau commun. »
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
