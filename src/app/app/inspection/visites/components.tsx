"use client";

import { useActionState, useTransition } from "react";
import { Plus, Trash2, CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import { SubmitButton, FormAlert } from "@/components/ui/form";
import {
  creerVisite,
  enregistrerCompteRendu,
  ajouterRecommandation,
  changerStatutVisite,
  changerStatutRecommandation,
  supprimerVisite,
  type EtatForm,
} from "./actions";

const initial: EtatForm = { ok: false };

const LIBELLE_TYPE: Record<string, string> = {
  classe: "Visite de classe",
  etablissement: "Visite d'établissement",
  suivi: "Visite de suivi",
};
const STATUT_VISITE: Record<string, { texte: string; classe: string }> = {
  planifiee: { texte: "Planifiée", classe: "bg-gold-100 text-gold-800" },
  realisee: { texte: "Réalisée", classe: "bg-forest-100 text-forest-800" },
  annulee: { texte: "Annulée", classe: "bg-red-100 text-red-700" },
};
const PRIORITE: Record<string, { texte: string; classe: string }> = {
  basse: { texte: "Basse", classe: "bg-cream-200 text-forest-800" },
  moyenne: { texte: "Moyenne", classe: "bg-gold-100 text-gold-800" },
  haute: { texte: "Haute", classe: "bg-red-100 text-red-700" },
};
const STATUT_RECO: { v: string; l: string }[] = [
  { v: "ouverte", l: "Ouverte" },
  { v: "en_cours", l: "En cours" },
  { v: "traitee", l: "Traitée" },
];

function dateFr(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(iso));
}

const inputCls =
  "h-11 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200";

