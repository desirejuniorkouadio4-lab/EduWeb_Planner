import Link from "next/link";
import { ArrowLeft, CalendarCheck, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const atouts = [
  { icone: CalendarCheck, texte: "Emplois du temps générés automatiquement" },
  { icone: ShieldCheck, texte: "Accès sécurisé, filtré par rôle et périmètre" },
  { icone: Users, texte: "Une interface unique pour 13 profils" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau de marque (masqué sur mobile) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 p-12 text-cream-50 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-grid-forest opacity-30" aria-hidden />
        <div
          className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold-500/15 blur-[110px]"
          aria-hidden
        />
        <div className="relative">
          <Logo tone="light" />
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-3xl font-bold leading-tight text-balance">
            La plateforme nationale de gestion et de planification scolaire.
          </h2>
          <ul className="mt-8 space-y-4">
            {atouts.map((a) => (
              <li key={a.texte} className="flex items-center gap-3 text-cream-200/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/15 text-gold-300">
                  <a.icone size={18} />
                </span>
                {a.texte}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-cream-200/50">
          © {new Date().getFullYear()} EduWeb Planner · Système éducatif ivoirien
        </p>
      </aside>

      {/* Zone de formulaire */}
      <main className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 transition-colors hover:text-forest-900"
          >
            <ArrowLeft size={16} />
            Accueil
          </Link>
          <div className="lg:hidden">
            <Logo withWordmark={false} size={36} />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
