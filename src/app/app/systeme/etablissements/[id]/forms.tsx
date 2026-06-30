"use client";

import { useActionState } from "react";
import { creerSalle, creerClasse, type EtatForm } from "../actions";
import { Input, Label, Select, SubmitButton, FormAlert, FieldError } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

const TYPES_SALLE = [
  { v: "ordinaire", l: "Salle ordinaire" },
  { v: "laboratoire", l: "Laboratoire" },
  { v: "salle_informatique", l: "Salle informatique" },
  { v: "atelier", l: "Atelier" },
  { v: "salle_eps", l: "Salle / espace EPS" },
  { v: "autre", l: "Autre" },
];

export function SalleForm({ etablissementId }: { etablissementId: string }) {
  const [etat, action] = useActionState(creerSalle, initial);
  const err = etat.erreurs ?? {};
  return (
    <form action={action} className="space-y-3">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <input type="hidden" name="etablissementId" value={etablissementId} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="salle-nom">Nom</Label>
          <Input id="salle-nom" name="nom" required placeholder="Salle 12" />
          <FieldError messages={err.nom} />
        </div>
        <div>
          <Label htmlFor="salle-capacite">Capacité</Label>
          <Input id="salle-capacite" name="capacite" type="number" min={0} defaultValue={40} />
        </div>
        <div>
          <Label htmlFor="salle-type">Type</Label>
          <Select id="salle-type" name="type" defaultValue="ordinaire">
            {TYPES_SALLE.map((t) => (
              <option key={t.v} value={t.v}>
                {t.l}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <SubmitButton className="w-auto px-6">Ajouter la salle</SubmitButton>
    </form>
  );
}

export function ClasseForm({
  etablissementId,
  niveaux,
}: {
  etablissementId: string;
  niveaux: { id: string; nom: string }[];
}) {
  const [etat, action] = useActionState(creerClasse, initial);
  const err = etat.erreurs ?? {};
  return (
    <form action={action} className="space-y-3">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <input type="hidden" name="etablissementId" value={etablissementId} />
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="classe-nom">Nom</Label>
          <Input id="classe-nom" name="nom" required placeholder="6ème A" />
          <FieldError messages={err.nom} />
        </div>
        <div>
          <Label htmlFor="classe-niveau">Niveau</Label>
          <Select id="classe-niveau" name="niveauId" defaultValue="" required>
            <option value="" disabled>
              Choisir…
            </option>
            {niveaux.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nom}
              </option>
            ))}
          </Select>
          <FieldError messages={err.niveauId} />
        </div>
        <div>
          <Label htmlFor="classe-effectif">Effectif</Label>
          <Input id="classe-effectif" name="effectif" type="number" min={0} defaultValue={50} />
        </div>
        <div>
          <Label htmlFor="classe-vacation">Vacation</Label>
          <Select id="classe-vacation" name="regimeVacation" defaultValue="simple">
            <option value="simple">Simple</option>
            <option value="double">Double</option>
          </Select>
        </div>
      </div>
      <SubmitButton className="w-auto px-6">Ajouter la classe</SubmitButton>
    </form>
  );
}
