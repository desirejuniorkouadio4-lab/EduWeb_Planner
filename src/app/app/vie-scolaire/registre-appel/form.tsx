"use client";

import { useActionState } from "react";
import { enregistrerAppel, type EtatForm } from "./actions";
import { SubmitButton, FormAlert } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

interface EleveLigne {
  eleveId: string;
  nom: string;
  statut: "present" | "absent" | "retard" | "excuse";
}

const OPTIONS: { v: string; l: string }[] = [
  { v: "present", l: "Présent" },
  { v: "absent", l: "Absent" },
  { v: "retard", l: "Retard" },
  { v: "excuse", l: "Excusé" },
];

export function AppelForm({
  classeId,
  date,
  disciplineId,
  eleves,
}: {
  classeId: string;
  date: string;
  disciplineId: string | null;
  eleves: EleveLigne[];
}) {
  const [etat, action] = useActionState(enregistrerAppel, initial);

  if (eleves.length === 0) {
    return (
      <p className="text-sm text-ink-700/65">
        Aucun élève inscrit dans cette classe. Inscrivez des élèves d'abord (Vie scolaire →
        Inscriptions).
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <input type="hidden" name="classeId" value={classeId} />
      <input type="hidden" name="date" value={date} />
      {disciplineId && <input type="hidden" name="disciplineId" value={disciplineId} />}

      <ul className="divide-y divide-cream-100">
        {eleves.map((e) => (
          <li key={e.eleveId} className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm font-medium text-forest-900">{e.nom}</span>
            <select
              name={`statut_${e.eleveId}`}
              defaultValue={e.statut}
              className="h-9 w-32 rounded-lg border border-cream-300 bg-white px-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
            >
              {OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <SubmitButton className="w-auto px-8">Enregistrer l'appel</SubmitButton>
    </form>
  );
}
