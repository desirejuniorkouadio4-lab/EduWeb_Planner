"use client";

import { useActionState } from "react";
import { mettreAJourProfil, type EtatForm } from "./actions";
import { Input, Label, Select, SubmitButton, FormAlert, FieldError } from "@/components/ui/form";

interface ValeursProfil {
  prenoms: string;
  nom: string;
  telephone: string;
  langue: string;
  email: string;
}

const initial: EtatForm = { ok: false };

export function ProfilForm({ valeurs }: { valeurs: ValeursProfil }) {
  const [etat, action] = useActionState(mettreAJourProfil, initial);
  const err = etat.erreurs ?? {};

  return (
    <form action={action} className="space-y-5">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="prenoms">Prénoms</Label>
          <Input id="prenoms" name="prenoms" defaultValue={valeurs.prenoms} required />
          <FieldError messages={err.prenoms} />
        </div>
        <div>
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" name="nom" defaultValue={valeurs.nom} required />
          <FieldError messages={err.nom} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" value={valeurs.email} disabled readOnly />
        <p className="mt-1.5 text-xs text-ink-700/55">
          L'adresse e-mail ne peut pas être modifiée ici.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            defaultValue={valeurs.telephone}
            placeholder="+225 ..."
          />
        </div>
        <div>
          <Label htmlFor="langue">Langue d'affichage</Label>
          <Select id="langue" name="langue" defaultValue={valeurs.langue}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </Select>
        </div>
      </div>

      <div className="pt-1">
        <SubmitButton className="w-auto px-8">Enregistrer</SubmitButton>
      </div>
    </form>
  );
}
