-- CreateEnum
CREATE TYPE "TypeVisite" AS ENUM ('classe', 'etablissement', 'suivi');

-- CreateEnum
CREATE TYPE "StatutVisite" AS ENUM ('planifiee', 'realisee', 'annulee');

-- CreateEnum
CREATE TYPE "PrioriteRecommandation" AS ENUM ('basse', 'moyenne', 'haute');

-- CreateEnum
CREATE TYPE "StatutRecommandation" AS ENUM ('ouverte', 'en_cours', 'traitee');

-- CreateTable
CREATE TABLE "visites" (
    "id" TEXT NOT NULL,
    "inspecteurId" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "enseignantId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TypeVisite" NOT NULL DEFAULT 'classe',
    "statut" "StatutVisite" NOT NULL DEFAULT 'planifiee',
    "objet" TEXT NOT NULL,
    "observations" TEXT,
    "noteGlobale" DOUBLE PRECISION,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommandations" (
    "id" TEXT NOT NULL,
    "visiteId" TEXT NOT NULL,
    "texte" TEXT NOT NULL,
    "priorite" "PrioriteRecommandation" NOT NULL DEFAULT 'moyenne',
    "statut" "StatutRecommandation" NOT NULL DEFAULT 'ouverte',
    "echeance" TIMESTAMP(3),
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommandations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visites_inspecteurId_idx" ON "visites"("inspecteurId");

-- CreateIndex
CREATE INDEX "visites_etablissementId_idx" ON "visites"("etablissementId");

-- CreateIndex
CREATE INDEX "recommandations_visiteId_idx" ON "recommandations"("visiteId");

-- AddForeignKey
ALTER TABLE "visites" ADD CONSTRAINT "visites_inspecteurId_fkey" FOREIGN KEY ("inspecteurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visites" ADD CONSTRAINT "visites_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "etablissements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visites" ADD CONSTRAINT "visites_enseignantId_fkey" FOREIGN KEY ("enseignantId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommandations" ADD CONSTRAINT "recommandations_visiteId_fkey" FOREIGN KEY ("visiteId") REFERENCES "visites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
