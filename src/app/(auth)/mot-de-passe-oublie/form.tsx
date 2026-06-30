"use client";

import { useActionState } from "react";
import { demanderReinitialisation, type EtatForm } from "../actions";
import { Input, Label, SubmitButton, FormAlert } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

export function MotDePasseOublieForm() {
  const [etat, action] = useActionState(demanderReinitialisation, initial);

  return (
    <form action={action} className="space-y-4">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <div>
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.ci" />
      </div>
      <SubmitButton>Envoyer le lien</SubmitButton>
    </form>
  );
}
