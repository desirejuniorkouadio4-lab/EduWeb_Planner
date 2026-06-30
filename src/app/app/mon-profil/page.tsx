import type { Metadata } from "next";
import { requireUtilisateur } from "@/lib/auth/session";
import { PageHeader, Card } from "@/components/app/ui";
import { ProfilForm } from "./profil-form";

export const metadata: Metadata = { title: "Mon Profil" };
export const dynamic = "force-dynamic";

export default async function MonProfilPage() {
  const u = await requireUtilisateur();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        titre="Mon Profil"
        description="Gérez vos informations personnelles et vos préférences d'affichage."
      />
      <Card>
        <ProfilForm
          valeurs={{
            prenoms: u.prenoms ?? "",
            nom: u.nom ?? "",
            telephone: u.telephone ?? "",
            langue: u.langue,
            email: u.email,
          }}
        />
      </Card>
    </div>
  );
}
