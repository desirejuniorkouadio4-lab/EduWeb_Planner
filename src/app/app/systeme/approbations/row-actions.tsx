"use client";

import { useFormStatus } from "react-dom";
import { Check, X, Loader2 } from "lucide-react";
import { approuverDemande, refuserDemande } from "./actions";

function Bouton({ ton }: { ton: "approuver" | "refuser" }) {
  const { pending } = useFormStatus();
  const approuver = ton === "approuver";
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all disabled:opacity-60 " +
        (approuver
          ? "bg-forest-700 text-cream-50 hover:bg-forest-600"
          : "border border-red-200 text-red-600 hover:bg-red-50")
      }
    >
      {pending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : approuver ? (
        <Check size={14} />
      ) : (
        <X size={14} />
      )}
      {approuver ? "Approuver" : "Refuser"}
    </button>
  );
}

export function RowActions({ demandeId }: { demandeId: string }) {
  return (
    <div className="flex gap-2">
      <form action={approuverDemande}>
        <input type="hidden" name="demandeId" value={demandeId} />
        <Bouton ton="approuver" />
      </form>
      <form action={refuserDemande}>
        <input type="hidden" name="demandeId" value={demandeId} />
        <Bouton ton="refuser" />
      </form>
    </div>
  );
}
