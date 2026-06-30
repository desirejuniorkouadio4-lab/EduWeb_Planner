import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import {
  CalendarDays,
  GraduationCap,
  Stamp,
  BarChart3,
  Users,
  CreditCard,
  School,
  Bell,
} from "lucide-react";

const modules = [
  {
    icone: CalendarDays,
    titre: "Emplois du temps",
    texte:
      "Génération automatique par solveur de contraintes, ajustement par glisser-déposer, contrôle des conflits en temps réel.",
    phare: true,
  },
  {
    icone: School,
    titre: "Vie scolaire",
    texte:
      "Registre d'appel, cahier de texte, notes & bulletins, livret scolaire, rendez-vous et communication interne.",
  },
  {
    icone: Stamp,
    titre: "Inspection & supervision",
    texte:
      "Planification des visites, grilles d'évaluation, rapports d'inspection et suivi des recommandations.",
  },
  {
    icone: BarChart3,
    titre: "Statistiques & pilotage",
    texte:
      "Tableaux de bord par classe, établissement et région, indicateurs de performance et analytics visuels.",
  },
  {
    icone: GraduationCap,
    titre: "CAFOP & APFC",
    texte:
      "Gestion des structures de formation des maîtres et de formation continue, import de cohortes au format Moodle.",
  },
  {
    icone: Users,
    titre: "Comptes & habilitations",
    texte:
      "Inscription, confirmation par e-mail, demande de rôle approuvée par l'administration, gestion fine des périmètres.",
  },
  {
    icone: CreditCard,
    titre: "Facturation",
    texte:
      "Abonnements des établissements via Stripe, webhooks de synchronisation, gestion des échecs de paiement et reçus.",
  },
  {
    icone: Bell,
    titre: "Notifications & alertes",
    texte:
      "Centre de notifications unifié in-app, e-mails transactionnels et alertes SMS pour atteindre les familles.",
  },
];

export function ModulesSection() {
  return (
    <section id="modules" className="scroll-mt-24 bg-forest-950 py-24 text-cream-50 sm:py-32">
      <Container>
        <SectionHeading
          tone="light"
          eyebrow="Périmètre fonctionnel"
          title="Huit domaines, une plateforme cohérente"
          subtitle="Du pilotage national à la salle de classe, chaque module partage le même socle de sécurité, de données et d'expérience."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m, i) => (
            <Reveal key={m.titre} delayIndex={i % 4} as="article">
              <div
                className={`group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                  m.phare
                    ? "border-gold-400/40 bg-gradient-to-br from-forest-800 to-forest-900 shadow-[var(--shadow-gold)]"
                    : "border-cream-50/10 bg-forest-900/50 hover:border-gold-400/30"
                }`}
              >
                {m.phare && (
                  <span className="absolute right-4 top-4 rounded-full bg-gold-500/20 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-gold-200">
                    Innovation
                  </span>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/15 text-gold-300 transition-colors group-hover:bg-gold-500/25">
                  <m.icone size={22} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-cream-50">
                  {m.titre}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-cream-200/70">{m.texte}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
