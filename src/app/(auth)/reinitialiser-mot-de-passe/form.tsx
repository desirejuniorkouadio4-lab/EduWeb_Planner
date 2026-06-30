"use client";

import { useActionState } from "react";
import { reinitialiserMotDePasse, type EtatForm } from "../actions";
import { Input, Label, SubmitButton, FormAlert, FieldError } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

export function ReinitialiserForm({ token }: { token: string }) {
  const [etat, action] = useActionState(reinitialiserMotDePasse, initial);
  const err = etat.erreurs ?? {};

  return (
    <form action={action} className="space-y-4">
      {etat.message && !etat.ok && <FormAlert ton="erreur">{etat.message}</FormAlert>}
      <input type="hidden" name="token" value={token} />

      <div>
        <Label htmlFor="motDePasse">Nouveau mot de passe</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={err.motDePasse} />
      </div>

      <div>
        <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError messages={err.confirmation} />
      </div>

      <SubmitButton>Réinitialiser le mot de passe</SubmitButton>
    </form>
  );
}
