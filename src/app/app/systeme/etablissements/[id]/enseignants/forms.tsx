"use client";

import { useActionState } from "react";
import { ajouterEnseignant, importerEnseignantsCSV, type EtatForm } from "./actions";
import { Input, Label, SubmitButton, FormAlert } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

export function AjoutEnseignantForm({ etablissementId }: { etablissementId: string }) {
  const [etat, action] = useActionState(ajouterEnseignant, initial);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="etablissementId" value={etablissementId} />
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="prenoms">Prénoms</Label>
          <Input id="prenoms" name="prenoms" required />
        </div>
        <div>
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" name="nom" required />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required placeholder="prof@exemple.ci" />
        </div>
      </div>
      <SubmitButton className="w-auto px-6">Ajouter l'enseignant</SubmitButton>
    </form>
  );
}

export function ImportCSVForm({ etablissementId }: { etablissementId: string }) {
  const [etat, action] = useActionState(importerEnseignantsCSV, initial);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="etablissementId" value={etablissementId} />
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <input
        type="file"
        name="fichier"
        accept=".csv,text/csv"
        required
        className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-full file:border-0 file:bg-forest-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest-800"
      />
      <SubmitButton className="w-auto px-6">Importer la cohorte</SubmitButton>
    </form>
  );
}