export function NouvelleVisiteForm({
  etablissements,
}: {
  etablissements: { id: string; nom: string }[];
}) {
  const [etat, action] = useActionState(creerVisite, initial);
  return (
    <form action={action} className="space-y-4">
      {etat.message && <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Établissement</label>
          <select name="etablissementId" required defaultValue="" className={inputCls}>
            <option value="" disabled>
              Choisir…
            </option>
            {etablissements.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Type</label>
          <select name="type" defaultValue="classe" className={inputCls}>
            <option value="classe">Visite de classe</option>
            <option value="etablissement">Visite d&apos;établissement</option>
            <option value="suivi">Visite de suivi</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Date</label>
          <input type="date" name="date" required className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Objet</label>
          <input type="text" name="objet" required placeholder="Objet de la visite" className={inputCls} />
        </div>
      </div>
      <SubmitButton className="w-auto px-8">Planifier la visite</SubmitButton>
    </form>
  );
}

export interface VisiteVue {
  id: string;
  etablissementNom: string;
  inspecteurNom: string;
  enseignantNom: string | null;
  date: string;
  type: string;
  statut: string;
  objet: string;
  observations: string | null;
  noteGlobale: number | null;
  recommandations: { id: string; texte: string; priorite: string; statut: string }[];
}

export function VisiteCard({ visite, gerable }: { visite: VisiteVue; gerable: boolean }) {
  const [pending, start] = useTransition();
  const [etatCR, actionCR] = useActionState(enregistrerCompteRendu, initial);
  const [etatReco, actionReco] = useActionState(ajouterRecommandation, initial);
  const st = STATUT_VISITE[visite.statut] ?? STATUT_VISITE.planifiee;

  return (
    <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-forest-900">{visite.etablissementNom}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.classe}`}>{st.texte}</span>
            {visite.noteGlobale != null && (
              <span className="rounded-full bg-forest-800 px-2.5 py-0.5 text-xs font-semibold text-gold-300">
                {visite.noteGlobale}/20
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-700/60">
            {LIBELLE_TYPE[visite.type] ?? visite.type} · {dateFr(visite.date)} · par {visite.inspecteurNom}
          </p>
          <p className="mt-2 text-sm text-ink-900">{visite.objet}</p>
        </div>
        {gerable && (
          <div className="flex items-center gap-1.5">
            {visite.statut !== "annulee" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => start(async () => void (await changerStatutVisite(visite.id, "annulee")))}
                title="Annuler la visite"
                className="inline-flex h-8 items-center gap-1 rounded-full border border-cream-300 px-3 text-xs font-semibold text-ink-700/70 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <XCircle size={13} /> Annuler
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => start(async () => void (await supprimerVisite(visite.id)))}
              title="Supprimer la visite"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-700/40 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {visite.observations && (
        <p className="mt-3 rounded-xl border border-cream-200 bg-cream-50/60 p-3 text-sm text-ink-900">
          {visite.observations}
        </p>
      )}

      {/* Compte-rendu (gérable) */}
      {gerable && visite.statut !== "annulee" && (
        <details className="mt-3 rounded-xl border border-cream-200 bg-cream-50/40 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-forest-800">
            <ClipboardCheck size={14} className="mr-1 inline" /> Compte-rendu / appréciation
          </summary>
          <form action={actionCR} className="mt-3 space-y-3">
            {etatCR.message && <FormAlert ton={etatCR.ok ? "succes" : "erreur"}>{etatCR.message}</FormAlert>}
            <input type="hidden" name="visiteId" value={visite.id} />
            <textarea
              name="observations"
              rows={3}
              defaultValue={visite.observations ?? ""}
              placeholder="Observations, constats, points forts et axes d'amélioration…"
              className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
            />
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-forest-900">Appréciation /20</label>
                <input
                  type="number"
                  name="noteGlobale"
                  min={0}
                  max={20}
                  step={0.5}
                  defaultValue={visite.noteGlobale ?? ""}
                  className="h-10 w-24 rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
                />
              </div>
              <SubmitButton className="w-auto px-6">
                <CheckCircle2 size={15} /> Enregistrer (réalisée)
              </SubmitButton>
            </div>
          </form>
        </details>
      )}

      {/* Recommandations */}
      <div className="mt-4 border-t border-cream-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-700/50">
          Recommandations ({visite.recommandations.length})
        </p>
        {visite.recommandations.length > 0 && (
          <ul className="mb-3 space-y-2">
            {visite.recommandations.map((r) => {
              const p = PRIORITE[r.priorite] ?? PRIORITE.moyenne;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cream-200 bg-cream-50/40 px-3 py-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${p.classe}`}>{p.texte}</span>
                    <span className="text-ink-900">{r.texte}</span>
                  </span>
                  {gerable ? (
                    <select
                      defaultValue={r.statut}
                      disabled={pending}
                      onChange={(e) =>
                        start(async () =>
                          void (await changerStatutRecommandation(r.id, e.target.value as "ouverte" | "en_cours" | "traitee")))
                      }
                      className="h-8 rounded-lg border border-cream-300 bg-white px-2 text-xs outline-none focus:border-forest-400"
                    >
                      {STATUT_RECO.map((s) => (
                        <option key={s.v} value={s.v}>
                          {s.l}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-ink-700/60">
                      {STATUT_RECO.find((s) => s.v === r.statut)?.l}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {gerable && (
          <form action={actionReco} className="flex flex-wrap items-end gap-2">
            {etatReco.message && !etatReco.ok && (
              <div className="w-full">
                <FormAlert ton="erreur">{etatReco.message}</FormAlert>
              </div>
            )}
            <input type="hidden" name="visiteId" value={visite.id} />
            <input
              type="text"
              name="texte"
              required
              placeholder="Nouvelle recommandation…"
              className="h-9 min-w-[12rem] flex-1 rounded-lg border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200"
            />
            <select name="priorite" defaultValue="moyenne" className="h-9 rounded-lg border border-cream-300 bg-white px-2 text-sm outline-none focus:border-forest-400">
              <option value="basse">Basse</option>
              <option value="moyenne">Moyenne</option>
              <option value="haute">Haute</option>
            </select>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1 rounded-full border border-forest-200 px-3.5 text-xs font-semibold text-forest-800 hover:bg-forest-50"
            >
              <Plus size={13} /> Ajouter
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
