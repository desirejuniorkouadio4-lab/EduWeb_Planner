"use client";

import { useState, useActionState } from "react";
import { Plus, X } from "lucide-react";
import { enregistrerSeances, type EtatForm } from "./actions";
import { SubmitButton, FormAlert } from "@/components/ui/form";

const initial: EtatForm = { ok: false };

export interface DisciplineLigne {
  disciplineId: string;
  nom: string;
  couleur: string | null;
  coef: number;
  seances: number[];
}

type Etat = Record<string, { coef: number; seances: number[] }>;

function formatVolume(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

export function GrilleNiveauEditor({
  etablissementId,
  niveauId,
  niveauNom,
  disciplines,
}: {
  etablissementId: string;
  niveauId: string;
  niveauNom: string;
  disciplines: DisciplineLigne[];
}) {
  const [etat, action] = useActionState(enregistrerSeances, initial);
  const [data, setData] = useState<Etat>(() =>
    Object.fromEntries(disciplines.map((d) => [d.disciplineId, { coef: d.coef, seances: [...d.seances] }])),
  );

  function setCoef(id: string, coef: number) {
    setData((s) => ({ ...s, [id]: { ...s[id], coef } }));
  }
  function setSeance(id: string, idx: number, val: number) {
    setData((s) => {
      const seances = [...s[id].seances];
      seances[idx] = val;
      return { ...s, [id]: { ...s[id], seances } };
    });
  }
  function addSeance(id: string) {
    setData((s) => ({ ...s, [id]: { ...s[id], seances: [...s[id].seances, 60] } }));
  }
  function removeSeance(id: string, idx: number) {
    setData((s) => ({ ...s, [id]: { ...s[id], seances: s[id].seances.filter((_, i) => i !== idx) } }));
  }

  const totalSeances = disciplines.reduce((acc, d) => acc + (data[d.disciplineId]?.seances.length ?? 0), 0);
  const totalMinutes = disciplines.reduce(
    (acc, d) => acc + (data[d.disciplineId]?.seances.reduce((a, b) => a + (Number(b) || 0), 0) ?? 0),
    0,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="etablissementId" value={etablissementId} />
      <input type="hidden" name="niveauId" value={niveauId} />
      <input type="hidden" name="payload" value={JSON.stringify(data)} />

      {etat.message && <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-left">
              <th className="py-2.5 pr-4 font-semibold text-ink-700/70">Discipline</th>
              <th className="px-2 py-2.5 font-semibold text-ink-700/70">Coef.</th>
              <th className="px-2 py-2.5 font-semibold text-ink-700/70">Séances (durée en min)</th>
              <th className="px-2 py-2.5 text-right font-semibold text-ink-700/70">Volume hebdo</th>
              <th className="px-2 py-2.5 text-center font-semibold text-ink-700/70">Statut</th>
            </tr>
          </thead>
          <tbody>
            {disciplines.map((d) => {
              const ligne = data[d.disciplineId];
              const minutes = ligne.seances.reduce((a, b) => a + (Number(b) || 0), 0);
              const ok = ligne.seances.length > 0 && minutes > 0;
              return (
                <tr key={d.disciplineId} className="border-b border-cream-100 last:border-0 align-top">
                  <td className="py-2.5 pr-4 font-medium text-forest-900">
                    <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ backgroundColor: d.couleur ?? "#999" }} />
                    {d.nom}
                  </td>
                  <td className="px-2 py-2.5">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={ligne.coef}
                      onChange={(e) => setCoef(d.disciplineId, Number(e.target.value))}
                      className="h-8 w-16 rounded-lg border border-cream-300 bg-white px-2 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
                    />
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ligne.seances.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-lg border border-cream-300 bg-cream-50 py-0.5 pl-1.5 pr-0.5">
                          <input
                            type="number"
                            min={0}
                            step={5}
                            value={s}
                            onChange={(e) => setSeance(d.disciplineId, i, Number(e.target.value))}
                            className="h-7 w-14 rounded border-0 bg-transparent px-1 text-sm outline-none"
                          />
                          <span className="text-[0.6rem] text-ink-700/50">min</span>
                          <button
                            type="button"
                            onClick={() => removeSeance(d.disciplineId, i)}
                            className="flex h-5 w-5 items-center justify-center rounded text-ink-700/40 hover:bg-red-50 hover:text-red-600"
                            aria-label="Retirer la séance"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSeance(d.disciplineId)}
                        className="inline-flex items-center gap-1 rounded-lg border border-dashed border-forest-300 px-2 py-1 text-xs font-medium text-forest-700 hover:bg-forest-50"
                      >
                        <Plus size={12} /> séance
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right font-semibold text-forest-800">{formatVolume(minutes)}</td>
                  <td className="px-2 py-2.5 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${ok ? "bg-forest-100 text-forest-800" : "bg-gold-100 text-gold-800"}`}>
                      {ok ? "OK" : "À définir"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-cream-200">
              <td className="py-2.5 pr-4 font-medium text-ink-700/70">Total — {niveauNom}</td>
              <td />
              <td className="px-2 py-2.5 font-semibold text-gold-700">{totalSeances} séance(s)</td>
              <td className="px-2 py-2.5 text-right font-display font-bold text-forest-900">{formatVolume(totalMinutes)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <SubmitButton className="w-auto px-8">Enregistrer la grille de {niveauNom}</SubmitButton>
    </form>
  );
}
