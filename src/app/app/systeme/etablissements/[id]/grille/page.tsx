import { redirect } from "next/navigation";

// Les volumes horaires (séances par discipline) sont gérés dans le bloc « Volumes horaires »
// de la console de configuration.
export default async function GrilleRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/systeme/etablissements/${id}#volumes`);
}
