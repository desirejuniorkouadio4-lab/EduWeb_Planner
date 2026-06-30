import type { Metadata } from "next";
import Link from "next/link";
import { MotDePasseOublieForm } from "./form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function MotDePasseOubliePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-forest-900">Mot de passe oublié</h1>
      <p className="mt-2 text-sm text-ink-700/75">
        Indiquez votre adresse e-mail : nous vous enverrons un lien de réinitialisation.
      </p>

      <div className="mt-6">
        <MotDePasseOublieForm />
      </div>

      <p className="mt-6 text-center text-sm text-ink-700/75">
        <Link href="/connexion" className="font-semibold text-forest-700 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
