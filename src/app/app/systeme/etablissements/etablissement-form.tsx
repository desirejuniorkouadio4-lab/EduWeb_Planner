"use client";

import { useActionState } from "react";
import { creerEtablissement, type EtatForm } from "./actions";
import { Input, Label, Select, SubmitButton, FormAlert, FieldError } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

const TYPES = [
  { v: "college", l: "Collège" },
  { v: "lycee", l: "Lycée" },
  { v: "groupe_scolaire", l: "Groupe scolaire" },
  { v: "primaire", l: "Primaire" },
  { v: "prescolaire", l: "Préscolaire" },
  { v: "autre", l: "Autre" },
];
const STATUTS = [
  { v: "public", l: "Public" },
  { v: "prive", l: "Privé" },
  { v: "confessionnel", l: "Confessionnel" },
  { v: "autre", l: "Autre" },
];

export function EtablissementForm({ regions }: { regions: { id: string; nom: string }[] }) {
  const [etat, action] = useActionState(creerEtablissement, initial);
  const err = etat.erreurs ?? {};

  return (
    <form action={action} className="space-y-4">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <div>
        <Label htmlFor="nom">Nom de l'établissement</Label>
        <Input id="nom" name="nom" required placeholder="Ex : Lycée Moderne de Cocody" />
        <FieldError messages={err.nom} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" name="type" defaultValue="college">
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.l}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="statut">Statut</Label>
          <Select id="statut" name="statut" defaultValue="public">
            {STATUTS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="regionId">Région</Label>
          <Select id="regionId" name="regionId" defaultValue="">
            <option value="">— Non rattaché —</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="ville">Ville</Label>
          <Input id="ville" name="ville" placeholder="Ex : Abidjan" />
        </div>
      </div>
      <SubmitButton className="w-auto px-8">Créer l'établissement</SubmitButton>
    </form>
  );
}
