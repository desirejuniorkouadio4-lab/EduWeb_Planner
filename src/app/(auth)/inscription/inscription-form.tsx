"use client";

import { useActionState } from "react";
import { sinscrire, type EtatForm } from "../actions";
import { Input, Label, Select, SubmitButton, FormAlert, FieldError } from "@/components/ui/form";
import { ROLES_ORDONNES } from "@/lib/rbac";

const initial: EtatForm = { ok: false };

const groupesLibelle: Record<string, string> = {
  pilotage: "Pilotage & administration",
  formation: "Structures de formation",
  etablissement: "Établissement",
  famille: "Famille",
};

// Rôles proposés à l'inscription (admin exclu : compte d'amorçage interne).
const rolesParGroupe = (["pilotage", "formation", "etablissement", "famille"] as const).map(
  (g) => ({
    groupe: g,
    roles: ROLES_ORDONNES.filter((r) => r.groupe === g && r.id !== "admin"),
  }),
);

export function InscriptionForm() {
  const [etat, action] = useActionState(sinscrire, initial);
  const err = etat.erreurs ?? {};

  return (
    <form action={action} className="space-y-4">
      {etat.message && !etat.ok && <FormAlert ton="erreur">{etat.message}</FormAlert>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="prenoms">Prénoms</Label>
          <Input id="prenoms" name="prenoms" autoComplete="given-name" required />
          <FieldError messages={err.prenoms} />
        </div>
        <div>
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" name="nom" autoComplete="family-name" required />
          <FieldError messages={err.nom} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="vous@exemple.ci" />
        <FieldError messages={err.email} />
      </div>

      <div>
        <Label htmlFor="telephone">Téléphone (facultatif)</Label>
        <Input id="telephone" name="telephone" type="tel" autoComplete="tel" placeholder="+225 ..." />
      </div>

      <div>
        <Label htmlFor="roleSouhaite">Rôle souhaité</Label>
        <Select id="roleSouhaite" name="roleSouhaite" defaultValue="" required>
          <option value="" disabled>
            Sélectionnez votre rôle…
          </option>
          {rolesParGroupe.map(({ groupe, roles }) => (
            <optgroup key={groupe} label={groupesLibelle[groupe]}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.libelle}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
        <FieldError messages={err.roleSouhaite} />
      </div>

      <div>
        <Label htmlFor="structureDeclaree">Établissement / structure de rattachement (facultatif)</Label>
        <Input
          id="structureDeclaree"
          name="structureDeclaree"
          placeholder="Ex : Lycée Moderne de Cocody"
        />
        <p className="mt-1.5 text-xs text-ink-700/60">
          Cette information aide l'administrateur à valider votre demande de rôle.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="motDePasse">Mot de passe</Label>
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
          <Label htmlFor="confirmation">Confirmation</Label>
          <Input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError messages={err.confirmation} />
        </div>
      </div>

      <SubmitButton>Créer mon compte</SubmitButton>

      <p className="text-center text-xs leading-relaxed text-ink-700/60">
        En créant un compte, vous recevez le rôle par défaut « Élève » ; votre rôle souhaité est
        soumis à l'approbation d'un administrateur.
      </p>
    </form>
  );
}
