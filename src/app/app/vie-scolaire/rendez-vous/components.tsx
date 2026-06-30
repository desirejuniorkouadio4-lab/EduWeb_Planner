"use client";

import { useActionState, useTransition } from "react";
import { CalendarPlus, Check, X } from "lucide-react";
import { SubmitButton, FormAlert } from "@/components/ui/form";
import { demanderRdv, repondreRdv, type EtatForm } from "./actions";

const initial: EtatForm = { ok: false };
const inputCls =
  "h-11 w-full rounded-xl border border-cream-300 bg-white px-3 text-sm outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-200";

export function DemandeRdvForm() {
  const [etat, action] = useActionState(demanderRdv, initial);
  return (
    <form action={action} className="space-y-4">
      {etat.message && <FormAlert ton={etat.ok ? "succes" : "erreur"}>{etat.message}</FormAlert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Destinataire (e-mail)</label>
          <input name="email" type="email" required placeholder="enseignant@exemple.ci" className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-forest-900">Date & heure</label>
          <input name="date" type="datetime-local" required className={inputCls} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-forest-900">Motif</label>
        <input name="motif" required placeholder="Suivi de la scolarité, comportement…" className={inputCls} />
      </div>
      <SubmitButton className="w-auto px-6">
        <CalendarPlus size={15} /> Demander un rendez-vous
      </SubmitButton>
    </form>
  );
}

export function ActionsRdv({ id, role }: { id: string; role: "destinataire" | "demandeur" }) {
  const [pending, start] = useTransition();
  if (role === "demandeur") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await repondreRdv(id, "annule")))}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-cream-300 px-3 text-xs font-semibold text-ink-700/70 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <X size={13} /> Annuler
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await repondreRdv(id, "confirme")))}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-forest-700 px-3 text-xs font-semibold text-cream-50 hover:bg-forest-800 disabled:opacity-50"
      >
        <Check size={13} /> Confirmer
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await repondreRdv(id, "refuse")))}
        className="inline-flex h-8 items-center gap-1 rounded-full border border-cream-300 px-3 text-xs font-semibold text-ink-700/70 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <X size={13} /> Refuser
      </button>
    </div>
  );
}
