-- CreateTable
CREATE TABLE "cahier_texte" (
    "id" TEXT NOT NULL,
    "classeId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "contenu" TEXT NOT NULL,
    "travailAFaire" TEXT,
    "saisiParId" TEXT NOT NULL,
    "creeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "misAJourLe" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cahier_texte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cahier_texte_classeId_idx" ON "cahier_texte"("classeId");

-- CreateIndex
CREATE INDEX "cahier_texte_disciplineId_idx" ON "cahier_texte"("disciplineId");

-- CreateIndex
CREATE INDEX "cahier_texte_date_idx" ON "cahier_texte"("date");

-- AddForeignKey
ALTER TABLE "cahier_texte" ADD CONSTRAINT "cahier_texte_classeId_fkey" FOREIGN KEY ("classeId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cahier_texte" ADD CONSTRAINT "cahier_texte_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cahier_texte" ADD CONSTRAINT "cahier_texte_saisiParId_fkey" FOREIGN KEY ("saisiParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
