"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Info, CheckCircle2, AlertTriangle, KeyRound, CheckCheck, BellOff } from "lucide-react";
import {
  marquerLue,
  marquerToutesLues,
  type NotificationItem,
} from "@/lib/notifications/actions";

const ICONES = {
  info: { Icone: Info, classe: "text-forest-600" },
  succes: { Icone: CheckCircle2, classe: "text-forest-600" },
  alerte: { Icone: AlertTriangle, classe: "text-gold-600" },
  role: { Icone: KeyRound, classe: "text-gold-600" },
} as const;

function dateLongue(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(
    new Date(iso),
  );
}

export function ListeNotifications({ initiales }: { initiales: NotificationItem[] }) {
  const [notifs, setNotifs] = useState(initiales);
  const [, start] = useTransition();
  const router = useRouter();

  const nonLues = notifs.filter((n) => !n.lu).length;

  function ouvrir(n: NotificationItem) {
    if (!n.lu) {
      setNotifs((s) => s.map((x) => (x.id === n.id ? { ...x, lu: true } : x)));
      start(async () => {
        await marquerLue(n.id);
        router.refresh();
      });
    }
    if (n.lien) router.push(n.lien);
  }

  function toutMarquer() {
    setNotifs((s) => s.map((x) => ({ ...x, lu: true })));
    start(async () => {
      await marquerToutesLues();
      router.refresh();
    });
  }

  if (notifs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <BellOff size={28} className="text-ink-700/30" />
        <p className="mt-3 text-sm text-ink-700/55">{"Vous n'avez aucune notification."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {nonLues > 0 && (
        <div className="flex justify-end">
          <button
            onClick={toutMarquer}
            className="inline-flex items-center gap-1.5 rounded-full border border-forest-200 px-3.5 py-1.5 text-xs font-semibold text-forest-800 hover:bg-forest-50"
          >
            <CheckCheck size={14} /> Tout marquer comme lu ({nonLues})
          </button>
        </div>
      )}
      <ul className="divide-y divide-cream-100">
        {notifs.map((n) => {
          const { Icone, classe } = ICONES[n.type];
          return (
            <li key={n.id}>
              <button
                onClick={() => ouvrir(n)}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-cream-50 ${
                  n.lu ? "" : "bg-forest-50/40"
                }`}
              >
                <Icone size={18} className={`mt-0.5 shrink-0 ${classe}`} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-semibold text-forest-900">
                    <span>{n.titre}</span>
                    {!n.lu && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-700/75">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-700/45">{dateLongue(n.creeLe)}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
