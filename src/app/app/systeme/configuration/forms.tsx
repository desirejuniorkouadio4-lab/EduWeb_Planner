"use client";

import { useActionState } from "react";
import {
  mettreAJourConfiguration,
  creerAnneeScolaire,
  creerRegion,
  type EtatForm,
} from "./actions";
import { Input, Label, Select, SubmitButton, FormAlert } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

export function ConfigForm({
  regimeNotation,
  anneeCourante,
  annees,
}: {
  regimeNotation: string;
  anneeCourante: string | null;
  annees: string[];
}) {
  const [etat, action] = useActionState(mettreAJourConfiguration, initial);
  return (
    <form action={action} className="space-y-4">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="anneeScolaireCourante">Année scolaire en cours</Label>
          <Select
            id="anneeScolaireCourante"
            name="anneeScolaireCourante"
            defaultValue={anneeCourante ?? ""}
          >
            <option value="">— Aucune —</option>
            {annees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="regimeNotation">Régime de notation</Label>
          <Select id="regimeNotation" name="regimeNotation" defaultValue={regimeNotation}>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
          </Select>
        </div>
      </div>
      <SubmitButton className="w-auto px-8">Enregistrer</SubmitButton>
    </form>
  );
}

export function AnneeForm() {
  const [etat, action] = useActionState(creerAnneeScolaire, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="libelle">Nouvelle année (AAAA-AAAA)</Label>
        <Input id="libelle" name="libelle" placeholder="2026-2027" />
      </div>
      <SubmitButton className="w-auto px-5">Ajouter</SubmitButton>
      {etat.message && (
        <span className={`w-full text-xs ${etat.ok ? "text-forest-700" : "text-red-600"}`}>
          {etat.message}
        </span>
      )}
    </form>
  );
}

export function RegionForm() {
  const [etat, action] = useActionState(creerRegion, initial);
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="nomRegion">Nouvelle région</Label>
        <Input id="nomRegion" name="nom" placeholder="Ex : Gagnoa" />
      </div>
      <SubmitButton className="w-auto px-5">Ajouter</SubmitButton>
      {etat.message && (
        <span className={`w-full text-xs ${etat.ok ? "text-forest-700" : "text-red-600"}`}>
          {etat.message}
        </span>
      )}
    </form>
  );
}
