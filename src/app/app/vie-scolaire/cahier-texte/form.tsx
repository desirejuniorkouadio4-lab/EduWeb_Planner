"use client";

import { useActionState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { enregistrerEntree, supprimerEntree, type EtatForm } from "./actions";
import { SubmitButton, FormAlert } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

export function CahierForm({
  classeId,
  date,
  disciplines,
  disciplineParDefaut,
}: {
  classeId: string;
  date: string;
  disciplines: { id: string; nom: string }[];
  disciplineParDefaut: string | null;
}) {
  const [etat, action] = useActionState(enregistrerEntree, initial);

  if (disciplines.length === 0) {
    return (
      <p className="text-sm text-ink-700/65">
        Aucune discipline disponible pour cette classe. Vérifiez les affectations (Vie scolaire →
        Affectations).
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {etat.message && (
        <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>
      )}
      <input type="hidden" name="classeId" value={classeId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Discipline</label>
          <select
            name="disciplineId"
            defaultValue={disciplineParDefaut ?? disciplines[0]?.id ?? ""}
            className="h-11 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
          >
            {disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">
            Date de la séance
          </label>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="h-11 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">
          Contenu de la séance
        </label>
        <textarea
          name="contenu"
          rows={3}
          required
          placeholder="Leçon traitée, activités menées, notions abordées…"
          className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">
          Travail à faire <span className="font-normal text-ink-700/50">(optionnel)</span>
        </label>
        <textarea
          name="travailAFaire"
          rows={2}
          placeholder="Devoirs, exercices, leçon à apprendre pour la prochaine séance…"
          className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
        />
      </div>

      <SubmitButton className="w-auto px-8">Consigner la séance</SubmitButton>
    </form>
  );
}

export function SupprimerEntreeButton({ entreeId }: { entreeId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await supprimerEntree(entreeId);
        })
      }
      title="Supprimer cette entrée"
      aria-label="Supprimer cette entrée"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-700/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  );
}
