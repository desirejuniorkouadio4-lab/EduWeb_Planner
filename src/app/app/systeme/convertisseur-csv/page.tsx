import type { Metadata } from "next";
import { FileSpreadsheet } from "lucide-react";
import { requireRole } from "@/lib/auth/session";
import { PageHeader, Card } from "@/components/app/ui";
import { Convertisseur } from "./converter";

export const metadata: Metadata = { title: "Convertisseur CSV" };
export const dynamic = "force-dynamic";

export default async function ConvertisseurCsvPage() {
  await requireRole(["admin", "cafop_admin", "apfc_admin"]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        titre="Convertisseur CSV"
        description="Convertir un export Moodle au format d'import des apprenants (CAFOP / APFC)."
      />
      <Card>
        <h2 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-forest-900">
          <FileSpreadsheet size={18} /> Moodle → EduWeb Planner
        </h2>
        <Convertisseur />
      </Card>
    </div>
  );
}
