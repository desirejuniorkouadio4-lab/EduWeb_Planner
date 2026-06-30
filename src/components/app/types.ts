import type { RoleId } from "@/lib/rbac";

/** Version sérialisable (dates en ISO) de la demande en attente, passée aux composants client. */
export interface DemandeEnAttenteSerialisee {
  id: string;
  roleDemande: RoleId;
  libelleRoleDemande: string;
  structureDeclaree: string | null;
  creeLe: string;
}
