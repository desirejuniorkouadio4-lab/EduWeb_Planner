-- CreateEnum
CREATE TYPE "StatutPresence" AS ENUM ('present', 'absent', 'retard', 'excuse');

-- CreateTable
CREATE TABLE "appels" (
    "id" TEXT NOT NULL,
    "classeId" TEXT NOT NULL,
    "disciplineId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "saisiParId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presences" (
    "id" TEXT NOT NULL,
    "appelId" TEXT NOT NULL,
    "eleveId" TEXT NOT NULL,
    "statut" "StatutPresence" NOT NULL DEFAULT 'present',
    "commentaire" TEXT,

    CONSTRAINT "presences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appels_classeId_idx" ON "appels"("classeId");

-- CreateIndex
CREATE INDEX "appels_date_idx" ON "appels"("date");

-- CreateIndex
CREATE INDEX "presences_eleveId_idx" ON "presences"("eleveId");

-- CreateIndex
CREATE UNIQUE INDEX "presences_appelId_eleveId_key" ON "presences"("appelId", "eleveId");

-- AddForeignKey
ALTER TABLE "appels" ADD CONSTRAINT "appels_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appels" ADD CONSTRAINT "appels_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appels" ADD CONSTRAINT "appels_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_appelId_fkey" FOREIGN KEY ("appelId") REFERENCES "appels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presences" ADD CONSTRAINT "presences_eleveId_fkey" FOREIGN KEY ("eleveId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
