import { requireUtilisateur } from "@/lib/auth/session";
import { chargerNotifications } from "@/lib/notifications/actions";
import { AppShell, type UtilisateurShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUtilisateur();
  const { notifications, nombreNonLues } = await chargerNotifications();

  const utilisateur: UtilisateurShell = {
    nomComplet: u.nomComplet,
    email: u.email,
    roleActif: u.roleActif,
    libelleRoleActif: u.libelleRoleActif,
    photoUrl: u.photoUrl,
    accesRestreint: u.accesRestreint,
    apercuActif: u.apercuActif,
    demandeEnAttente: u.demandeEnAttente
      ? {
          id: u.demandeEnAttente.id,
          roleDemande: u.demandeEnAttente.roleDemande,
          libelleRoleDemande: u.demandeEnAttente.libelleRoleDemande,
          structureDeclaree: u.demandeEnAttente.structureDeclaree,
          creeLe: u.demandeEnAttente.creeLe.toISOString(),
        }
      : null,
  };

  return (
    <AppShell
      utilisateur={utilisateur}
      notificationsInitiales={notifications}
      nonLuesInitiales={nombreNonLues}
    >
      {children}
    </AppShell>
  );
}
