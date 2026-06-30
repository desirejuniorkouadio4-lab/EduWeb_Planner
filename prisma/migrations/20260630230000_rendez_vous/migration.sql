-- CreateEnum
CREATE TYPE "StatutRendezVous" AS ENUM ('demande', 'confirme', 'refuse', 'annule');

-- CreateTable
CREATE TABLE "rendez_vous" (
    "id" TEXT NOT NULL,
    "demandeurId" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "motif" TEXT NOT NULL,
    "statut" "StatutRendezVous" NOT NULL DEFAULT 'demande',
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rendez_vous_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rendez_vous_demandeurId_idx" ON "rendez_vous"("demandeurId");

-- CreateIndex
CREATE INDEX "rendez_vous_destinataireId_idx" ON "rendez_vous"("destinataireId");

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_demandeurId_fkey" FOREIGN KEY ("demandeurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendez_vous" ADD CONSTRAINT "rendez_vous_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
